import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { destination, days, startDate, budget, preferences } = await req.json();

  if (!destination || !days || !startDate) {
    return NextResponse.json({ error: "缺少必要參數" }, { status: 400 });
  }

  const prompt = `你是一位專業的旅遊規劃師。請為以下旅遊需求生成詳細的行程規劃。

目的地：${destination}
天數：${days} 天
出發日期：${startDate}
預算：${budget ? `約 NT$${budget}` : "未指定"}
偏好：${preferences || "無特別偏好"}

請以 JSON 格式回傳，結構如下：
{
  "title": "行程標題",
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "activities": [
        {
          "id": "唯一ID字串",
          "time": "09:00",
          "title": "活動名稱",
          "description": "詳細說明（100字以內）",
          "location": "地點名稱",
          "category": "food|attraction|transport|accommodation|other",
          "estimatedCost": 數字（台幣）
        }
      ]
    }
  ],
  "totalBudget": 預估總花費數字
}

注意：
- 每天安排 4-6 個活動
- 時間安排要合理，考慮交通時間
- 費用要符合當地物價
- 只回傳 JSON，不要有其他文字`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("非預期回應格式");

    const jsonText = content.text.replace(/```json\n?|\n?```/g, "").trim();
    const itineraryData = JSON.parse(jsonText);

    return NextResponse.json(itineraryData);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "行程生成失敗，請稍後再試" }, { status: 500 });
  }
}
