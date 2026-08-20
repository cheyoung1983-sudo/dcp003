import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { telemetry, customerReportedIssue, deviceModel } = await request.json();

    const ammeter = telemetry?.ammeterDrawAmps ?? 0;
    const isShort = telemetry?.isShortToGround ?? false;
    const temp = telemetry?.batteryTempCelsius ?? 24;
    const model = deviceModel || 'Target Device';
    const issue = customerReportedIssue || 'No specific fault provided';

    let primaryAnalysis = `#### Diagnostic Assessment for ${model}\n\n`;
    primaryAnalysis += `**Observed Symptoms & Telemetry:**\n`;
    primaryAnalysis += `- Reported Fault: *${issue}*\n`;
    primaryAnalysis += `- DC Bench Supply Draw: **${ammeter}A**\n`;
    primaryAnalysis += `- Short-to-Ground Detection: **${isShort ? 'POSITIVE (Short Circuit Detected)' : 'NEGATIVE (No Gross Short)'}**\n`;
    primaryAnalysis += `- Thermal Reading: **${temp}°C**\n\n`;

    primaryAnalysis += `#### Root Cause & Component Analysis\n`;
    if (isShort || ammeter > 1.8) {
      primaryAnalysis += `- **Primary Failure Mode:** Primary VDD_MAIN / VDD_BOOST rail short circuit.\n`;
      primaryAnalysis += `- **Suspected IC / Passives:** Main PMIC (Power Management IC), filtering decoupling capacitors, or buck converter inductors.\n`;
      primaryAnalysis += `- **Recommended Action:** Connect thermal imaging camera to PCB under 1.2V current-limited injection (1.5A max) to isolate glowing capacitor or IC without delaminating copper layers.\n`;
    } else if (ammeter < 0.05 && !isShort) {
      primaryAnalysis += `- **Primary Failure Mode:** Tristar / Hydra USB-C Power Delivery communication failure or open line on charging mosfet.\n`;
      primaryAnalysis += `- **Suspected IC / Passives:** Charging controller, CC1/CC2 pull-up resistor array, or fractured flex connector.\n`;
      primaryAnalysis += `- **Recommended Action:** Inspect Lightning/USB-C receptacle under stereomicroscope (0.7x–4.5x), measure diode mode on data lines, and perform component-level replacement.\n`;
    } else {
      primaryAnalysis += `- **Primary Failure Mode:** Display digitizer subsystem or intermediate logic rail anomaly.\n`;
      primaryAnalysis += `- **Suspected IC / Passives:** Display driver connector, touch controller SPI lines, or back-light boost diode.\n`;
      primaryAnalysis += `- **Recommended Action:** Test known-good OLED test jig with ESD safe grounding strap before micro-soldering.\n`;
    }

    primaryAnalysis += `\n**Safety & Lab Verification Protocol:** Ensure ESD grounding bracelet is clipped to 1MΩ ground terminal. Verify all solder fume extraction fans are running at 80+ CFM.`;

    return NextResponse.json({
      success: true,
      analysis: primaryAnalysis
    });
  } catch (error: any) {
    console.error('Error generating AI diagnosis:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Diagnostic service error' },
      { status: 500 }
    );
  }
}
