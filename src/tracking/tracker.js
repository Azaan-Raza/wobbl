// Runs MediaPipe's pose and hand models in the browser (WebAssembly, GPU when
// available). Nothing from the camera leaves the device here.
const VERSION = '0.10.35'; // keep in step with package.json
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}/wasm`;
const POSE_MODEL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task';
const HAND_MODEL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

let visionPromise = null;
let posePromise = null;
let handPromise = null;

function vision() {
  visionPromise ??= import('@mediapipe/tasks-vision').then(async (mp) => ({
    mp,
    files: await mp.FilesetResolver.forVisionTasks(WASM_URL),
  }));
  return visionPromise;
}

// Try the GPU first; some machines only manage the CPU.
async function create(Task, files, modelAssetPath, extra) {
  try {
    return await Task.createFromOptions(files, {
      baseOptions: { modelAssetPath, delegate: 'GPU' },
      runningMode: 'VIDEO',
      ...extra,
    });
  } catch {
    return Task.createFromOptions(files, {
      baseOptions: { modelAssetPath, delegate: 'CPU' },
      runningMode: 'VIDEO',
      ...extra,
    });
  }
}

function posePromiseOnce() {
  posePromise ??= vision()
    .then(({ mp, files }) => create(mp.PoseLandmarker, files, POSE_MODEL, { numPoses: 1 }))
    .catch((err) => {
      posePromise = null;
      throw err;
    });
  return posePromise;
}

function handPromiseOnce() {
  handPromise ??= vision()
    .then(({ mp, files }) => create(mp.HandLandmarker, files, HAND_MODEL, { numHands: 2 }))
    .catch((err) => {
      handPromise = null;
      throw err;
    });
  return handPromise;
}

// Loads the models a drill needs. detect(video, t) returns one frame:
// { t, pose, world, hands: [{ points, world, handedness }] }
export async function createTracker({ hands = false } = {}) {
  // End-to-end tests swap in a scripted tracker here. Nothing sets this in the app.
  if (globalThis.__AK_TEST_TRACKER__) return globalThis.__AK_TEST_TRACKER__({ hands });

  const [pose, hand] = await Promise.all([posePromiseOnce(), hands ? handPromiseOnce() : null]);
  let lastTs = -1;

  return {
    detect(video, now) {
      // MediaPipe needs strictly increasing timestamps.
      const ts = now <= lastTs ? lastTs + 1 : now;
      lastTs = ts;

      const p = pose.detectForVideo(video, ts);
      const frame = {
        t: ts,
        pose: p.landmarks?.[0] || null,
        world: p.worldLandmarks?.[0] || null,
        hands: [],
      };
      if (hand) {
        const h = hand.detectForVideo(video, ts);
        const labels = h.handedness || h.handednesses || [];
        frame.hands = (h.landmarks || []).map((points, i) => ({
          points,
          world: h.worldLandmarks?.[i] || null,
          handedness: labels[i]?.[0]?.categoryName || null,
        }));
      }
      return frame;
    },
  };
}
