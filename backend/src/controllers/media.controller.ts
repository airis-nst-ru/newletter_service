import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import ApiResponse from '../utils/response.util';

export const uploadMedia = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return ApiResponse(res, 400, 'No file provided');
        }

        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        const result = await cloudinary.uploader.upload(dataURI, {
            resource_type: 'auto',
            folder: 'newsletter_assets'
        });

        return ApiResponse(res, 200, 'File uploaded successfully', { url: result.secure_url });
    } catch (error: any) {
        console.error('Upload error:', error);
        return ApiResponse(res, 500, error.message || 'Error uploading file');
    }
};

export const listMedia = async (req: Request, res: Response) => {
    try {
        const result = await cloudinary.search
            .expression('folder:newsletter_assets')
            .sort_by('created_at', 'desc')
            .max_results(30)
            .execute();

        const files = result.resources.map((file: any) => ({
            url: file.secure_url,
            public_id: file.public_id,
            format: file.format,
            created_at: file.created_at,
        }));

        return ApiResponse(res, 200, 'Media files retrieved successfully', { files });
    } catch (error: any) {
        console.error('List media error:', error);
        return ApiResponse(res, 500, error.message || 'Error retrieving media files');
    }
};
