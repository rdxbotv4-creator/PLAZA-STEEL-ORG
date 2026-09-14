# Vercel par deploy karne ka tareeqa (Plaza Steel & Crockery)

## 1. Code Vercel tak pohanchayein

- Lovable me upar right side **GitHub** button se project apne GitHub account me export karein.
- Vercel.com par login karein → **Add New → Project** → wahi GitHub repo select karein.

## 2. Build settings

Vercel ke project setup screen par:

| Setting | Value |
| --- | --- |
| Framework Preset | **Other** |
| Build Command | `npm run build` |
| Output Directory | `.vercel/output` |
| Install Command | `npm install` |

## 3. Environment Variables (bohat zaroori)

**Settings → Environment Variables** me ye 4 add karein (Production + Preview dono):

| Name | Value |
| --- | --- |
| `NITRO_PRESET` | `vercel` |
| `ADMIN_USERNAME` | `adminplaza` |
| `ADMIN_PASSWORD` | `34402` |
| `SESSION_SECRET` | koi bhi 40+ characters ki random line (kisi ko na batayein) |

`NITRO_PRESET=vercel` ke bina site build ho kar bhi chalegi nahi — ye Vercel ke liye server output banata hai.

## 4. Deploy

**Deploy** dabayein. 2-3 minute me live link mil jayega, jaise
`https://plaza-steel.vercel.app`.

## 5. Rate list update karna

Project ke root me **`list/`** folder hai. Nayi rate list aane par:

1. Nayi JSON file (purani file jaisi hi shape) `list/` folder me add karein — naam aisa rakhein
   jo alphabetically baad me aaye, jaise `ALL_STOCK_2.json`, `ALL_STOCK_3.json`.
2. GitHub par commit/push karein (ya Lovable se dobara push karein).
3. Vercel khud dobara deploy karega aur poori website nayi rates par aa jayegi.
   Ek hi item code purani aur nayi file dono me ho to **nayi file** wali rate chalti hai.

## 6. App install (Android + iPhone)

Site khulne par neeche **"Install Plaza App"** ka notification aata hai.

- **Android (Chrome):** "Install" dabayein — app home screen par aa jayegi.
- **iPhone/iPad (Safari):** neeche **Share** → **Add to Home Screen**.

Ye kaam sirf `https://` link par hota hai, is liye Vercel par deploy hone ke baad hi test karein.
