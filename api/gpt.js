import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "당신은 수면 전문가입니다. 사용자의 수면 패턴을 기반으로 수면 문제를 분석하고 솔루션을 제공합니다. 결과는 반드시 다음 JSON 형식으로 반환하세요: { \"summary\": \"요약 설명\", \"issues\": [\"문제1\", \"문제2\"], \"suggestions\": [\"솔루션1\", \"솔루션2\"] }",
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
    });

    const gptReply = completion.choices[0].message.content;

    console.log("GPT 응답 내용:", gptReply);

    // JSON 파싱 시도
    try {
      const result = JSON.parse(gptReply);
      return res.status(200).json({ result });
    } catch (parseError) {
      console.error("❌ JSON 파싱 실패:", parseError);
      return res.status(500).json({ error: "GPT 응답 파싱 실패" });
    }
  } catch (error) {
    console.error("❌ GPT 요청 실패:", error);
    return res.status(500).json({ error: "GPT 요청 실패" });
  }
}
