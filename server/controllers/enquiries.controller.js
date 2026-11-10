import { z } from 'zod';
import Enquiry, { BUSINESS_TYPES } from '../models/Enquiry.js';
import Product from '../models/Product.js';
import Setting from '../models/Setting.js';

export const enquiryBody = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(80),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  email: z.string().trim().email('Enter a valid email').optional().or(z.literal('')),
  city: z.string().trim().max(60).optional().default(''),
  businessType: z.enum(BUSINESS_TYPES).default('Other'),
  product: z.string().regex(/^[a-f\d]{24}$/i).optional().or(z.literal('')),
  quantity: z.coerce.number().int().min(1).max(1000000).optional(),
  message: z.string().trim().max(800).optional().default(''),
  source: z.enum(['form', 'calculator']).default('form'),
});

export async function createEnquiry(req, res) {
  const data = { ...req.valid };
  if (!data.product) delete data.product;
  if (!data.email) delete data.email;
  await Enquiry.create(data);

  // build a pre-filled WhatsApp link so the visitor can also ping the founder directly
  const [setting, product] = await Promise.all([
    Setting.findOne({ key: 'site' }),
    data.product ? Product.findById(data.product) : null,
  ]);
  const lines = [
    `Hi CUP2EAT! I am ${data.name} (${data.businessType}).`,
    product && data.quantity
      ? `I need ${data.quantity} x ${product.capacityMl}ml cups.`
      : data.quantity
        ? `I need about ${data.quantity} cups.`
        : '',
    data.city ? `City: ${data.city}` : '',
    data.message ? `Note: ${data.message}` : '',
    `Phone: ${data.phone}`,
  ].filter(Boolean);
  const whatsappUrl = setting?.whatsapp
    ? `https://wa.me/${setting.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`
    : null;

  res.status(201).json({ message: 'Enquiry received! We will call you shortly.', whatsappUrl });
}
