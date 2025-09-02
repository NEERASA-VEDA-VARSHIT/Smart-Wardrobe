import { Cloth } from '../models/Cloth.js';

export async function listClothes(req, res) {
  const items = await Cloth.find().sort({ createdAt: -1 });
  res.json({ success: true, data: items });
}

export async function createCloth(req, res) {
  const { name, image, worn = false, lastWorn = null, washed = true } = req.body;
  if (!name || !image) {
    return res.status(400).json({ success: false, message: 'name and image are required' });
  }
  const item = await Cloth.create({ name, image, worn, lastWorn, washed });
  res.status(201).json({ success: true, data: item });
}

export async function updateCloth(req, res) {
  const { id } = req.params;
  const updates = req.body;
  const item = await Cloth.findByIdAndUpdate(id, updates, { new: true });
  if (!item) return res.status(404).json({ success: false, message: 'not found' });
  res.json({ success: true, data: item });
}

export async function deleteCloth(req, res) {
  const { id } = req.params;
  const item = await Cloth.findByIdAndDelete(id);
  if (!item) return res.status(404).json({ success: false, message: 'not found' });
  res.json({ success: true, message: 'deleted' });
}
