import { appConfig } from "../config";

type SummaryPromptData = string | { notes?: string[]; concerns?: string[]; context?: string };

export async function createOpenAiSummary(promptData: SummaryPromptData): Promise<string | null> {
  if (!appConfig.openAiConfigured) return null;
  const prompt =
    typeof promptData === "string"
      ? promptData
      : [
          promptData.context,
          promptData.notes?.length ? `Notes: ${promptData.notes.join("; ")}` : undefined,
          promptData.concerns?.length ? `Concerns for family review: ${promptData.concerns.join("; ")}` : undefined,
        ]
          .filter(Boolean)
          .join("\n");
  
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${appConfig.openAiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Summarize these family-reported care coordination updates. Do not provide medical advice, diagnosis, treatment recommendations, medication dosage guidance, emergency triage, symptom interpretation, clinical interpretation, monitoring claims, or safety guarantees. Only organize what family members reported. Label concerns as items for family review. If emergency-like language appears, only include: 'If this is an emergency, call 911 or your local emergency number.'"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices[0]?.message?.content || null;
  } catch {
    return null;
  }
}
