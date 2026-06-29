import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AuthService } from '../services/AuthService.js';
import { walletTopUpSchema } from '../validators/schemas.js';

export class AuthController {
  private authService = new AuthService();

  getMe = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      res.json(req.user);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  topUpWallet = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

      // Zod validation
      const validation = walletTopUpSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues[0].message });
      }

      const { amount } = validation.data;
      const updatedUser = await this.authService.topUpWallet(
        req.user.id,
        req.user.name,
        req.user.email,
        amount
      );
      res.json(updatedUser);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  uploadAvatar = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded' });
      }

      const { getCloudinary } = await import('../utils/cloudinary.js');
      const cloudinaryClient = getCloudinary();
      let imageUrl = '';

      if (cloudinaryClient) {
        // Upload buffer to Cloudinary using upload_stream
        const uploadResult = await new Promise<any>((resolve, reject) => {
          const stream = cloudinaryClient.uploader.upload_stream(
            { folder: 'daymates_avatars' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.file!.buffer);
        });
        imageUrl = uploadResult.secure_url;
      } else {
        // Fallback: convert to base64 data-URL so that it works perfectly without credentials!
        const base64Str = req.file.buffer.toString('base64');
        imageUrl = `data:${req.file.mimetype};base64,${base64Str}`;
      }

      // Update in database using AuthService
      const updatedUser = await this.authService.updateAvatar(req.user.id, req.user.name, req.user.email, imageUrl);
      res.json(updatedUser);
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      res.status(500).json({ error: err.message || 'Failed to upload picture' });
    }
  };
}
