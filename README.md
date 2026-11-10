# CUP2EAT: Eat Your Drink

MERN landing page for CUP2EAT edible cups: React (Vite) + Express + local MongoDB.
The hero is one continuous **scroll animation**:
- **Desktop (768px+)**: a 16:9 video played as a frame sequence on a canvas as you scroll (Hero → Pour → Crunch).
- **Phones**: the same desktop video, cropped to a window over the top half of the screen with the cup centred and the headline right below it.
- **Fallback**: the cup drawn in SVG, used automatically if the frames are missing.
- Visitors who ask their device for reduced motion get a static hero.

## Run it

Needs Node 20+ and MongoDB running locally (`mongodb://127.0.0.1:27017`).

```bash
npm run install:all   # first time only: installs root, server and client
npm run images        # first time only: converts assets/photos to WebP for the site
npm run seed          # loads products, offer, gallery, settings into MongoDB
npm run frames -- assets/video/hero.mp4 8.1       # first time only: hero scroll frames (see below)
npm run admin:create  # first time only: creates the admin login (asks for email + password)
npm run dev           # API on :5000 + site on http://localhost:5173  (admin: /admin)
```

Production (one server): `npm run build` then `npm start --prefix server` → http://localhost:5000

## Hero video (desktop)

`npm run frames -- <video> [end-seconds] [desktop|mobile]` turns a video into WebP frames in
`client/public/frames/<device>/` (desktop 12 fps / 1280 px, mobile 10 fps / 720 px, audio dropped) and updates the
frame count in `client/src/config/frames.json`. Swap in a better take by running it again.

- `beats` in `frames.json` are fractions of the clip where the story moves on:
  `[0, 0.42, 0.79, 1]` = start, pour begins, bite begins, end. Re-tune them for a new clip.
- Phones reuse the desktop frames. The `mobile` entry in `frames.json` only says how to crop them:
  `x` is the window's horizontal centre in the video (a list that pans with `beats`, so it follows the
  bite), `y` the vertical centre, `zoom` how close (1 = as much as fits). To give phones their own
  9:16 video instead: `npm run frames -- phone.mp4 8.1 mobile` (it then uses its own frames folder).
- Trim each clip before its cut: both Veo clips jump to a different shot at about 8.17 s, so use `8.1`.
- If you rebuild for production (`npm run build`), restart the server so it picks up `client/dist`.

## Admin panel (`/admin`)

Open **http://localhost:5173/admin** and log in. Create or reset the login with `npm run admin:create`
(it asks for an email and a password of at least 10 characters; run it again with the same email to reset the password).

| Page | What it does |
|---|---|
| Dashboard | Today's enquiries, reviews waiting, average rating, 30-day chart, latest leads and activity |
| Reviews | Approve / reject / feature / reply / delete, bulk actions, photos. Only approved reviews show on the site; a reply shows under the review |
| Enquiries | Status, notes, follow-up date, call and WhatsApp buttons, search, CSV export |
| Products | Change prices, pack sizes, flavours, photo. The site updates on save. Asks before a price jump over 30% |
| Offers | The gold top bar and countdown. One offer is live at a time |
| Gallery | Upload (auto-resized to WebP), edit, reorder, remove |
| Settings | Phone, FSSAI number (shown in the footer), Instagram, address, change password |
| Activity | Who changed what and when |

Roles: `owner` sees everything; `staff` (set `role` in the `admins` collection) only gets Dashboard, Reviews, Enquiries and Gallery.

Security: password hashed with bcrypt; login is an httpOnly, SameSite=Strict cookie (8 h); 5 wrong passwords lock the account for
15 minutes; changing the password logs out every other device; every `/api/admin` route needs the login; the panel is
`noindex` and loaded as its own chunk, so public visitors never download it.
Set a long random `JWT_SECRET` in `server/.env` (see `.env.example`). Cookie login needs the site and API on the same domain,
which is how `npm start` serves it.

## What is where

```
assets/   source material (not served): photos/ originals, video/hero.mp4, info.md (the brand copy)
scripts/  makeFrames.mjs (video to scroll frames)
client/   React + Tailwind v4 + Framer Motion
  src/components/cup/AnimatedCup.jsx    the SVG cup (fallback only)
  src/components/cup/VideoCanvas.jsx    draws the scroll video frames (desktop + phone)
  src/components/sections/ScrollStory.jsx  scroll timeline: Hero → Pour → Crunch → Flavours → Pack
  src/components/sections/*             Products, Calculator, Reviews, Gallery, Contact ...
client/src/admin/                     the admin panel (AdminApp, Layout, pages/)
server/   Express + Mongoose
  routes/admin.js, controllers/admin/   admin API (login required)
  models/        Product, Review, Enquiry, Offer, GalleryItem, Setting
  routes/        /api/products  /api/reviews  /api/enquiries  /api/offers/active  /api/gallery  /api/settings
  seed/seed.js   real content from assets/info.md
  uploads/       site/ (converted photos) and reviews/ (customer photos)
```

## Reviews

Visitors submit reviews (with up to 3 photos). They are saved as **pending** and do not show until you approve
them in **Admin → Reviews**. Enquiries from the calculator and contact form arrive in **Admin → Enquiries**.

## Still to fill in (needs your input)

- **FSSAI licence number**: enter it in Admin → Settings; the footer shows it automatically.
- **Retail prices**: the ₹75–89 "pack of 8" poster conflicts with the rest of assets/info.md (6 flavours, Strawberry listed twice). Not added until confirmed.
- **Real photos**: the site uses your Instagram photos; replace the generic-looking ones with photos of the real cups.
- **Real reviews**: none are pre-loaded on purpose.
- **Shelf life / storage answer** in the FAQ is a placeholder that points visitors to call or WhatsApp.
- **Offer** ends at the end of the current month (seeded). Re-run `npm run seed` or edit the `offers` collection to change it.

## Next phases

1. Retail cart + Razorpay checkout
2. Deploy (MongoDB Atlas + Render/Railway + Vercel)
