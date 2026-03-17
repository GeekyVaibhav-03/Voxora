const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const fallbackResponse = (fallbackFactory) => {
  try {
    return fallbackFactory();
  } catch {
    return 'AI service fallback failed.';
  }
};

const callOpenAI = async (prompt, fallbackFactory) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return fallbackResponse(fallbackFactory);
  }

  try {
    const response = await fetch(OPENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      return fallbackResponse(fallbackFactory);
    }

    const json = await response.json();
    const content = json?.choices?.[0]?.message?.content?.trim();

    return content || fallbackResponse(fallbackFactory);
  } catch {
    return fallbackResponse(fallbackFactory);
  }
};

export const compareDoubtsUsingAI = async (doubtA, doubtB) => {
  const prompt = `Compare these two doubts and return YES or NO if they are about the same concept.\n\nDoubt A: ${doubtA}\nDoubt B: ${doubtB}`;

  const answer = await callOpenAI(prompt, () => 'NO');
  return String(answer).toUpperCase().includes('YES');
};

export const simplifyTranscript = async (transcript) => {
  const prompt = `Explain the following content in very simple terms for a beginner student. Also include a small example.\n\n${transcript}`;

  return callOpenAI(prompt, () => {
    if (!transcript?.trim()) {
      return 'No recent transcript found. Ask the teacher to continue speaking and try again.';
    }

    const summary = transcript.split('\n').slice(-5).join(' ').slice(0, 280);
    return `Simple explanation: ${summary}. Example: Think of this like learning cycling with training wheels first.`;
  });
};

export const buildConfusionInsight = async (heatmapObject = {}) => {
  const prompt = `Analyze this confusion data and tell where students struggled most.\n\n${JSON.stringify(
    heatmapObject,
    null,
    2,
  )}`;

  return callOpenAI(prompt, () => {
    const entries = Object.entries(heatmapObject);

    if (!entries.length) {
      return 'No confusion spikes yet. Students seem stable so far.';
    }

    const [topBucket, topCount] = entries.reduce((best, current) =>
      current[1] > best[1] ? current : best,
    entries[0]);

    return `Students struggled most around ${topBucket} with ${topCount} confusion signals.`;
  });
};
