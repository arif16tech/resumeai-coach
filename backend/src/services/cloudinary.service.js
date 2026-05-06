import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

/**
 * Upload PDF (or any file) to Cloudinary
 * @param {Buffer} buffer - file buffer from multer
 * @param {string} folder - cloudinary folder (default: resumes)
 */
export const uploadToCloudinary = (buffer, filename = 'resume.pdf', folder = 'resumes') => {
  return new Promise((resolve, reject) => {
    if (!buffer) {
      return reject(new Error('No file buffer provided'));
    }

    // Ensure the public_id ends in .pdf so browsers recognize it when using 'raw'
    const baseName = filename.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const publicId = `${baseName}_${Date.now()}.pdf`;

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          return reject(error);
        }
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) {
    throw new Error('Public ID is required');
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);

    return result;
  } catch (error) {
    console.error('Cloudinary Delete Error:', error);
    throw error;
  }
};