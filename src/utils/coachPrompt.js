// How the AI coach asks Gemini for a cue. Used only by the server function in
// /api/coach.js, so the prompt and key handling stay in one place.
export const DEFAULT_MODEL = 'gemini-2.5-flash-lite';

const ANGLE_NAMES = {
  kneeL: 'left knee',
  kneeR: 'right knee',
  hipL: 'left hip',
  hipR: 'right hip',
  elbowL: 'left elbow',
  elbowR: 'right elbow',
  armRaiseL: 'left arm raise',
  armRaiseR: 'right arm raise',
  trunkLean: 'torso lean from vertical',
};

export const systemPrompt = (sport) => `You are an experienced ${sport} coach watching an athlete train through a camera.

You get one repetition as a single image: three frames side by side, left to right, from the start of the movement, its fastest point, and the end. You also get joint angles measured by pose tracking at those three moments. 180 degrees means a straight joint.

Give ONE correction, the one that would help this athlete most right now.

Rules:
- One sentence, 15 words or fewer, the way a coach would say it out loud.
- Be specific about the body part and what to change.
- Trust the measured angles over your own read of a blurry frame.
- If the frames don't show an athlete clearly, reply only: "I couldn't see that rep clearly."
- No praise, no filler, no explanations. No em dashes.`;

// metrics = { angles: [ {kneeL: 120, ...}, {...}, {...} ] }
export function describeMetrics(metrics) {
  const labels = ['start', 'fastest point', 'end'];
  return (metrics?.angles || [])
    .slice(0, 3)
    .map((frame, i) => {
      const parts = Object.entries(frame || {})
        .filter(([k, v]) => ANGLE_NAMES[k] && Number.isFinite(v))
        .map(([k, v]) => `${ANGLE_NAMES[k]} ${Math.round(v)}`);
      return `${labels[i]}: ${parts.join(', ') || 'not measured'}`;
    })
    .join('\n');
}

export function buildGeminiBody(image, sport, metrics) {
  const angles = describeMetrics(metrics);
  const text = angles
    ? `Sport: ${sport}.\nMeasured angles in degrees:\n${angles}\n\nGive me one coaching cue for this rep.`
    : `Sport: ${sport}. Give me one coaching cue for this rep.`;
  return {
    contents: [
      {
        parts: [{ inline_data: { mime_type: 'image/jpeg', data: image } }, { text }],
      },
    ],
    systemInstruction: { parts: [{ text: systemPrompt(sport) }] },
    generationConfig: {
      // Gemini 2.5 Flash models think by default, and thinking can eat the whole
      // token budget and return no text. A budget of 0 keeps cues fast and short.
      thinkingConfig: { thinkingBudget: 0 },
      maxOutputTokens: 80,
      temperature: 0.4,
    },
  };
}

export function extractCue(data) {
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) return null;
  return text.replace(/^["']|["']$/g, '');
}
