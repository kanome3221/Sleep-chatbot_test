export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: '당신은 수면 전문가 AI입니다. 사용자의 수면 패턴을 분석하고, 수면 질 개선을 위한 맞춤 솔루션과 리포트를 제공합니다. 간결하고 시각적으로 보기 좋게 포맷하세요.' },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '분석에 실패했습니다.';
    res.status(200).json({ reply });

  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
}
