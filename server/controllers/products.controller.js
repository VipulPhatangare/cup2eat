import Product from '../models/Product.js';

export async function listProducts(req, res) {
  const products = await Product.find({ isActive: true }).sort({ order: 1 });
  res.json(products);
}
