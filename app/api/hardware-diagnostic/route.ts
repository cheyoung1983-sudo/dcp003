/**
 * Next.js App Router Route Handler: Hardware Diagnostics
 * Endpoint: /api/hardware-diagnostic
 */

export interface DiagnosticLogEntry {
  id?: string;
  timestamp?: string;
  type?: 'rx' | 'tx' | 'system' | 'error' | 'warning';
  data: string;
  hex?: string;
  code?: string;
  description?: string;
  severity?: 'normal' | 'warn' | 'critical';
}

export interface HardwareTelemetryPayload {
  deviceModel?: string;
  logEntries?: DiagnosticLogEntry[];
  code?: string;
  rawHex?: string;
  vbusVoltage?: number;
  currentDrawAmps?: number;
  tempCelsius?: number;
  isShortToGround?: boolean;
}

export const COMMON_DIAGNOSTIC_CODES: Record<string, {
  desc: string;
  severity: 'normal' | 'warn' | 'critical';
  remedy: string;
  component: string;
  estimatedBenchMinutes: number;
}> = {
  'ERR_0x10': {
    desc: 'VBUS Over-Voltage Lockout (>21.5V detected)',
    severity: 'critical',
    remedy: 'Inspect input TVS diode and CC1/CC2 pull-down FET. Replace damaged input OVP protection IC.',
    component: 'OVP / TVS Diode Array',
    estimatedBenchMinutes: 45
  },
  'ERR_0x14': {
    desc: 'Thermal Throttle Triggered (T_JUNC > 85°C)',
    severity: 'warn',
    remedy: 'Check PMIC thermal paste & heat shield seating. Verify buck converter inductors for excessive ripple.',
    component: 'PMIC / Thermal Dissipation Pad',
    estimatedBenchMinutes: 30
  },
  'ERR_0x22': {
    desc: 'I2C_NACK on Fuel Gauge IC (BQ27426/CW2015)',
    severity: 'critical',
    remedy: 'Test SDA/SCL pull-up resistors (2.2kΩ) to VCC_1V8. Inspect battery sense FPC connector for corrosion.',
    component: 'Fuel Gauge IC / I2C Bus',
    estimatedBenchMinutes: 60
  },
  'ERR_0x3F': {
    desc: 'PP_VDD_MAIN Short to GND (<0.02V detected)',
    severity: 'critical',
    remedy: 'Thermal freeze-spray or infrared thermal camera inject 1.2V 2A to identify glowing shorted capacitor.',
    component: 'Main VDD Power Rail / Ceramic MLCC Filter',
    estimatedBenchMinutes: 90
  },
  'STAT_0x01': {
    desc: 'USB-PD Contract Negotiated (9V / 2.22A 20W)',
    severity: 'normal',
    remedy: 'Normal CC handshake confirmed. Power delivery protocol functioning within nominal tolerance.',
    component: 'Type-C PD Controller (TCPC)',
    estimatedBenchMinutes: 10
  },
  'STAT_0x02': {
    desc: 'NAND Flash ID Validated (UFS 3.1 256GB OK)',
    severity: 'normal',
    remedy: 'Memory controller responsive. Firmware integrity partition verified.',
    component: 'UFS / eMMC Storage Controller',
    estimatedBenchMinutes: 15
  },
  'STAT_0x08': {
    desc: 'Baseband Moding Ready (MDM9655 Boot OK)',
    severity: 'normal',
    remedy: 'RF transceiver clock synthesized. Baseband PMU rails nominal.',
    component: 'Baseband Processor & RF Front-End',
    estimatedBenchMinutes: 20
  },
  'WARN_0x4A': {
    desc: 'High Ripple Voltage on Buck Output (120mV pk-pk)',
    severity: 'warn',
    remedy: 'Verify bulk electrolytic/ceramic filter array and secondary smoothing inductor.',
    component: 'Buck Converter LC Filter Array',
    estimatedBenchMinutes: 40
  },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedCode = searchParams.get('code');

  if (requestedCode && COMMON_DIAGNOSTIC_CODES[requestedCode]) {
    return Response.json({
      status: 'ok',
      code: requestedCode,
      details: COMMON_DIAGNOSTIC_CODES[requestedCode],
      serverTimestamp: new Date().toISOString()
    });
  }

  return Response.json({
    status: 'ok',
    diagnosticCodes: COMMON_DIAGNOSTIC_CODES,
    benchStatus: {
      busProtocol: 'WebUSB/WebSerial Telemetry Port V2',
      baudRateSupported: [9600, 19200, 38400, 57600, 115200, 230400, 921600],
      activeChannels: 4,
      serverEngine: 'Spokane Precision Bench Analyzer v3.4'
    },
    serverTimestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
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
        component: info.component
      });
    }

    // Parse log entries for error codes or abnormalities
    for (const entry of logEntries) {
      if (entry.code && COMMON_DIAGNOSTIC_CODES[entry.code]) {
        const info = COMMON_DIAGNOSTIC_CODES[entry.code];
        if (!detectedIssues.some(d => d.code === entry.code)) {
          detectedIssues.push({
            code: entry.code,
            severity: info.severity,
            description: info.desc,
            remedy: info.remedy,
            component: info.component
          });
        }
      } else if (entry.data) {
        // Regex search for known diagnostic patterns
        for (const [diagCode, info] of Object.entries(COMMON_DIAGNOSTIC_CODES)) {
          if (entry.data.includes(diagCode) && !detectedIssues.some(d => d.code === diagCode)) {
            detectedIssues.push({
              code: diagCode,
              severity: info.severity,
              description: info.desc,
              remedy: info.remedy,
              component: info.component
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
        component: 'Power Distribution Network (PDN)'
      });
    }

    if (tempCelsius && tempCelsius > 45.0) {
      detectedIssues.push({
        code: 'WARN_THERMAL_HIGH',
        severity: 'warn',
        description: `Thermal Sensor Warning: Core temperature at ${tempCelsius.toFixed(1)}°C exceeds normal range.`,
        remedy: 'Inspect thermal TIM paste and copper vapor chamber seating.',
        component: 'SoC Thermal Interface Material'
      });
    }

    if (vbusVoltage && (vbusVoltage < 4.2 || vbusVoltage > 21.0)) {
      detectedIssues.push({
        code: 'ERR_VBUS_OUT_OF_RANGE',
        severity: 'critical',
        description: `VBUS Voltage anomaly: ${vbusVoltage.toFixed(2)}V detected outside nominal spec (4.75V - 20.5V).`,
        remedy: 'Verify USB-C CC line communication and CC pull-up/pull-down resistor network.',
        component: 'USB-C Receptacle / CC Controller'
      });
    }

    const highestSeverity = detectedIssues.some(d => d.severity === 'critical')
      ? 'critical'
      : detectedIssues.some(d => d.severity === 'warn')
        ? 'warn'
        : 'normal';

    const estimatedTotalBenchMinutes = detectedIssues.reduce((acc, curr) => {
      const found = curr.code ? COMMON_DIAGNOSTIC_CODES[curr.code] : null;
      return acc + (found ? found.estimatedBenchMinutes : 20);
    }, detectedIssues.length > 0 ? 0 : 15);

    return Response.json({
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
            : 'Hardware telemetry is within nominal laboratory tolerance.'
      },
      rawHexProcessed: Boolean(rawHex),
      processedLogCount: logEntries.length,
      serverTimestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error.message || 'Invalid diagnostic telemetry payload'
      },
      { status: 400 }
    );
  }
}
