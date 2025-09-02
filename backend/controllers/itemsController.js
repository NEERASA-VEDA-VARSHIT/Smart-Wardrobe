import { WardrobeItem } from '../models/WardrobeItem.js';

export async function createItem(req, res) {
  const { name, type, color, lastUsed } = req.body;
  if (!name || !type || !color) {
    return res.status(400).json({ success: false, message: 'name, type, color are required' });
  }
  const item = await WardrobeItem.create({ name, type, color, lastUsed: lastUsed || null });
  res.status(201).json({ success: true, data: item });
}

export async function listItems(req, res) {
  const items = await WardrobeItem.find().sort({ createdAt: -1 });
  res.json({ success: true, data: items });
}

export async function getItem(req, res) {
  const { id } = req.params;
  const item = await WardrobeItem.findById(id);
  if (!item) return res.status(404).json({ success: false, message: 'not found' });
  res.json({ success: true, data: item });
}

export async function updateItem(req, res) {
  const { id } = req.params;
  const updates = req.body;
  const item = await WardrobeItem.findByIdAndUpdate(id, updates, { new: true });
  if (!item) return res.status(404).json({ success: false, message: 'not found' });
  res.json({ success: true, data: item });
}

export async function deleteItem(req, res) {
  const { id } = req.params;
  const item = await WardrobeItem.findByIdAndDelete(id);
  if (!item) return res.status(404).json({ success: false, message: 'not found' });
  res.json({ success: true, message: 'deleted' });
}
