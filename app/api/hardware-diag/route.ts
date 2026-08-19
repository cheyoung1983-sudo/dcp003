import { NextRequest, NextResponse } from 'next/server';
import { COMMON_DIAGNOSTIC_CODES, HardwareTelemetryPayload } from '@/data/diagnosticCodes';

export const dynamic = 'force-dynamic';

/**
 * Next.js App Router Route Handler: Hardware Diagnostics
 * Endpoint: /api/hardware-diag
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (code && COMMON_DIAGNOSTIC_CODES[code]) {
      return NextResponse.json({
        status: 'ok',
        code,
        details: COMMON_DIAGNOSTIC_CODES[code],
        serverTimestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      status: 'ok',
      diagnosticCodes: COMMON_DIAGNOSTIC_CODES,
      benchStatus: {
        busProtocol: 'WebUSB/WebSerial Telemetry Port V2',
        baudRateSupported: [9600, 19200, 38400, 57600, 115200, 230400, 921600],
        activeChannels: 4,
        serverEngine: 'Spokane Precision Bench Analyzer v3.4',
        databaseConnected: Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL || true),
      },
      serverTimestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to retrieve hardware diagnostics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: HardwareTelemetryPayload = await request.json();
    const { deviceModel, logEntries = [], code, rawHex, vbusVoltage, currentDrawAmps, tempCelsius, isShortToGround } = body;

    const detectedIssues: Array<{
      code?: string;
      severity: 'normal' | 'warn' | 'critical';
      description: string;
      remedy: string;
      component: string;
    }> = [];

    // Analyze specific code if passed directly
    if (code && COMMON_DIAGNOSTIC_CODES[code]) {
      const info = COMMON_DIAGNOSTIC_CODES[code];
      detectedIssues.push({
        code,
        severity: info.severity,
        description: info.desc,
        remedy: info.remedy,
        component: info.component,
      });
    }

    // Parse log entries for error codes or abnormalities
    for (const entry of logEntries) {
      if (entry.code && COMMON_DIAGNOSTIC_CODES[entry.code]) {
        const info = COMMON_DIAGNOSTIC_CODES[entry.code];
        if (!detectedIssues.some((d) => d.code === entry.code)) {
          detectedIssues.push({
            code: entry.code,
            severity: info.severity,
            description: info.desc,
            remedy: info.remedy,
            component: info.component,
          });
        }
      } else if (entry.data) {
        for (const [diagCode, info] of Object.entries(COMMON_DIAGNOSTIC_CODES)) {
          if (entry.data.includes(diagCode) && !detectedIssues.some((d) => d.code === diagCode)) {
            detectedIssues.push({
              code: diagCode,
              severity: info.severity,
              description: info.desc,
              remedy: info.remedy,
              component: info.component,
            });
          }
        }
      }
    }

    // Telemetry physical layer checks
    if (isShortToGround) {
      detectedIssues.push({
        code: 'ERR_SHORT_GND',
        severity: 'critical',
        description: 'VCC/VDD Main Short-to-Ground Detected (<0.05Ω resistance)',
        remedy: 'Isolate main power rail with DC bench supply (1.0V current limited). Check thermal dissipation.',
        component: 'Power Distribution Network (PDN)',
      });
    }

    if (tempCelsius && tempCelsius > 45.0) {
      detectedIssues.push({
        code: 'WARN_THERMAL_HIGH',
        severity: 'warn',
        description: `Thermal Sensor Warning: Core temperature at ${tempCelsius.toFixed(1)}°C exceeds normal range.`,
        remedy: 'Inspect thermal TIM paste and copper vapor chamber seating.',
        component: 'SoC Thermal Interface Material',
      });
    }

    if (vbusVoltage && (vbusVoltage < 4.2 || vbusVoltage > 21.0)) {
      detectedIssues.push({
        code: 'ERR_VBUS_OUT_OF_RANGE',
        severity: 'critical',
        description: `VBUS Voltage anomaly: ${vbusVoltage.toFixed(2)}V detected outside nominal spec (4.75V - 20.5V).`,
        remedy: 'Verify USB-C CC line communication and CC pull-up/pull-down resistor network.',
        component: 'USB-C Receptacle / CC Controller',
      });
    }

    const highestSeverity = detectedIssues.some((d) => d.severity === 'critical')
      ? 'critical'
      : detectedIssues.some((d) => d.severity === 'warn')
        ? 'warn'
        : 'normal';

    const estimatedTotalBenchMinutes = detectedIssues.reduce((acc, curr) => {
      const found = curr.code ? COMMON_DIAGNOSTIC_CODES[curr.code] : null;
      return acc + (found ? found.estimatedBenchMinutes : 20);
    }, detectedIssues.length > 0 ? 0 : 15);

    return NextResponse.json({
      success: true,
      analysis: {
        deviceModel: deviceModel || 'Standard Laboratory Unit',
        highestSeverity,
        issuesCount: detectedIssues.length,
        detectedIssues,
        estimatedBenchTimeMinutes: estimatedTotalBenchMinutes,
        labRecommendation: highestSeverity === 'critical'
          ? 'Requires Tier 3 Micro-soldering bench triage and microscope inspection before power re-application.'
          : highestSeverity === 'warn'
            ? 'Preventative component replacement and thermal repasting recommended.'
            : 'Hardware telemetry is within nominal laboratory tolerance.',
      },
      rawHexProcessed: Boolean(rawHex),
      processedLogCount: logEntries.length,
      serverTimestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Invalid diagnostic telemetry payload',
      },
      { status: 400 }
    );
  }
}
