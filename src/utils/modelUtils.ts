const KNOWN_MANUFACTURERS = [
  'Caterpillar',
  'CAT',
  'Komatsu',
  'Volvo',
  'Hitachi',
  'Hyundai',
  'Doosan',
  'Furukawa',
  'Soosan',
  'Daemo',
  'Cummins',
  'JCB',
  'Sany',
  'Kobelco',
  'Bobcat',
  'Liebherr',
  'Case',
  'John Deere',
  'Deere',
  'Perkins',
  'Isuzu',
  'Mitsubishi',
  'Yanmar',
  'Kubota'
];

/**
 * Removes manufacturer / company names from a machinery model string.
 * Example:
 * "Komatsu PC400-7" -> "PC400-7"
 * "CAT 349D, CAT 345C" -> "349D, 345C"
 * "Volvo EC480D" -> "EC480D"
 */
export function cleanModelName(modelStr?: string | null, brand?: string | null): string {
  if (!modelStr) return 'Standard';
  
  let result = modelStr;

  // If a specific brand is provided, strip it first
  if (brand && brand.trim() && brand !== 'All') {
    const brandPattern = new RegExp(`\\b${brand.trim()}\\b\\s*[-:/]?\\s*`, 'gi');
    result = result.replace(brandPattern, '');
  }

  // Strip known manufacturer company names
  for (const mfg of KNOWN_MANUFACTURERS) {
    const mfgPattern = new RegExp(`\\b${mfg}\\b\\s*[-:/]?\\s*`, 'gi');
    result = result.replace(mfgPattern, '');
  }

  // Clean trailing/leading dashes, colons, spaces, and duplicate commas
  result = result
    .split(',')
    .map(part => part.trim().replace(/^[-:/]\s*/, '').replace(/\s*[-:/]$/, '').trim())
    .filter(Boolean)
    .join(', ');

  return result.trim() || 'Standard';
}

/**
 * Clean an array of machinery models or a single model string
 */
export function getCleanMachineryModel(
  model?: string | null, 
  machineryModels?: string[] | null, 
  brand?: string | null
): string {
  if (model) {
    return cleanModelName(model, brand);
  }
  if (machineryModels && machineryModels.length > 0) {
    const cleanedList = machineryModels.map(m => cleanModelName(m, brand)).filter(Boolean);
    return cleanedList.length > 0 ? cleanedList.join(', ') : 'Standard';
  }
  return 'Standard';
}
