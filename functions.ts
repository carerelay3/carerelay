import { inngest } from "./client";
import { extractMedicalInsightsBackground } from "@/lib/data/storage";

export const processMedicalNote = inngest.createFunction(
  { id: "process-medical-note" },
  { event: "medical/process.note" },
  async ({ event, step }) => {
    const { bucket, fileName, userId } = event.data;

    // Run the heavy OpenAI extraction asynchronously
    const insights = await step.run("extract-insights", async () => {
      return await extractMedicalInsightsBackground(bucket, fileName, userId);
    });

    // Returning data here marks the job as successful in the Inngest dashboard
    // You could also trigger a push notification or email to the user here!
    return { success: true, insights };
  }
);