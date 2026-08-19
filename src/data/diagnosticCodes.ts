export interface DiagnosticCodeInfo {
  desc: string;
  severity: 'normal' | 'warn' | 'critical';
  remedy: string;
  component: string;
  estimatedBenchMinutes: number;
}

export interface HardwareTelemetryLogEntry {
  id?: string;
  code?: string;
  data: string;
  timestamp?: string;
  type?: 'rx' | 'tx' | 'info' | 'error';
}

export interface HardwareTelemetryPayload {
  deviceModel?: string;
  logEntries?: HardwareTelemetryLogEntry[];
  code?: string;
  rawHex?: string;
  vbusVoltage?: number;
  currentDrawAmps?: number;
  tempCelsius?: number;
  isShortToGround?: boolean;
}

export const COMMON_DIAGNOSTIC_CODES: Record<string, DiagnosticCodeInfo> = {
  'ERR_0x10': {
    desc: 'VBUS Over-Voltage Lockout (>21.5V detected)',
    severity: 'critical',
    remedy: 'Inspect input TVS diode and CC1/CC2 pull-down FET. Replace damaged OVP IC.',
    component: 'OVP / TVS Diode Array',
    estimatedBenchMinutes: 45
  },
  'ERR_0x14': {
    desc: 'Thermal Throttle Triggered (T_JUNC > 85°C)',
    severity: 'warn',
    remedy: 'Check PMIC thermal paste & heat shield seating. Verify buck converter inductors.',
    component: 'PMIC / Thermal Dissipation Pad',
    estimatedBenchMinutes: 30
  },
  'ERR_0x22': {
    desc: 'I2C_NACK on Fuel Gauge IC (BQ27426/CW2015)',
    severity: 'critical',
    remedy: 'Test SDA/SCL pull-up resistors (2.2kΩ) to VCC_1V8. Inspect battery sense FPC connector.',
    component: 'Fuel Gauge IC / I2C Bus',
    estimatedBenchMinutes: 60
  },
  'ERR_0x3F': {
    desc: 'PP_VDD_MAIN Short to GND (<0.02V detected)',
    severity: 'critical',
    remedy: 'Thermal freeze-spray inject 1.2V 2A to identify glowing capacitor.',
    component: 'Main VDD Power Rail / Ceramic MLCC Filter',
    estimatedBenchMinutes: 90
  },
  'STAT_0x01': {
    desc: 'USB-PD Contract Negotiated (9V / 2.22A 20W)',
    severity: 'normal',
    remedy: 'Normal CC handshake confirmed. Power delivery protocol nominal.',
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
