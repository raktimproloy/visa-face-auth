export interface S3UploadResponse {
  success: boolean;
  photoUrl?: string;
  fileName?: string;
  error?: string;
}

export const uploadPhotoToS3 = async (
  photoData: string,
  fileName: string = 'selfie.jpg'
): Promise<S3UploadResponse> => {
  try {
    const response = await fetch('/api/upload-photo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        photoData,
        fileName,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Upload failed');
    }

    return result;
  } catch (error) {
    console.error('Error uploading photo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};
