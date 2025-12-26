import cloudinary from '../config/cloudinary';
import { UploadApiResponse } from 'cloudinary';

export class UploadService {
  /**
   * Upload image to Cloudinary
   */
  static async uploadImage(
    buffer: Buffer,
    folder: string,
    filename?: string
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `job-platform/${folder}`,
          public_id: filename,
          resource_type: 'auto',
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!);
        }
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Delete image from Cloudinary
   */
  static async deleteImage(publicId: string): Promise<any> {
    try {
      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }
}

export default UploadService;
