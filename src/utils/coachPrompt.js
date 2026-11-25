// Everything about how a cue is asked for, shared by the server function in
// /api/coach.js. Kept out of the client so the prompt and key handling live in
// one place on the server.
export const DEFAULT_MODEL = 'gemini-2.5-flash-lite';

export const systemPrompt = (sport) => `You are an elite ${sport} coach analyzing a single frame from a live video feed of an athlete training.

Your job is to give ONE piece of concise, actionable coaching feedback based on what you can see in the image. Focus on body mechanics, posture, form, positioning, or technique, whichever matters most in this frame.

Rules:
- Maximum 1 sentence. 15 words or fewer.
- Be specific and direct, like a real coach would speak out loud.
- If the image is unclear, dark, or shows no athlete, respond only with: "Adjust your camera position."
- Do not use filler phrases like "Great job" or "Keep it up."
- Do not explain what you're doing. Just give the feedback.
- Use plain punctuation. Do not use em dashes.

Example outputs:
- "Drive your elbow in closer on the release."
- "Bend your knees more on landing."
- "Keep your back straight through the lift."
- "Weight is too far forward, shift back to your heels."`;

export function buildGeminiBody(base64Frame, sport) {
  return {
    contents: [
      {
        parts: [
          { inline_data: { mime_type: 'image/jpeg', data: base64Frame } },
          { text: `Analyze this frame. I am training ${sport}. Give me one coaching cue.` },
        ],
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
  // Strip wrapping quotes the model may add around a short cue.
  return text.replace(/^["']|["']$/g, '');
}
