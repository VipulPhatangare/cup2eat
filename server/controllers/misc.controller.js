import mongoose from 'mongoose';
import Offer from '../models/Offer.js';
import GalleryItem from '../models/GalleryItem.js';
import Setting from '../models/Setting.js';

export async function activeOffer(req, res) {
  const now = new Date();
  const offer = await Offer.findOne({ isActive: true, startsAt: { $lte: now }, endsAt: { $gt: now } }).sort({ endsAt: 1 });
  res.json(offer); // null when there is no running offer
}

export async function listGallery(req, res) {
  res.json(await GalleryItem.find().sort({ order: 1 }));
}

export async function getSettings(req, res) {
  res.json((await Setting.findOne({ key: 'site' })) || {});
}

export function health(req, res) {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({ ok: true, db: states[mongoose.connection.readyState] });
}
