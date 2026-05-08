import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { embed, embedMany, generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { z } from 'zod';

export async function generateSignedUploadUrl(bucket: string, path: string) {
  const supabase = await createClient();

  // 1. Verify Authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  // 2. Scope the path to the user to prevent overwriting other users' files
  const securePath = `${user.id}/${path}`;

  // 3. Generate the Signed Upload URL
  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(securePath);

  if (error) throw new Error(error.message);

  return data; // Returns { signedUrl, token, path }
}

export async function listUserFiles(bucket: string) {
  const supabase = await createClient();

  // 1. Verify Authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  // 2. Safely list files only from this user's directory
  const { data, error } = await supabase.storage.from(bucket).list(user.id);
  if (error) throw new Error(error.message);

  return data;
}

export async function searchUserDocuments(query: string) {
  const supabase = await createClient();

  // 1. Verify Authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  // 2. Generate an embedding for the user's search query
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: query,
  });

  // 3. Query the Supabase Vector Index
  const { data, error } = await supabase.storage.vectors
    .from('embeddings-bucket')
    .index('documents')
    .queryVectors({
      queryVector: { float32: embedding },
      topK: 5, // Return the top 5 most relevant chunks
      filter: { user_id: user.id }, // Secure: only search their own docs!
      returnMetadata: true,
    });

  if (error) throw new Error(error.message);

  return data.matches;
}

export async function processAndEmbedDocument(bucket: string, path: string) {
  const supabase = await createClient();

  // 1. Verify Authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  // 2. Download the file from storage
  const securePath = `${user.id}/${path}`;
  const { data: fileData, error: downloadError } = await supabase.storage.from(bucket).download(securePath);
  
  if (downloadError || !fileData) throw new Error('Failed to download file for processing');

  // 3. Extract text based on file type
  let text = '';
  const buffer = Buffer.from(await fileData.arrayBuffer());
  
  if (path.toLowerCase().endsWith('.pdf')) {
    const pdfData = await pdfParse(buffer);
    text = pdfData.text;
  } else if (path.toLowerCase().endsWith('.docx')) {
    const docxData = await mammoth.extractRawText({ buffer });
    text = docxData.value;
  } else {
    // Fallback for plain text, csv, markdown, etc.
    text = await fileData.text();
  }

  // 4. Text chunker with overlap to preserve semantic context across boundaries
  const chunkSize = 1000;
  const chunkOverlap = 200;
  const chunks: string[] = [];
  
  for (let i = 0; i < text.length; i += (chunkSize - chunkOverlap)) {
    chunks.push(text.substring(i, i + chunkSize));
  }

  // 5. Generate embeddings for all chunks
  const { embeddings } = await embedMany({
    model: openai.embedding('text-embedding-3-small'),
    values: chunks,
  });

  // 6. Insert vectors into the Vector Bucket
  const index = supabase.storage.vectors.from('embeddings-bucket').index('documents');
  
  const vectors = chunks.map((chunk, i) => ({
    key: `${user.id}_${path}_chunk_${i}`,
    data: { float32: embeddings[i] },
    metadata: { user_id: user.id, title: path, text_content: chunk }
  }));

  const { error: insertError } = await index.putVectors({ vectors });
  if (insertError) throw new Error(insertError.message);

  return { success: true, chunksProcessed: chunks.length };
}

export async function extractMedicalInsights(bucket: string, path: string) {
  const supabase = await createClient();

  // 1. Verify Authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  // 2. Safely download the document as a buffer from user's isolated folder
  const securePath = `${user.id}/${path}`;
  const { data: fileData, error: downloadError } = await supabase.storage.from(bucket).download(securePath);
  
  if (downloadError || !fileData) throw new Error('Failed to download medical document for processing');
  const arrayBuffer = await fileData.arrayBuffer();

  // 3. Utilize GPT-4o's Vision and Structured Outputs to parse handwriting and extract NLP semantics
  const { object } = await generateObject({
    model: openai('gpt-4o'),
    schema: z.object({
      transcription: z.string().describe("The full digitized text from the document. Correct any illegible handwriting to the best of your ability using clinical and semantic context."),
      diagnoses: z.array(z.string()).describe("A list of medical diagnoses or conditions identified in the text."),
      prescriptions: z.array(z.object({
        medication: z.string(),
        dosage: z.string().optional(),
        frequency: z.string().optional(),
        duration: z.string().optional()
      })).describe("List of prescribed medications and their instructions."),
      instructions: z.array(z.string()).describe("Patient instructions, care plans, or follow-up steps."),
      isFlaggedForReview: z.boolean().describe("True if the handwriting is too illegible or ambiguous to be highly confident in the clinical transcription.")
    }),
    messages: [
      {
        role: 'user',
        content: [
          { 
            type: 'text', 
            text: 'You are an expert medical transcriptionist and clinical analyst. Please analyze this document (which may contain messy handwritten doctor\'s notes). Digitise the raw text, apply semantic error correction based on standard medical terminology, and structure the insights accurately.' 
          },
          { type: 'image', image: arrayBuffer }
        ]
      }
    ]
  });

  return object;
}

export async function extractMedicalInsightsBackground(bucket: string, path: string, userId: string, recordId: string) {
  // Use the admin client to bypass RLS since background jobs do not have the user's cookie
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const securePath = `${userId}/${path}`;
  const { data: fileData, error: downloadError } = await supabaseAdmin.storage.from(bucket).download(securePath);
  
  if (downloadError || !fileData) throw new Error('Failed to download medical document for processing');
  const arrayBuffer = await fileData.arrayBuffer();

  const { object } = await generateObject({
    model: openai('gpt-4o'),
    schema: z.object({
      transcription: z.string().describe("The full digitized text from the document. Correct any illegible handwriting to the best of your ability using clinical and semantic context."),
      diagnoses: z.array(z.string()).describe("A list of medical diagnoses or conditions identified in the text."),
      prescriptions: z.array(z.object({
        medication: z.string(),
        dosage: z.string().optional(),
        frequency: z.string().optional(),
        duration: z.string().optional()
      })).describe("List of prescribed medications and their instructions."),
      instructions: z.array(z.string()).describe("Patient instructions, care plans, or follow-up steps."),
      isFlaggedForReview: z.boolean().describe("True if the handwriting is too illegible or ambiguous to be highly confident in the clinical transcription.")
    }),
    messages: [
      { role: 'user', content: [
        { type: 'text', text: 'You are an expert medical transcriptionist and clinical analyst. Please analyze this document. Digitise the raw text, apply semantic error correction based on standard medical terminology, and structure the insights accurately.' },
        { type: 'image', image: arrayBuffer }
      ]}
    ]
  });

  // Save the extracted insights to Supabase and mark the job as completed
  const { error: updateError } = await supabaseAdmin
    .from('patient_insights')
    .update({
      status: 'completed',
      transcription: object.transcription,
      diagnoses: object.diagnoses,
      prescriptions: object.prescriptions,
      instructions: object.instructions,
      is_flagged: object.isFlaggedForReview
    })
    .eq('id', recordId);
    
  if (updateError) throw new Error(`Failed to save insights: ${updateError.message}`);

  return object;
}