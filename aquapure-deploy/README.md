# AquaPure — Water Tank Cleaning Landing Page

A production-ready booking landing page for AquaPure Health Services.

---

## 📁 File Structure

```
aquapure-deploy/
├── index.html              ← Main page entry point
├── manifest.json           ← PWA manifest
├── robots.txt              ← Search engine instructions
├── sitemap.xml             ← SEO sitemap
├── netlify.toml            ← Netlify deployment config
├── vercel.json             ← Vercel deployment config
├── README.md               ← This file
└── assets/
    ├── css/
    │   └── style.css       ← All styles
    ├── js/
    │   └── app.js          ← All JavaScript / booking logic
    └── icons/
        └── favicon.svg     ← App icon (SVG)
```

---

## 🚀 Deployment Options

### Option 1 — Netlify (Recommended)
1. Go to [netlify.com](https://netlify.com) → **Add new site** → **Deploy manually**
2. Drag & drop the entire `aquapure-deploy/` folder onto the Netlify deploy area
3. Done — your site is live in seconds

Or via CLI:
```bash
npm install -g netlify-cli
netlify deploy --dir . --prod
```

### Option 2 — Vercel
```bash
npm install -g vercel
cd aquapure-deploy
vercel --prod
```

### Option 3 — GitHub Pages
1. Push this folder to a GitHub repo
2. Go to **Settings → Pages → Source → Deploy from branch**
3. Select `main` / `root` and save

### Option 4 — cPanel / Traditional Hosting
1. Zip the contents of `aquapure-deploy/`
2. Upload via File Manager to `public_html/`
3. Extract in place

### Option 5 — Any Static CDN
Upload all files maintaining the folder structure to:
- AWS S3 + CloudFront
- Google Cloud Storage
- Cloudflare Pages (`wrangler pages deploy .`)
- Firebase Hosting (`firebase deploy`)

---

## 💳 Paystack Integration (Live Activation)

The payment button is currently in **demo/simulation mode**. To go live:

1. Create a [Paystack account](https://paystack.com) and get your **Public Key**
2. In `assets/js/app.js`, find `simulatePayment()` and replace with:

```javascript
function simulatePayment() {
  if (!chosenPayMethod) return;
  const handler = PaystackPop.setup({
    key: 'pk_live_YOUR_PUBLIC_KEY_HERE',   // ← your Paystack public key
    email: document.getElementById('f-phone').value + '@aquapure.ng',
    amount: grandTotal() * 100,            // Paystack uses kobo
    currency: 'NGN',
    ref: window._payRef,
    channels: chosenPayMethod === 'card'     ? ['card'] :
              chosenPayMethod === 'transfer' ? ['bank_transfer'] : ['ussd'],
    metadata: {
      custom_fields: [
        { display_name: 'Customer Phone', variable_name: 'phone', value: document.getElementById('f-phone').value },
        { display_name: 'Address',        variable_name: 'address', value: document.getElementById('f-street').value }
      ]
    },
    callback: function(response) {
      window._payRef = response.reference;
      showReceipt();
    },
    onClose: function() {
      // User closed payment modal
    }
  });
  handler.openIframe();
}
```

3. Add the Paystack JS SDK to `index.html` `<head>`:
```html
<script src="https://js.paystack.co/v1/inline.js"></script>
```

---

## 🌐 Custom Domain Setup

After deploying to Netlify/Vercel:
1. Go to your DNS provider (e.g. Qservers, Whogohost, Truehost Nigeria)
2. Add a CNAME record: `www` → `your-site.netlify.app`
3. Add an A record for apex: follow your host's instructions
4. Enable HTTPS (automatic on Netlify/Vercel)

---

## 📱 WhatsApp Passcode Webhook (Optional Backend)

To actually send WhatsApp confirmation messages, connect a webhook:
- Use **Twilio WhatsApp API** or **WhatsApp Business API**
- Trigger after `showReceipt()` fires, POST booking data to your backend
- Backend sends passcode via WhatsApp to customer phone

---

## 🔧 Configuration

Update these values in `assets/js/app.js` to match real pricing:
```javascript
const SIZES = {
  small:  { label: 'Small (≤500L)',       price: 3500  },  // ← update price
  medium: { label: 'Medium (500–1500L)',  price: 6500  },  // ← update price
  large:  { label: 'Large (1500L+)',      price: 11000 },  // ← update price
};
const LOCS = {
  rooftop: { label: 'On Rooftop',     surcharge: 1500 }, // ← update surcharge
  stand:   { label: 'On Iron Stand',  surcharge: 500  },
  ground:  { label: 'On Ground Floor',surcharge: 0    },
};
```

---

## ✅ Pre-Deployment Checklist

- [ ] Update Paystack public key (`pk_live_...`)
- [ ] Update pricing in `app.js`
- [ ] Add real phone number in footer (`0800-AQUA-PURE`)
- [ ] Add real email (`info@aquapure.ng`)
- [ ] Replace `https://aquapure.ng/` in `sitemap.xml` with actual domain
- [ ] Add OG image at `assets/icons/og-image.png` (1200×630px)
- [ ] Add app icons: `assets/icons/icon-192.png` and `icon-512.png`
- [ ] Test on mobile (iOS Safari + Android Chrome)
- [ ] Test payment flow end-to-end on Paystack test mode

---

© 2026 AquaPure Health Services · Lagos, Nigeria
