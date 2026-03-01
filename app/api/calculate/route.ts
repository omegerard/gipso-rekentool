import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
const SHEET_TAB = 'calculator';
const WRITE_RANGE = `${SHEET_TAB}!B1:B6`;
const READ_RANGE = `${SHEET_TAB}!B8`;
const RECALC_DELAY_MS = 1500;

function buildAuth() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

  if (!privateKey || !clientEmail || !SPREADSHEET_ID) {
    throw new Error(
      'Missing required environment variables: GOOGLE_SHEETS_SPREADSHEET_ID, ' +
        'GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY'
    );
  }

  return new google.auth.JWT(clientEmail, undefined, privateKey, [
    'https://www.googleapis.com/auth/spreadsheets',
  ]);
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { values } = body as { values: unknown };

    if (
      !Array.isArray(values) ||
      values.length !== 6 ||
      values.some((v) => typeof v !== 'number' || isNaN(v))
    ) {
      return NextResponse.json(
        { error: 'Provide exactly 6 numeric values.' },
        { status: 400 }
      );
    }

    const auth = buildAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // Write Parameters 1–6 into B1:B6 (one value per row)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: WRITE_RANGE,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: (values as number[]).map((v) => [v]),
      },
    });

    // Allow Google Sheets to recalculate dependent formulas
    await delay(RECALC_DELAY_MS);

    // Read the computed result from B8
    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: READ_RANGE,
    });

    const result = readResponse.data.values?.[0]?.[0] ?? null;

    return NextResponse.json({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[/api/calculate]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
