// Creates the admin login, or resets its password if the email already exists.
//   npm run admin:create
// (non-interactive: ADMIN_EMAIL=.. ADMIN_PASSWORD=.. ADMIN_NAME=.. npm run admin:create)
import 'dotenv/config';
import readline from 'node:readline';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Admin from '../models/Admin.js';

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => { if (s.includes(question)) process.stdout.write(s); }; // show the prompt, not the typing
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer.trim());
    });
  });
}

const email = (process.env.ADMIN_EMAIL || (await ask('Admin email: '))).toLowerCase();
const unattended = Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD); // no prompts when everything is given
const name = process.env.ADMIN_NAME || (unattended ? 'Admin' : (await ask('Your name (shown in the panel) [Admin]: ')) || 'Admin');
const password = process.env.ADMIN_PASSWORD || (await ask('Password (min 10 characters): ', { hidden: true }));

if (!/^\S+@\S+\.\S+$/.test(email)) { console.error('That does not look like an email.'); process.exit(1); }
if (password.length < 10) { console.error('The password needs at least 10 characters.'); process.exit(1); }

await connectDB();
const passwordHash = await bcrypt.hash(password, 12);
const existing = await Admin.findOne({ email });
if (existing) {
  existing.passwordHash = passwordHash;
  existing.passwordChangedAt = new Date();
  existing.failedAttempts = 0;
  existing.lockedUntil = undefined;
  if (name !== 'Admin') existing.name = name;
  await existing.save();
  console.log(`Password reset for ${email}. All older sessions are logged out.`);
} else {
  await Admin.create({ email, name, passwordHash, role: 'owner' });
  console.log(`Admin created: ${email}`);
}
await mongoose.disconnect();
