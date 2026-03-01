# Gipsorekentool

A Next.js 14 calculator form that writes six input parameters to a Google Sheet, waits for the sheet to recalculate, then displays the result — all within a single page with a smooth Framer Motion animation.

---

## Tech stack

| Layer        | Library / Tool            |
|--------------|---------------------------|
| Framework    | Next.js 14 (App Router)   |
| Language     | TypeScript                |
| Styling      | TailwindCSS               |
| Animation    | Framer Motion             |
| Backend      | Next.js API Routes        |
| Spreadsheet  | Google Sheets API v4      |

---

## Google Sheets setup

### 1. Prepare the spreadsheet

1. Create (or open) a Google Sheet.
2. Rename the target tab to **`calculator`** (exact match, case-sensitive).
3. Leave cells **B1:B6** for the six input parameters.
4. Put your formula or calculation logic in the sheet so that the final result appears in **B8**.
5. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit
   ```

### 2. Create a Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create or select a project.
2. Enable the **Google Sheets API** (APIs & Services → Library → search "Sheets").
3. Go to **APIs & Services → Credentials → Create Credentials → Service Account**.
4. Give it any name, then click **Done**.
5. Open the new service account, go to **Keys → Add Key → Create new key → JSON**.
6. Download the JSON file — keep it secret, never commit it.

### 3. Share the spreadsheet with the service account

In Google Sheets, click **Share**, paste the service account email address (ends in `.iam.gserviceaccount.com`), and grant **Editor** access.

### 4. Set environment variables

Copy `.env.local.example` to `.env.local` and fill in the three values from the downloaded JSON key file:

```bash
cp .env.local.example .env.local
```

| Variable                        | Where to find it                            |
|---------------------------------|---------------------------------------------|
| `GOOGLE_SHEETS_SPREADSHEET_ID`  | Spreadsheet URL (see step 1)               |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`  | `"client_email"` in the JSON key file       |
| `GOOGLE_PRIVATE_KEY`            | `"private_key"` in the JSON key file        |

> **Tip for `.env.local`:** wrap the private key value in double quotes and keep the literal `\n` sequences — the app replaces them with real newlines at runtime.

---

## Local development

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel

1. Push this repository to GitHub (or any Git provider).
2. Import it in [Vercel](https://vercel.com/).
3. Add the three environment variables in **Project → Settings → Environment Variables**:
   - `GOOGLE_SHEETS_SPREADSHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY` — paste the full private key string **including** `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`. Vercel stores it verbatim; the app converts `\n` to real newlines automatically.
4. Click **Deploy**.

---

## How it works

```
User fills in Parameters 1–6
        ↓
POST /api/calculate  { values: [n1, n2, n3, n4, n5, n6] }
        ↓
Google Sheets API writes values to calculator!B1:B6
        ↓
Wait 1 500 ms  (gives Sheets time to recalculate)
        ↓
Google Sheets API reads calculator!B8
        ↓
{ result: "..." }  returned as JSON
        ↓
Framer Motion fade-in displays the result
```
