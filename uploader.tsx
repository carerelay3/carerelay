'use client';

import { useState, useEffect } from 'react';
import { getUploadUrlAction, analyzeMedicalNoteAction } from '@/app/actions/storage-actions';
import { createBrowserClient } from '@supabase/ssr';

export function Uploader() {
  const [uploading, setUploading] = useState(false);
  const [processingRecordId, setProcessingRecordId] = useState<string | null>(null);
  const [insights, setInsights] = useState<any>(null);

  // Initialize client at the component level for Realtime subscriptions
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Listen for background job completion using Supabase Realtime
  useEffect(() => {
    if (!processingRecordId) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'patient_insights',
          filter: `id=eq.${processingRecordId}`
        },
        (payload) => {
          if (payload.new.status === 'completed') {
            setInsights(payload.new);
            setProcessingRecordId(null);
            setUploading(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [processingRecordId, supabase]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setInsights(null);
    try {
      // 1. Get the signed URL and token from our Next.js backend
      const result = await getUploadUrlAction('my-bucket', file.name);
      
      if (result.error || !result.data) {
        throw new Error(result.error || 'Failed to get upload URL');
      }

      const { token, path } = result.data;

      // 3. Upload the file directly to Supabase Storage using the token
      const { data, error } = await supabase
        .storage
        .from('my-bucket')
        .uploadToSignedUrl(path, token, file);

      if (error) throw error;
      
      // 4. Trigger the async Medical OCR background job
      const processResult = await analyzeMedicalNoteAction('my-bucket', file.name);
      if (processResult.error || !processResult.recordId) {
        throw new Error(processResult.error || 'Failed to start processing');
      }

      // Save the record ID to trigger the Realtime subscription listener
      setProcessingRecordId(processResult.recordId);
      console.log('File uploaded. Awaiting background extraction for record:', processResult.recordId);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Check console for details.');
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <input type="file" onChange={handleUpload} disabled={uploading || !!processingRecordId} className="block w-full text-sm text-content-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-semantic-info file:text-white hover:file:bg-blue-600" />
        {(uploading || processingRecordId) && <p className="mt-2 text-semantic-warning text-sm font-medium animate-pulse">Uploading and analyzing medical document... (This may take up to a minute)</p>}
      </div>
      
      {/* Display Extracted Data */}
      {insights && (
        <div className="bg-surface-elevated border border-surface-overlay p-5 rounded-lg shadow-md animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-lg font-bold text-semantic-success mb-4 flex items-center gap-2"><span>✓</span> Clinical Insights Extracted</h3>
          {insights.is_flagged && (
            <div className="bg-semantic-alert/10 text-semantic-alert border border-semantic-alert/30 p-3 rounded mb-4 text-sm flex items-center gap-2">
              <span>⚠️</span> Handwriting was highly illegible. Flagged for manual review.
            </div>
          )}
          <div className="space-y-5">
            <div>
              <h4 className="font-semibold text-content-secondary text-xs uppercase tracking-wider mb-2">Diagnoses</h4>
              <ul className="list-disc list-inside ml-2 text-content-primary text-sm">
                {insights.diagnoses?.map((d: string, i: number) => <li key={i}>{d}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-content-secondary text-xs uppercase tracking-wider mb-2">Prescriptions</h4>
              <ul className="list-disc list-inside ml-2 text-content-primary text-sm">
                {insights.prescriptions?.map((p: any, i: number) => (
                  <li key={i}>
                    <strong>{p.medication}</strong> - {p.dosage} <span className="text-content-secondary">({p.frequency})</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-content-secondary text-xs uppercase tracking-wider mb-2">Transcription</h4>
              <p className="text-sm text-content-primary whitespace-pre-wrap bg-surface-base p-3 rounded border border-surface-overlay font-mono leading-relaxed">{insights.transcription}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}