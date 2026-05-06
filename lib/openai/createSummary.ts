import OpenAI from "openai";
import { appConfig } from "@/lib/config";

export async function createOpenAiSummary(payload: {
  notes: string[];
  concerns: string[];
  context: string;
}): Promise<string | null> {
  if (!appConfig.openAiConfigured) return null;
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const system = [
      "You summarize family caregiving coordination notes only.",
      "Do not diagnose, triage, or provide treatment advice.",
      "Do not suggest medication or dosage changes.",
      "Do not claim emergency detection or monitoring.",
      "If concerns are present, include: For emergencies, call 911 or your local emergency number.",
      "Use calm concise language and preserve uncertainty.",
    ].join(" ");
    const user = `Context: ${payload.context}\nNotes:\n- ${payload.notes.join("\n- ")}\nConcerns:\n- ${
      payload.concerns.join("\n- ") || "none"
    }`;
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: 800,
    });
    const text = completion.choices[0]?.message?.content?.trim();
    return text || null;
  } catch {
    // Never log message bodies or API errors with sensitive content in production without redaction.
    return null;
  }
}
