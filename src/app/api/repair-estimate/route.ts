/**
 * Next.js App Router Route Handler: Repair Estimates
 * Endpoint: /api/repair-estimate
 */

export enum ServiceTier {
  TIER_1_POWER = 'TIER_1_POWER',
  TIER_2_DISPLAY = 'TIER_2_DISPLAY',
  TIER_3_BOARD = 'TIER_3_BOARD',
}

export const TAX_RATES = {
  SPOKANE_CITY: { code: '3202', rate: 0.091, name: 'Spokane City (9.1%)', zips: ['99201', '99202', '99203', '99204', '99205', '99207', '99208'] },
  SPOKANE_VALLEY: { code: '3213', rate: 0.090, name: 'Spokane Valley (9.0%)', zips: ['99206', '99212', '99216'] },
  DEFAULT: { code: 'WA-GEN', rate: 0.085, name: 'WA State Base (8.5%)', zips: [] }
};

export const PRICING_TIERS = {
  [ServiceTier.TIER_1_POWER]: {
    label: 'Battery & Power Systems',
    category: 'Power',
    baseParts: 45,
    laborHours: 0.5,
    complexity: 'Tier 1',
    description: 'Standard battery renewal or charging port FPC refresh. Includes thermal cycling.'
  },
  [ServiceTier.TIER_2_DISPLAY]: {
    label: 'Display & Visual Systems',
    category: 'Screen',
    baseParts: 145,
    laborHours: 1.0,
    complexity: 'Tier 2',
    description: 'Full assembly renewal for OLED or Liquid Retina displays. TrueTone calibration included.'
  },
  [ServiceTier.TIER_3_BOARD]: {
    label: 'Logic Board & Micro-Soldering',
    category: 'Logic Board',
    baseParts: 65,
    laborHours: 3.5,
    complexity: 'Tier 3',
    description: 'Advanced trace restoration, BGA reballing, and data recovery triage.'
  }
};

export interface PricingBreakdown {
  partsCost: number;
  laborCost: number;
  modelAdjustment: number;
  rushFee: number;
  dataRecoveryFee: number;
  overhead: number;
  subtotal: number;
  tax: number;
  total: number;
  laborRate: number;
  laborHours: number;
  taxRatePercent: number;
  jurisdiction: string;
}

export function calculateServerQuote(
  tier: ServiceTier,
  zip: string,
  options?: {
    model?: string;
    isRush?: boolean;
    isDataRecovery?: boolean;
  }
): PricingBreakdown {
  const data = PRICING_TIERS[tier] || PRICING_TIERS[ServiceTier.TIER_1_POWER];
  const laborRate = 55.00;
  const markupRate = 0.95;

  let modelAdjustment = 0;
  if (options?.model) {
    const m = options.model.toLowerCase();
    if (m.includes('pro max') || m.includes('ultra') || m.includes('fold') || m.includes('m2')) {
      modelAdjustment = 35.00;
    } else if (m.includes('pro') || m.includes('s24') || m.includes('s23') || m.includes('pixel 8')) {
      modelAdjustment = 20.00;
    }
  }

  const partsCost = data.baseParts + modelAdjustment;
  const laborCost = data.laborHours * laborRate;
  const overhead = partsCost * markupRate;

  const rushFee = options?.isRush ? 49.00 : 0;
  const dataRecoveryFee = options?.isDataRecovery ? 75.00 : 0;

  const subtotal = partsCost + laborCost + overhead + rushFee + dataRecoveryFee;

  let taxRateObj = TAX_RATES.DEFAULT;
  if (TAX_RATES.SPOKANE_CITY.zips.includes(zip)) {
    taxRateObj = TAX_RATES.SPOKANE_CITY;
  } else if (TAX_RATES.SPOKANE_VALLEY.zips.includes(zip)) {
    taxRateObj = TAX_RATES.SPOKANE_VALLEY;
  }

  const tax = subtotal * taxRateObj.rate;
  const total = subtotal + tax;

  return {
    partsCost: Math.round(partsCost * 100) / 100,
    laborCost: Math.round(laborCost * 100) / 100,
    modelAdjustment: Math.round(modelAdjustment * 100) / 100,
    rushFee: Math.round(rushFee * 100) / 100,
    dataRecoveryFee: Math.round(dataRecoveryFee * 100) / 100,
    overhead: Math.round(overhead * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
    laborRate,
    laborHours: data.laborHours,
    taxRatePercent: taxRateObj.rate * 100,
    jurisdiction: taxRateObj.name
  };
}

export async function GET() {
  return Response.json({
    status: 'ok',
    tiers: PRICING_TIERS,
    laborRate: 55.00,
    taxJurisdictions: TAX_RATES,
    serverTimestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tier, zip = '99201', model, isRush = false, isDataRecovery = false } = body;

    const validatedTier = (tier in PRICING_TIERS) ? (tier as ServiceTier) : ServiceTier.TIER_1_POWER;
    const quote = calculateServerQuote(validatedTier, String(zip), {
      model: model ? String(model) : undefined,
      isRush: Boolean(isRush),
      isDataRecovery: Boolean(isDataRecovery)
    });

    return Response.json({
      success: true,
      quote,
      serverVerified: true,
      tierConfig: PRICING_TIERS[validatedTier],
      calculatedAt: new Date().toISOString(),
      currency: 'USD'
    });
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error.message || 'Failed to calculate repair estimate'
      },
      { status: 400 }
    );
  }
}
