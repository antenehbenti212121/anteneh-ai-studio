export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not configured in Vercel.' });
  }

  try {
    const { topic, length, style } = req.body || {};
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'A video topic is required.' });
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-5.6-luna',
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text: 'You are the educational video script planner for Anteneh AI Studio. Create a clear, accurate, engaging lesson for the requested audience. Return ONLY valid JSON with this exact shape: {"title":"...","hook":"...","scenes":[{"title":"...","narration":"...","visual":"..."}],"recap":"..."}. Create 4 to 8 scenes depending on requested length. Keep narration concise and suitable for voiceover. Visual descriptions should be practical for future AI image/video generation.'
              }
            ]
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: `Topic: ${topic}\nLength: ${length || '60 sec'}\nVisual style: ${style || 'Clean explainer'}`
              }
            ]
          }
        ],
        max_output_tokens: 2200
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || 'OpenAI request failed.' });
    }

    let text = data.output_text || '';
    text = text.trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '');

    let script;
    try {
      script = JSON.parse(text);
    } catch {
      return res.status(502).json({ error: 'The AI returned an invalid script format.' });
    }

    return res.status(200).json({ script });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Unexpected server error.' });
  }
}
