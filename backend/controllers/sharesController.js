import crypto from 'crypto';
import { Share } from '../models/Share.js';
import { User } from '../models/User.js';

export async function inviteFriend(req, res) {
  try {
    const ownerId = req.user._id;
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'email required' });

    const inviteCode = crypto.randomBytes(8).toString('hex');

    const share = await Share.create({ ownerId, friendEmail: email.toLowerCase(), inviteCode });
    res.status(201).json({ success: true, data: share });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to create invite', error: e.message });
  }
}

export async function acceptInvite(req, res) {
  try {
    const userId = req.user._id;
    const { code } = req.body;
    const share = await Share.findOne({ inviteCode: code, status: 'pending' });
    if (!share) return res.status(404).json({ success: false, message: 'Invalid invite' });

    // Validate recipient email matches logged-in user
    const user = await User.findById(userId);
    if (!user || user.email.toLowerCase() !== share.friendEmail) {
      return res.status(403).json({ success: false, message: 'Invite not addressed to this user' });
    }

    share.status = 'accepted';
    share.friendId = userId;
    await share.save();

    res.json({ success: true, data: share });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to accept invite', error: e.message });
  }
}

export async function listMyShares(req, res) {
  try {
    const userId = req.user._id;
    const outgoing = await Share.find({ ownerId: userId })
      .populate('friendId', 'name email')
      .sort({ createdAt: -1 });
    const incoming = await Share.find({ friendId: userId, status: 'accepted' })
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: { outgoing, incoming } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to load shares', error: e.message });
  }
}

export async function revokeShare(req, res) {
  const userId = req.user._id;
  const { id } = req.params;
  const share = await Share.findOneAndUpdate({ _id: id, ownerId: userId }, { status: 'revoked' }, { new: true });
  if (!share) return res.status(404).json({ success: false, message: 'not found' });
  res.json({ success: true, data: share });
}


