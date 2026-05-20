export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { siteData } = req.body;

  if (!siteData || siteData.trim() === '') {
    return res.status(400).json({ error: 'No site data provided.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: `You are a real estate and urban development analyst. When given site or feasibility data, produce a clear, concise summary in plain English. Structure your response with these sections:\n- **Site Overview** (2-3 sentences)\n- **Key Numbers** (bullet points of the most important metrics)\n- **Opportunities** (2-3 bullet points)\n- **Risks or Watch-outs** (2-3 bullet points)\n- **Bottom Line** (1-2 sentences)`,
        messages: [
          { role: 'user', content: `Please summarise the following site/feasibility data:\n\n${siteData}` }
        ],
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const summary = data.content?.[0]?.text || 'No summary returned.';
    return res.status(200).json({ summary });
  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong: ' + err.message });
  }
}
