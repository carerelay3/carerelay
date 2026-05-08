'use server';

import { generateSignedUploadUrl, processAndEmbedDocument, extractMedicalInsights } from '@/lib/data/storage';
import { inngest } from '@/inngest/client';
import { createClient } from '@/lib/supabase/server';

export async function getUploadUrlAction(bucket: string, fileName: string) {
  try {
    // Ensure file names are safe and don't contain directory traversal characters
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const data = await generateSignedUploadUrl(bucket, safeFileName);
    return { success: true, data };
  } catch (error: any) {
    return { error: error.message || 'An unexpected error occurred' };
  }
}

export async function analyzeMedicalNoteAction(bucket: string, fileName: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    // 1. Create a pending record in Supabase to track the background job
    const { data: record, error: dbError } = await supabase
      .from('patient_insights')
      .insert([{ user_id: user.id, file_name: safeFileName, status: 'processing' }])
      .select()
      .single();
      
    if (dbError) throw new Error(`Database error: ${dbError.message}`);

    // 2. Fire-and-forget background job with the record ID
    await inngest.send({
      name: 'medical/process.note',
      data: { bucket, fileName: safeFileName, userId: user.id, recordId: record.id }
    });

    return { success: true, recordId: record.id };
  } catch (error: any) {
    return { error: error.message || 'Failed to extract medical insights' };
  }
}

export async function processDocumentAction(bucket: string, fileName: string) {
  try {
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const data = await processAndEmbedDocument(bucket, safeFileName);
    return { success: true, data };
  } catch (error: any) {
    return { error: error.message || 'An unexpected error occurred' };
  }
}