// Loads the real content from assets/info.md into the local MongoDB.  Run: npm run seed
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Product from '../models/Product.js';
import Offer from '../models/Offer.js';
import GalleryItem from '../models/GalleryItem.js';
import Setting from '../models/Setting.js';

await connectDB();

// NOTE: reviews and enquiries are deliberately NOT touched/seeded.
// Retail prices (the Rs 75-89 pack poster) are not seeded either: they conflict with the rest of assets/info.md.
await Promise.all([Product.deleteMany({}), Offer.deleteMany({}), GalleryItem.deleteMany({}), Setting.deleteMany({})]);

await Product.insertMany([
  {
    name: 'Edible Cup 100 ml',
    slug: 'cup-100ml',
    tagline: 'For chai, coffee & ice cream',
    capacityMl: 100,
    usage: ['Chai', 'Coffee', 'Ice cream'],
    flavours: ['Chocolate', 'Vanilla', 'Elaichi'],
    features: ['100% edible', 'Leak-proof', 'Pure veg & vegan', 'Delivery included all over India'],
    wholesale: { cups: 396, price: 3999 },
    deliveryIncluded: true,
    image: '/uploads/site/cup-latte.webp',
    order: 1,
  },
  {
    name: 'Edible Cup 150 ml',
    slug: 'cup-150ml',
    tagline: 'For cold coffee & shake glasses',
    capacityMl: 150,
    usage: ['Cold coffee', 'Shakes'],
    flavours: ['Chocolate'],
    features: ['100% edible', 'Eco-friendly', 'Sustainable', 'Delivery included all over India'],
    wholesale: { cups: 432, price: 6500 },
    deliveryIncluded: true,
    image: '/uploads/site/cup-bite.webp',
    order: 2,
  },
]);

// offer valid till the end of the current month (assets/info.md: "Offer valid till this month")
const now = new Date();
const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
await Offer.create({
  title: 'Big savings, bigger opportunities!',
  text: '396 edible cups for just ₹3,999, delivery included',
  startsAt: new Date(now.getFullYear(), now.getMonth(), 1),
  endsAt: endOfMonth,
  isActive: true,
});

await GalleryItem.insertMany([
  { title: 'Cup Khaoge? Grand Opening', place: 'Sewa Nagar, near Christ College, Ghaziabad', image: '/uploads/site/cafe-cart.webp', category: 'Cafe', order: 1 },
  { title: 'A day full of smiles', place: "Children's Academy, Ghaziabad", image: '/uploads/site/cup-hand.webp', category: 'College', order: 2 },
  { title: 'Birthday celebrations', place: 'Events & parties', image: '/uploads/site/event-birthday.webp', category: 'Event', order: 3 },
  { title: 'Pizza in a cup', place: 'Savoury serves', image: '/uploads/site/pizza-cups.webp', category: 'Product', order: 4 },
  { title: 'Hot chai, edible cup', place: 'Diwali special', image: '/uploads/site/diwali.webp', category: 'Event', order: 5 },
  { title: 'Chocolate-rimmed latte', place: 'Café serves', image: '/uploads/site/cup-latte.webp', category: 'Product', order: 6 },
]);

await Setting.create({
  key: 'site',
  brand: 'CUP2EAT',
  phone: '9818192575',
  whatsapp: '919818192575',
  instagram: 'cup2eat',
  founder: 'Varun Khera',
  followers: 1114,
  fssaiNo: '', // TODO: add the real FSSAI licence number
  email: '',
  address: 'Ghaziabad, Uttar Pradesh',
});

console.log('[seed] done: 2 products, 1 offer, 6 gallery items, 1 settings doc');
await mongoose.disconnect();
