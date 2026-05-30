import { Injectable, Logger } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream((error, result) => {
        if (error) {
          this.logger.error('Cloudinary upload failed', {
            message: error.message,
            http_code: error.http_code,
            cloud_name: process.env.CLOUDINARY_NAME ? '(set)' : '(missing)',
            api_key: process.env.CLOUDINARY_API_KEY ? '(set)' : '(missing)',
          });
          return reject(error);
        }
        resolve(result);
      });
      toStream(file.buffer).pipe(upload);
    });
  }
}
