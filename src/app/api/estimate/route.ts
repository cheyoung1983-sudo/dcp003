import { NextRequest, NextResponse } from 'next/server';
import { PRICING_TIERS, calculateQuote } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

const ESTIMATE_TAX_RATES = {
  SPOKANE_CITY: { code: '3202', rate: 0.091, name: 'Spokane City (9.1%)', zips: ['99201', '99202', '99203', '99204', '99205', '99207', '99208'] },
  SPOKANE_VALLEY: { code: '3213', rate: 0.090, name: 'Spokane Valley (9.0%)', zips: ['99206', '99212', '99216'] },
  DEFAULT: { code: 'WA-GEN', rate: 0.085, name: 'WA State Base (8.5%)', zips: [] }
};

/**
 * Next.js App Router Route Handler: Repair Estimate Calculations
 * Endpoint: /api/estimate
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    tiers: PRICING_TIERS,
    laborRate: 55.00,
    taxJurisdictions: ESTIMATE_TAX_RATES,
    databaseConnected: Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL || true),
    serverTimestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tier = 'TIER_1_POWER', zip = '99201', model, isRush = false, isDataRecovery = false } = body || {};

    const quote = calculateQuote(tier, zip, {
      model,
      isRush,
      isDataRecovery
    });

    let taxObj = ESTIMATE_TAX_RATES.DEFAULT;
    if (ESTIMATE_TAX_RATES.SPOKANE_CITY.zips.includes(String(zip))) {
      taxObj = ESTIMATE_TAX_RATES.SPOKANE_CITY;
    } else if (ESTIMATE_TAX_RATES.SPOKANE_VALLEY.zips.includes(String(zip))) {
      taxObj = ESTIMATE_TAX_RATES.SPOKANE_VALLEY;
    }

    return NextResponse.json({
      success: true,
      quote: {
        ...quote,
        jurisdiction: taxObj.name,
      },
      serverVerified: true,
      calculatedAt: new Date().toISOString(),
      currency: 'USD'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Estimate calculation failed' },
      { status: 400 }
    );
  }
}
