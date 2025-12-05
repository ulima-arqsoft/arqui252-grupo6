import { supabase } from '../config/supabase';

const BUCKET_NAME = 'idea-files';

/**
 * Check if the storage bucket exists and is accessible
 */
export async function checkBucketExists(): Promise<boolean> {
    try {
        const { data, error } = await supabase.storage.getBucket(BUCKET_NAME);

        if (error) {
            console.warn(`⚠️ Bucket '${BUCKET_NAME}' check failed:`, error.message);
            // Fallback to listing buckets if getBucket fails (sometimes happens with RLS)
            const { data: buckets, error: listError } = await supabase.storage.listBuckets();
            if (listError) {
                console.error('❌ Failed to list buckets:', listError.message);
                return false;
            }
            return buckets.some(b => b.name === BUCKET_NAME);
        }

        return !!data;
    } catch (error) {
        console.error('❌ Unexpected error checking bucket:', error);
        return false;
    }
}

export interface UploadedFile {
    name: string;
    url: string;
    size: number;
    type: string;
}

/**
 * Upload a single file to Supabase Storage
 */
export async function uploadIdeaFile(
    file: { uri: string; name: string; mimeType?: string; size?: number },
    userId: string
): Promise<UploadedFile | null> {
    try {
        console.log('📤 Starting file upload:', file.name);
        console.log('👤 User ID:', userId);

        // Verify bucket first
        const bucketExists = await checkBucketExists();
        if (!bucketExists) {
            console.error('❌ Cannot upload: Bucket does not exist or is not accessible');
            return null;
        }

        // Generate unique filename
        const timestamp = Date.now();
        // Sanitize filename to remove special characters
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${userId}/${timestamp}_${sanitizedFileName}`;

        console.log('📁 Target path:', fileName);

        // Fetch the file from local URI and convert to ArrayBuffer
        console.log(`🔄 Fetching file from URI: ${file.uri}`);
        let response;
        try {
            response = await fetch(file.uri);
        } catch (fetchError) {
            console.error('❌ Network request failed when fetching local file:', fetchError);
            return null;
        }

        if (!response.ok) {
            console.error(`❌ Failed to fetch file from URI. Status: ${response.status} ${response.statusText}`);
            return null;
        }

        const arrayBuffer = await response.arrayBuffer();
        console.log('✅ File fetched, size:', arrayBuffer.byteLength, 'bytes');

        if (arrayBuffer.byteLength === 0) {
            console.error('❌ File is empty (0 bytes)');
            return null;
        }

        // Convert ArrayBuffer to Uint8Array for Supabase
        const fileData = new Uint8Array(arrayBuffer);

        console.log('☁️ Uploading to Supabase Storage...');

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, fileData, {
                contentType: file.mimeType || 'application/octet-stream',
                upsert: false
            });

        if (error) {
            console.error('❌ Supabase upload error:', {
                message: error.message,
                name: error.name,
                cause: error.cause,
                statusCode: (error as any).statusCode
            });
            return null;
        }

        console.log('✅ Upload successful:', data);

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);

        console.log('🔗 Public URL:', urlData.publicUrl);

        return {
            name: file.name,
            url: urlData.publicUrl,
            size: file.size || arrayBuffer.byteLength,
            type: file.mimeType || 'application/octet-stream'
        };
    } catch (error) {
        console.error('❌ CRITICAL Error in uploadIdeaFile:', error);
        return null;
    }
}

/**
 * Upload multiple files to Supabase Storage
 */
export async function uploadIdeaFiles(
    files: Array<{ uri: string; name: string; mimeType?: string; size?: number }>,
    userId: string
): Promise<UploadedFile[]> {
    console.log(`📤 Uploading ${files.length} files...`);
    const uploadPromises = files.map(file => uploadIdeaFile(file, userId));
    const results = await Promise.all(uploadPromises);

    // Filter out failed uploads
    const successful = results.filter((file): file is UploadedFile => file !== null);
    console.log(`✅ Successfully uploaded ${successful.length}/${files.length} files`);

    return successful;
}

/**
 * Get public URL for a file
 */
export function getFileUrl(filePath: string): string {
    const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    return data.publicUrl;
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteIdeaFile(filePath: string): Promise<boolean> {
    try {
        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath]);

        if (error) {
            console.error('Error deleting file:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error in deleteIdeaFile:', error);
        return false;
    }
}

/**
 * Delete multiple files from Supabase Storage
 */
export async function deleteIdeaFiles(filePaths: string[]): Promise<boolean> {
    try {
        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove(filePaths);

        if (error) {
            console.error('Error deleting files:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error in deleteIdeaFiles:', error);
        return false;
    }
}

/**
 * Check if file is an image
 */
export function isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
