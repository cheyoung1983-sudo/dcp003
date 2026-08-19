'use server';

import {
  SUPPORTED_DEVICES_DATABASE,
  SupportedDeviceModel,
} from '@/data/supportedDevicesData';

export interface DeviceSearchFilterOptions {
  query?: string;
  manufacturer?: string;
  category?: string;
  bgaOnly?: boolean;
}

export async function fetchSupportedDevices(options: DeviceSearchFilterOptions = {}) {
  const { query = '', manufacturer = 'all', category = 'all', bgaOnly = false } = options;

  let results: SupportedDeviceModel[] = [...SUPPORTED_DEVICES_DATABASE];

  if (manufacturer !== 'all') {
    results = results.filter((d) => d.manufacturer.toLowerCase() === manufacturer.toLowerCase());
  }

  if (category !== 'all') {
    results = results.filter((d) => d.category.toLowerCase() === category.toLowerCase());
  }

  if (bgaOnly) {
    results = results.filter((d) => d.supportedRepairs.some((c) => c.tier.includes('BGA')));
  }

  if (query.trim()) {
    const q = query.toLowerCase().trim();
    results = results.filter(
      (d) =>
        d.modelName.toLowerCase().includes(q) ||
        d.manufacturer.toLowerCase().includes(q) ||
        d.boardId.toLowerCase().includes(q) ||
        d.modelNumbers.some((num) => num.toLowerCase().includes(q)) ||
        d.chipset.toLowerCase().includes(q)
    );
  }

  return {
    success: true,
    totalCount: SUPPORTED_DEVICES_DATABASE.length,
    matchedCount: results.length,
    devices: results,
    cachedAt: new Date().toISOString(),
  };
}
