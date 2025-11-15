import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type CulturalItem = {
  type: "museum" | "event" | "exhibition" | "festival" | "cultural_place";
  name: string;
  city?: string;
  country?: string;
  description?: string;
  date?: string;
};

export async function POST(req: Request) {
  const { prompt } = await req.json();

  if (!prompt)
    return NextResponse.json({ error: "No prompt provided" }, { status: 400 });

  const systemPrompt = `
You are a global culture, museums, and entertainment assistant.
The user may ask about ANYTHING related to:
- museums (worldwide)
- culture
- exhibitions
- festivals
- historical places
- entertainment events
- travel-related cultural activities
- worldwide recommendations

Always respond with ONLY a valid JSON object (no markdown, no commentary).
Your response must have EXACTLY these keys:

1. "text": A short, friendly summary sentence answering the question
2. "items": An array of cultural objects

Each item must follow this schema:
{
  "type": "museum" | "event" | "exhibition" | "festival" | "cultural_place",
  "name": "Name of the place/event",
  "city": "City (optional)",
  "country": "Country (optional)",
  "description": "Short description",
  "date": "Date or period if applicable (optional)"
}

Example response:
{
  "text": "Here are some major art events happening worldwide:",
  "items": [
    {
      "type": "exhibition",
      "name": "Venice Biennale",
      "city": "Venice",
      "country": "Italy",
      "description": "A world-famous contemporary art exhibition",
      "date": "April 2025 – November 2025"
    }
  ]
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1", // or your preferred model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: 700,
    });

    const content = completion.choices[0].message.content || "";

    // Parse JSON safely
    let parsed: { text?: string; items?: CulturalItem[] } = { text: content };
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {}
      }
    }

    if (!Array.isArray(parsed.items)) parsed.items = [];

    return NextResponse.json({
      text: parsed.text || "",
      items: parsed.items,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "AI generation failed." },
      { status: 500 }
    );
  }
}
