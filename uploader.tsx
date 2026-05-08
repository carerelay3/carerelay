'use client';

import { useState } from 'react';
import { getUploadUrlAction, processDocumentAction } from '@/app/actions/storage-actions';
import { createBrowserClient } from '@supabase/ssr';

export function Uploader() {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Get the signed URL and token from our Next.js backend
      const result = await getUploadUrlAction('my-bucket', file.name);
      
      if (result.error || !result.data) {
        throw new Error(result.error || 'Failed to get upload URL');
      }

      const { token, path } = result.data;

      // 2. Initialize a lightweight Supabase client for the browser
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // 3. Upload the file directly to Supabase Storage using the token
      const { data, error } = await supabase
        .storage
        .from('my-bucket')
        .uploadToSignedUrl(path, token, file);

      if (error) throw error;
      
      // 4. Trigger the ingestion pipeline to split and embed the document
      const processResult = await processDocumentAction('my-bucket', file.name);
      if (processResult.error) {
        console.warn('File uploaded, but processing failed:', processResult.error);
      }

      alert('Upload and processing successful!');
      console.log('File uploaded to:', data?.fullPath);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Check console for details.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} disabled={uploading} />
      {uploading && <p>Uploading...</p>}
    </div>
  );
}