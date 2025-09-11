import { Router } from 'express';
import multer from 'multer';
import { listClothes, createCloth, updateCloth, deleteCloth, bulkUpdateClothes, patchCloth } from '../controllers/clothesController.js';
import { authenticateToken } from '../middleware/auth.js';
import { uploadRateLimit } from '../middleware/security.js';

const router = Router();

// Configure multer for file uploads to memory (for Supabase upload)
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// All routes require authentication
router.get('/', authenticateToken, listClothes);
router.post('/', authenticateToken, uploadRateLimit, upload.single('image'), createCloth);
router.put('/:id', authenticateToken, uploadRateLimit, upload.single('image'), updateCloth);
router.patch('/:id', authenticateToken, patchCloth);
router.delete('/:id', authenticateToken, deleteCloth);

// Bulk operations
router.patch('/bulk', authenticateToken, bulkUpdateClothes);

export default router;
