import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { listClothes, createCloth, updateCloth, deleteCloth } from '../controllers/clothesController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

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
router.post('/', authenticateToken, upload.single('image'), createCloth);
router.put('/:id', authenticateToken, upload.single('image'), updateCloth);
router.delete('/:id', authenticateToken, deleteCloth);

export default router;
