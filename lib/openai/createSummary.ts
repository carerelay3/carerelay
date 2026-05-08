import { appConfig } from "../config";

export async function createOpenAiSummary(promptData: string): Promise<string | null> {
  if (!appConfig.openAiConfigured) return null;
  
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
            content: "You summarize family-reported care coordination updates. You do not provide medical advice, diagnosis, treatment recommendations, medication dosage guidance, emergency triage, symptom interpretation, clinical interpretation, monitoring claims, or safety guarantees. Only organize what family members reported. Label concerns as items for family review. Keep it short and factual. If emergency-like language appears, only include: 'If this is an emergency, call 911 or your local emergency number.'"
          },
          {
            role: "user",
            content: promptData
          }
        ],
        temperature: 0.2,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices[0]?.message?.content || null;
  } catch (e) {
    return null;
  }
}