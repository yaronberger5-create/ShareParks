import { createBrowserClient } from '@supabase/ssr';

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function uploadImage(file: File, folder: string): Promise<string | null> {
  const supabase = getSupabase();
  const ext = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from('parking-images')
    .upload(fileName, file, { cacheControl: '3600', upsert: false });

  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  const { data } = supabase.storage
    .from('parking-images')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function uploadVerificationDoc(file: File, userId: string, docType: string): Promise<string | null> {
  const supabase = getSupabase();
  const ext = file.name.split('.').pop();
  const fileName = `verification/${userId}/${docType}.${ext}`;

  const { error } = await supabase.storage
    .from('parking-images')
    .upload(fileName, file, { cacheControl: '3600', upsert: true });

  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  const { data } = supabase.storage
    .from('parking-images')
    .getPublicUrl(fileName);

  return data.publicUrl;
}
