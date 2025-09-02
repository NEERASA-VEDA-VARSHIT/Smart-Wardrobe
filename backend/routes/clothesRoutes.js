import { Router } from 'express';
import { listClothes, createCloth, updateCloth, deleteCloth } from '../controllers/clothesController.js';

const router = Router();

router.get('/', listClothes);
router.post('/', createCloth);
router.put('/:id', updateCloth);
router.delete('/:id', deleteCloth);

export default router;
