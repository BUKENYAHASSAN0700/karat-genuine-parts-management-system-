/**
 * KARAT Heavy Equipment Spare Parts Taxonomy
 * 9 Core Series with specialized Categories / Sub-assemblies
 */

export interface SeriesDefinition {
  id: string;
  name: string;
  shortLabel: string;
  description: string;
  categories: string[];
}

export const MANUFACTURER_BRANDS = [
  'Caterpillar',
  'Komatsu',
  'Volvo',
  'Hitachi',
  'Hyundai',
  'Doosan',
  'JCB',
  'Liebherr',
  'Sany',
  'XCMG',
  'Case',
  'Bobcat',
  'Kobelco',
  'Kubota',
  'Cummins',
  'Perkins',
  'Yanmar',
  'Isuzu',
  'Deutz',
  'Bosch Rexroth',
  'Donaldson',
  'Berco',
  'ITR',
  'Parker'
] as const;

export type ManufacturerBrand = typeof MANUFACTURER_BRANDS[number] | string;

export const PART_TAXONOMY: Record<string, string[]> = {
  'Motor Series': [
    'Model List',
    'KST Starter Motor Series',
    'KST Alternator Series',
    'Turbo-charger Series',
  ],
  'Electrical Parts Series': [
    'Cable Series',
    'Monitor',
  ],
  'Wear Parts Series': [
    'Radiator',
    'Lamp',
    'Grease Gun',
    'Fuel Transfer Pump',
    'Gas Spring (Support Rod)',
    'Hand Spray Paint / Tools',
    'Valve Chamber Cover',
    'Cooling Pipe / Cross Joint',
    'Tank Cap',
    'Breather / Breather Cap',
    'Water Tank Cap / Oil Tank Cap',
    'Stainer',
    'Oil Filter Head',
    'Oil Separator',
    'Fuel Line Assy',
    'Turbo Inlet Pipe',
    'Delivery Line',
    'Nozzle Pipe',
    'Fuel Pump',
  ],
  'Gear Parts Series': [
    'Sun Gear',
    'Rotary Ring Gear',
    'Swing Drive',
    'Motor Case',
    'Walking Outside Cover',
    'Swinging Base',
    'Motor Shaft',
    'Planet Shaft',
    'Drive Disk',
    'Idler Gear',
    'Crankshaft Gear',
    'Fuel Pump Gear',
    'Oil Pump Gear',
    'Bearing',
  ],
  'Seal Series': [
    'JCB Cylinder Seal Kit',
    'Break Hummer Seal Kit',
    'Diaphragm',
    'Bulldozer Seal Kit',
    'Loader Seal Kit',
    'Crane Seal Kit',
    'Buffer Ring',
    'Dust Seal',
    'Dust Seal / Piston Seal',
    'Wear Ring',
    'OHM/NCF Piston Seal',
    'OUY Piston Seal',
    'UKH/N4W Piston Seal',
    'TFG/TFP Back Up Ring',
    'TCN/TCY Oil Seal',
  ],
  'Engine Parts Series': [
    'Cylinder Block Series',
    'Cylinder Head Series',
    'Crankshaft Series',
    'Camshaft Series',
    'Liner / Piston',
    'Full Gasket Kit',
    'Main Bearing Series',
    'Piston Ring Series',
    'Engine Valve Series',
    'Valve Guide Series',
    'Seat Valve Series',
    'Connecting Rod',
    'Bolt And Nut Service',
    'Push Rod / Tappet / Valve Key',
    'Valve Spring',
    'Rocker Valve Series',
    'Nozzle Series',
    'Nozzle Bushing / Heater Plug',
    'Fly Wheel Series',
    'Floating Oil Seal',
    'Manifold Exhaust',
  ],
  'Hydraulic Parts Series': [
    'Hydraulic Pump Series',
    'Feed Back / Spring',
    'Press Pin / Disk / Spring / Drum Seal',
    'Change Pump Material',
    'Swing Motor',
    'Control Valve',
    'Travel Motor',
    'Standby Valve / Hydraulic Hammer',
    'Regulator Series',
    'Gear Pump Series',
    'Gear Pump Assy',
    'Main & Service Valve',
    'Check Valve',
    'Nozzle & Plunger & Valve Series',
  ],
  'Chassis Parts Series': [
    'Muffler',
    'Track Spring',
    'Track Link And Track Link Assy',
    'Track Roller',
    'Idler / Up Roller',
    'Adjust Cylinder / Spring Seat',
    'Sprocket',
    'Roller Carrier',
    'Undercarriage Spare Parts',
    'Track Shoe',
    'Teeth',
    'Hydraulic Cylinder Assy And Spare Parts',
    'Turntable Series',
    'Hydraulic Hose Crimping Machine',
  ],
  'Hammer Breaker Series': [
    'Hammer Breaker Assy',
    'Hammer Breaker Spare Parts',
    'Excavator Model',
  ],
};

export const SERIES_LIST = Object.keys(PART_TAXONOMY);

export const ALL_CATEGORIES = Array.from(
  new Set(Object.values(PART_TAXONOMY).flat())
);

export const ALL_TAXONOMY_CATEGORIES = ALL_CATEGORIES;

/**
 * Normalizes input category against official taxonomy
 */
export function normalizeCategoryName(rawCategory: string): string {
  if (!rawCategory) return '';
  const trimmed = rawCategory.trim();
  const found = ALL_CATEGORIES.find(c => c.toLowerCase() === trimmed.toLowerCase());
  return found || trimmed;
}

/**
 * Given a category string, return the matching series, or fallback if not found
 */
export function getSeriesForCategory(category: string): string {
  if (!category) return 'Engine Parts Series';
  const cleanCat = category.trim().toLowerCase();
  for (const [series, cats] of Object.entries(PART_TAXONOMY)) {
    if (cats.some(c => c.toLowerCase() === cleanCat)) {
      return series;
    }
  }
  // Keyword-based heuristic matching for legacy or custom inputs
  if (cleanCat.includes('seal') || cleanCat.includes('o-ring') || cleanCat.includes('gasket kit') && !cleanCat.includes('full gasket')) {
    return 'Seal Series';
  }
  if (cleanCat.includes('hydraul') || cleanCat.includes('valve') && !cleanCat.includes('chamber') || cleanCat.includes('pump') && cleanCat.includes('gear')) {
    return 'Hydraulic Parts Series';
  }
  if (cleanCat.includes('engine') || cleanCat.includes('cylinder') || cleanCat.includes('piston') || cleanCat.includes('crankshaft')) {
    return 'Engine Parts Series';
  }
  if (cleanCat.includes('motor') || cleanCat.includes('starter') || cleanCat.includes('alternator') || cleanCat.includes('turbo')) {
    return 'Motor Series';
  }
  if (cleanCat.includes('gear') || cleanCat.includes('shaft') || cleanCat.includes('bearing')) {
    return 'Gear Parts Series';
  }
  if (cleanCat.includes('track') || cleanCat.includes('roller') || cleanCat.includes('undercarriage') || cleanCat.includes('chassis') || cleanCat.includes('shoe') || cleanCat.includes('teeth')) {
    return 'Chassis Parts Series';
  }
  if (cleanCat.includes('breaker') || cleanCat.includes('hammer')) {
    return 'Hammer Breaker Series';
  }
  if (cleanCat.includes('cable') || cleanCat.includes('wire') || cleanCat.includes('monitor') || cleanCat.includes('electric')) {
    return 'Electrical Parts Series';
  }
  return 'Wear Parts Series';
}

/**
 * Return categories list for a selected series
 */
export function getCategoriesForSeries(series: string): string[] {
  return PART_TAXONOMY[series] || [];
}
