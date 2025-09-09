import crypto from 'crypto';
import { Collection } from '../models/Collection.js';
import { Cloth } from '../models/Cloth.js';

export async function createOrUpdateCollection(req, res) {
  try {
    const ownerId = req.user.id;
    const { id, name, itemIds = [], permissions = 'stylist' } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'name required' });
    // validate items belong to owner
    const count = await Cloth.countDocuments({ _id: { $in: itemIds }, userId: ownerId });
    if (count !== itemIds.length) return res.status(400).json({ success: false, message: 'Invalid items' });
    let doc;
    if (id) {
      doc = await Collection.findOneAndUpdate({ _id: id, ownerId }, { name, itemIds, permissions }, { new: true });
    } else {
      const shareToken = crypto.randomBytes(12).toString('hex');
      doc = await Collection.create({ ownerId, name, itemIds, permissions, shareToken });
    }
    res.status(201).json({ success: true, data: doc });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to save collection' });
  }
}

export async function listMyCollections(req, res) {
  try {
    const ownerId = req.user.id;
    const docs = await Collection.find({ ownerId }).sort({ updatedAt: -1 });
    res.json({ success: true, data: docs });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to list collections' });
  }
}

export async function getCollection(req, res) {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;
    const doc = await Collection.findOne({ _id: id, ownerId });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: doc });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to get collection' });
  }
}

export async function deleteCollection(req, res) {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;
    await Collection.deleteOne({ _id: id, ownerId });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to delete collection' });
  }
}

export async function inviteToCollection(req, res) {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;
    const { emails = [] } = req.body;
    const doc = await Collection.findOne({ _id: id, ownerId });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    const unique = Array.from(new Set([...(doc.invitedEmails || []), ...emails]));
    doc.invitedEmails = unique;
    await doc.save();
    const shareLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/stylist/${ownerId}?collection=${doc._id}`;
    // Email sending can be added here; respond with link
    res.json({ success: true, data: { shareLink, invitedEmails: unique } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to invite' });
  }
}

export async function getSharedCollectionByToken(req, res) {
  try {
    const { token } = req.params;
    const col = await Collection.findOne({ shareToken: token });
    if (!col) return res.status(404).json({ success: false, message: 'Not found' });
    const items = await Cloth.find({ _id: { $in: col.itemIds } });
    res.json({ success: true, data: { collection: col, items } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to load shared collection' });
  }
}

export async function listInvitedCollections(req, res) {
  try {
    const email = req.user?.email;
    if (!email) return res.status(400).json({ success: false, message: 'User email missing' });
    const docs = await Collection.find({ invitedEmails: email }).sort({ updatedAt: -1 });
    res.json({ success: true, data: docs });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to list invited collections' });
  }
}


