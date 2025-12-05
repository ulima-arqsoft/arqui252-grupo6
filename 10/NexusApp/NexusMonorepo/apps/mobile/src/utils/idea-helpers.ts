import { uploadIdeaFiles } from './storage-utils';

/**
 * Process idea form data and upload files to Supabase Storage
 * Returns form data with file URLs instead of local URIs
 */
export async function processIdeaFiles(formData: any, userId: string): Promise<any> {
    // If no files, return as is
    if (!formData.files || formData.files.length === 0) {
        return formData;
    }

    try {
        console.log(`📤 Uploading ${formData.files.length} files...`);

        // Upload files to Supabase Storage
        const uploadedFiles = await uploadIdeaFiles(formData.files, userId);

        console.log(`✅ Uploaded ${uploadedFiles.length} files successfully`);

        // Return form data with uploaded file URLs
        return {
            ...formData,
            files: uploadedFiles
        };
    } catch (error) {
        console.error('Error uploading files:', error);
        // Return without files if upload fails
        return {
            ...formData,
            files: []
        };
    }
}
