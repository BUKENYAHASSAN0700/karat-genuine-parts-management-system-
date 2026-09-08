import * as XLSX from 'xlsx';
import { SparePart } from '../types';

export interface ValidationError {
  productName: string;
  cell: string;
  missingField: string;
  formattedMessage: string;
  rowNumber: number;
  columnKey: string;
}

export interface ParsedPartRow {
  name: string;
  oem_number: string;
  brand: SparePart['brand'];
  category: string;
  description: string;
  stock_quantity: number;
  min_stock_alert: number;
  unit_price: number;
  unit_cost: number;
  machinery_models: string[];
  warehouse_bin: string;
  part_number?: string;
  rawRowNumber: number;
}

export interface SpreadsheetValidationResult {
  isValid: boolean;
  totalRows: number;
  errors: ValidationError[];
  firstErrorMessage: string | null;
  validParts: ParsedPartRow[];
}

// Sample real-world heavy machinery inventory data for the official template
export const SAMPLE_TEMPLATE_DATA = [
  {
    'Part Name': 'Main Hydraulic Control Valve Assembly',
    'OEM Part Number': 'CAT-349D-HYD',
    'Manufacturer Brand': 'Caterpillar',
    'Category': 'Hydraulics & Cylinders',
    'Technical Description': 'High-pressure multi-spool main hydraulic control valve with integrated pilot relief valves for 45-ton crawler excavators.',
    'Initial Stock Qty': 4,
    'Mini Alert Stock': 2,
    'Unit Price USD': 3850,
    'Compatible Machinery': 'CAT 349D, CAT 349E, CAT 336D',
    'Warehouse Bin Location': 'Aisle 3 - Bay B - Level 2',
    'Product ID (Optional)': 'KA113',
  },
  {
    'Part Name': 'Common Rail Fuel Injector G3',
    'OEM Part Number': '6754-11-3011',
    'Manufacturer Brand': 'Komatsu',
    'Category': 'Engine & Fuel Injection',
    'Technical Description': 'Genuine high-pressure common rail electro-magnetic fuel injector for SAA6D107E Tier-3 diesel engine.',
    'Initial Stock Qty': 12,
    'Mini Alert Stock': 4,
    'Unit Price USD': 620,
    'Compatible Machinery': 'Komatsu PC200-8, PC220-8, PC270-8',
    'Warehouse Bin Location': 'Aisle 1 - Shelf C - Bin 04',
    'Product ID (Optional)': 'KA114',
  },
  {
    'Part Name': 'Final Drive Travel Motor Reduction Gearbox',
    'OEM Part Number': 'VOE14528731',
    'Manufacturer Brand': 'Volvo',
    'Category': 'Transmission & Final Drive',
    'Technical Description': 'Planetary gear final drive reduction transmission motor with mechanical automatic parking brake.',
    'Initial Stock Qty': 3,
    'Mini Alert Stock': 1,
    'Unit Price USD': 4920,
    'Compatible Machinery': 'Volvo EC480D, EC380D, EC360B',
    'Warehouse Bin Location': 'Heavy Bay 4 - Floor Pallet 02',
    'Product ID (Optional)': 'KA115',
  },
  {
    'Part Name': 'Heavy Duty Track Link Assembly (49 Links)',
    'OEM Part Number': '9239845-T',
    'Manufacturer Brand': 'Hitachi',
    'Category': 'Undercarriage & Tracks',
    'Technical Description': 'Sealed and lubricated heavy-duty track chain assembly with induction-hardened master pins and links.',
    'Initial Stock Qty': 6,
    'Mini Alert Stock': 2,
    'Unit Price USD': 2450,
    'Compatible Machinery': 'Hitachi ZX350-5G, ZX330-3, ZX370',
    'Warehouse Bin Location': 'Undercarriage Yard - Rack 12',
    'Product ID (Optional)': 'KA116',
  },
  {
    'Part Name': 'Hydraulic Pilot Joystick Controller',
    'OEM Part Number': 'XKAH-00042',
    'Manufacturer Brand': 'Hyundai',
    'Category': 'Cabin & Operator Controls',
    'Technical Description': 'Dual-axis precision proportional hydraulic pilot valve joystick with 4-button horn & auxiliary attachment toggle.',
    'Initial Stock Qty': 8,
    'Mini Alert Stock': 3,
    'Unit Price USD': 480,
    'Compatible Machinery': 'Hyundai R300LC-9, R330LC-9, R210-7',
    'Warehouse Bin Location': 'Aisle 2 - Shelf A - Bin 18',
    'Product ID (Optional)': 'KA117',
  },
  {
    'Part Name': 'Twin-Scroll Turbocharger Wastegated',
    'OEM Part Number': 'K1004273A',
    'Manufacturer Brand': 'Doosan',
    'Category': 'Turbochargers & Exhaust',
    'Technical Description': 'Water-cooled twin-scroll exhaust turbocharger with pneumatic wastegate actuator for DL08 diesel engine.',
    'Initial Stock Qty': 5,
    'Mini Alert Stock': 2,
    'Unit Price USD': 1180,
    'Compatible Machinery': 'Doosan DX340LCA, DX300LCA, DL300',
    'Warehouse Bin Location': 'Aisle 2 - Shelf D - Bin 09',
    'Product ID (Optional)': 'KA118',
  },
];

/**
 * Downloads the official Excel (.xlsx) template for KARAT inventory bulk upload
 */
export const downloadExcelTemplate = () => {
  const worksheet = XLSX.utils.json_to_sheet(SAMPLE_TEMPLATE_DATA);
  
  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 38 }, // Part Name
    { wch: 20 }, // OEM Part Number
    { wch: 20 }, // Manufacturer Brand
    { wch: 26 }, // Category
    { wch: 55 }, // Technical Description
    { wch: 18 }, // Initial Stock Qty
    { wch: 18 }, // Mini Alert Stock
    { wch: 16 }, // Unit Price USD
    { wch: 36 }, // Compatible Machinery
    { wch: 30 }, // Warehouse Bin Location
    { wch: 22 }, // Product ID
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'KARAT_Inventory_Upload');
  XLSX.writeFile(workbook, 'KARAT_Inventory_Bulk_Upload_Template.xlsx');
};

/**
 * Downloads the official CSV template for KARAT inventory bulk upload
 */
export const downloadCsvTemplate = () => {
  const headers = [
    'Part Name',
    'OEM Part Number',
    'Manufacturer Brand',
    'Category',
    'Technical Description',
    'Initial Stock Qty',
    'Mini Alert Stock',
    'Unit Price USD',
    'Compatible Machinery',
    'Warehouse Bin Location',
    'Product ID (Optional)'
  ];

  const rows = SAMPLE_TEMPLATE_DATA.map(item => [
    `"${item['Part Name']}"`,
    `"${item['OEM Part Number']}"`,
    `"${item['Manufacturer Brand']}"`,
    `"${item['Category']}"`,
    `"${item['Technical Description'].replace(/"/g, '""')}"`,
    item['Initial Stock Qty'],
    item['Mini Alert Stock'],
    item['Unit Price USD'],
    `"${item['Compatible Machinery']}"`,
    `"${item['Warehouse Bin Location']}"`,
    `"${item['Product ID (Optional)']}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'KARAT_Inventory_Bulk_Upload_Template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Matches brand string to allowed brands
 */
const normalizeBrand = (rawBrand: string): SparePart['brand'] | null => {
  const b = (rawBrand || '').trim().toLowerCase();
  if (b.includes('cat') || b.includes('caterpillar')) return 'Caterpillar';
  if (b.includes('komatsu')) return 'Komatsu';
  if (b.includes('volvo')) return 'Volvo';
  if (b.includes('hitachi')) return 'Hitachi';
  if (b.includes('hyundai')) return 'Hyundai';
  if (b.includes('doosan') || b.includes('develon')) return 'Doosan';
  return null;
};

/**
 * Parses and strictly validates any CSV or Excel file (ArrayBuffer / binary).
 * Generates exact cell coordinates (e.g. A12, C4) and exact error messages:
 * "{product name} in cell {A12} is missing {missing information}"
 */
export const parseAndValidateSpreadsheet = (
  fileData: ArrayBuffer | Uint8Array
): SpreadsheetValidationResult => {
  const workbook = XLSX.read(fileData, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return {
      isValid: false,
      totalRows: 0,
      errors: [
        {
          productName: 'Spreadsheet',
          cell: 'A1',
          missingField: 'Spreadsheet Sheet Data',
          formattedMessage: 'The spreadsheet contains no sheets or data.',
          rowNumber: 1,
          columnKey: 'A',
        }
      ],
      firstErrorMessage: 'The spreadsheet contains no sheets or readable data.',
      validParts: [],
    };
  }

  const worksheet = workbook.Sheets[firstSheetName];
  if (!worksheet || !worksheet['!ref']) {
    return {
      isValid: false,
      totalRows: 0,
      errors: [
        {
          productName: 'Spreadsheet',
          cell: 'A1',
          missingField: 'Inventory Data Rows',
          formattedMessage: 'The uploaded sheet is empty.',
          rowNumber: 1,
          columnKey: 'A',
        }
      ],
      firstErrorMessage: 'The uploaded sheet is empty.',
      validParts: [],
    };
  }

  const range = XLSX.utils.decode_range(worksheet['!ref']);
  
  // Find column mapping in Header Row (Row 0 / Excel Row 1)
  const headerRow = range.s.r;
  const colMap: Record<string, number> = {};

  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c: C });
    const cell = worksheet[cellAddress];
    if (cell && cell.v !== undefined) {
      const headerText = String(cell.v).toLowerCase().trim().replace(/[\s_-]+/g, '');
      if (headerText.includes('partname') || headerText.includes('productname') || headerText === 'name' || headerText.includes('itemname')) {
        colMap['name'] = C;
      } else if (headerText.includes('oem') || headerText.includes('oempart') || headerText.includes('oemnumber') || headerText.includes('oemcode')) {
        colMap['oem_number'] = C;
      } else if (headerText.includes('brand') || headerText.includes('manufacturer') || headerText.includes('make')) {
        colMap['brand'] = C;
      } else if (headerText.includes('category') || headerText.includes('system')) {
        colMap['category'] = C;
      } else if (headerText.includes('description') || headerText.includes('spec') || headerText.includes('detail') || headerText.includes('tech')) {
        colMap['description'] = C;
      } else if (headerText.includes('stock') || headerText.includes('qty') || headerText.includes('quantity') || headerText.includes('initialstock')) {
        colMap['stock_quantity'] = C;
      } else if (headerText.includes('minalert') || headerText.includes('minstock') || headerText.includes('minialert') || headerText.includes('alertstock')) {
        colMap['min_stock_alert'] = C;
      } else if (headerText.includes('unitprice') || headerText.includes('price') || headerText.includes('rate') || headerText.includes('sellingprice')) {
        colMap['unit_price'] = C;
      } else if (headerText.includes('machinery') || headerText.includes('compatib') || headerText.includes('models') || headerText.includes('fleet') || headerText.includes('fits')) {
        colMap['machinery_models'] = C;
      } else if (headerText.includes('bin') || headerText.includes('warehouse') || headerText.includes('location') || headerText.includes('shelf') || headerText.includes('rack')) {
        colMap['warehouse_bin'] = C;
      } else if (headerText.includes('productid') || headerText.includes('part#') || headerText.includes('partnumber') || headerText === 'id' || headerText.includes('karatid')) {
        colMap['part_number'] = C;
      }
    }
  }

  // Fallback to positional columns if headers weren't named with text (e.g. standard A-K order)
  const getColIndex = (fieldKey: string, fallbackIdx: number): number => {
    return colMap[fieldKey] !== undefined ? colMap[fieldKey] : fallbackIdx;
  };

  const colIndexName = getColIndex('name', 0);
  const colIndexOem = getColIndex('oem_number', 1);
  const colIndexBrand = getColIndex('brand', 2);
  const colIndexCat = getColIndex('category', 3);
  const colIndexDesc = getColIndex('description', 4);
  const colIndexStock = getColIndex('stock_quantity', 5);
  const colIndexMinAlert = getColIndex('min_stock_alert', 6);
  const colIndexPrice = getColIndex('unit_price', 7);
  const colIndexMachinery = getColIndex('machinery_models', 8);
  const colIndexBin = getColIndex('warehouse_bin', 9);
  const colIndexId = getColIndex('part_number', 10);

  const errors: ValidationError[] = [];
  const validParts: ParsedPartRow[] = [];
  let totalDataRows = 0;

  // Iterate each data row (Row 1+ in 0-indexed, which corresponds to Row 2+ in Excel)
  for (let R = headerRow + 1; R <= range.e.r; ++R) {
    const rowNumber = R + 1; // 1-based Excel row number (e.g. 12)
    
    // Check if entire row is empty
    let isRowBlank = true;
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = worksheet[address];
      if (cell && cell.v !== undefined && String(cell.v).trim() !== '') {
        isRowBlank = false;
        break;
      }
    }
    if (isRowBlank) continue; // Skip blank trailing rows

    totalDataRows++;

    const getCellValue = (colIdx: number): { val: any; strVal: string; cellRef: string } => {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: colIdx });
      const cell = worksheet[cellRef];
      const val = cell ? cell.v : undefined;
      const strVal = val !== undefined && val !== null ? String(val).trim() : '';
      return { val, strVal, cellRef };
    };

    // 1. Part Name
    const nameData = getCellValue(colIndexName);
    const rawName = nameData.strVal;
    const productName = rawName ? `"${rawName}"` : `Product in row ${rowNumber}`;

    if (!rawName) {
      errors.push({
        productName: `Product in row ${rowNumber}`,
        cell: nameData.cellRef,
        missingField: 'Part Name',
        formattedMessage: `Product in cell ${nameData.cellRef} is missing Part Name`,
        rowNumber,
        columnKey: nameData.cellRef.replace(/[0-9]/g, ''),
      });
    }

    // 2. OEM Number
    const oemData = getCellValue(colIndexOem);
    if (!oemData.strVal) {
      errors.push({
        productName,
        cell: oemData.cellRef,
        missingField: 'OEM Code / OEM Part #',
        formattedMessage: `${productName} in cell ${oemData.cellRef} is missing OEM Code / OEM Part #`,
        rowNumber,
        columnKey: oemData.cellRef.replace(/[0-9]/g, ''),
      });
    }

    // 3. Manufacturer / Brand
    const brandData = getCellValue(colIndexBrand);
    const parsedBrand = normalizeBrand(brandData.strVal);
    if (!brandData.strVal) {
      errors.push({
        productName,
        cell: brandData.cellRef,
        missingField: 'Manufacturer / Brand',
        formattedMessage: `${productName} in cell ${brandData.cellRef} is missing Manufacturer / Brand`,
        rowNumber,
        columnKey: brandData.cellRef.replace(/[0-9]/g, ''),
      });
    } else if (!parsedBrand) {
      errors.push({
        productName,
        cell: brandData.cellRef,
        missingField: 'Valid OEM Brand (Caterpillar, Komatsu, Volvo, Hitachi, Hyundai, Doosan)',
        formattedMessage: `${productName} in cell ${brandData.cellRef} has invalid Brand "${brandData.strVal}" (Must be Caterpillar, Komatsu, Volvo, Hitachi, Hyundai, or Doosan)`,
        rowNumber,
        columnKey: brandData.cellRef.replace(/[0-9]/g, ''),
      });
    }

    // 4. Category
    const catData = getCellValue(colIndexCat);
    if (!catData.strVal) {
      errors.push({
        productName,
        cell: catData.cellRef,
        missingField: 'Category',
        formattedMessage: `${productName} in cell ${catData.cellRef} is missing Category`,
        rowNumber,
        columnKey: catData.cellRef.replace(/[0-9]/g, ''),
      });
    }

    // 5. Technical Description
    const descData = getCellValue(colIndexDesc);
    if (!descData.strVal) {
      errors.push({
        productName,
        cell: descData.cellRef,
        missingField: 'Technical Description',
        formattedMessage: `${productName} in cell ${descData.cellRef} is missing Technical Description`,
        rowNumber,
        columnKey: descData.cellRef.replace(/[0-9]/g, ''),
      });
    }

    // 6. Initial Stock Quantity (must be at least 1)
    const stockData = getCellValue(colIndexStock);
    const parsedStock = Number(stockData.strVal);
    if (!stockData.strVal || isNaN(parsedStock) || parsedStock < 1) {
      errors.push({
        productName,
        cell: stockData.cellRef,
        missingField: 'Initial Stock Quantity (must be at least 1 unit)',
        formattedMessage: `${productName} in cell ${stockData.cellRef} is missing Initial Stock Quantity (must be at least 1)`,
        rowNumber,
        columnKey: stockData.cellRef.replace(/[0-9]/g, ''),
      });
    }

    // 7. Mini Alert Stock (must be at least 1)
    const minAlertData = getCellValue(colIndexMinAlert);
    const parsedMinAlert = Number(minAlertData.strVal);
    if (!minAlertData.strVal || isNaN(parsedMinAlert) || parsedMinAlert < 1) {
      errors.push({
        productName,
        cell: minAlertData.cellRef,
        missingField: 'Mini Alert Stock (must be at least 1 unit)',
        formattedMessage: `${productName} in cell ${minAlertData.cellRef} is missing Mini Alert Stock (must be at least 1)`,
        rowNumber,
        columnKey: minAlertData.cellRef.replace(/[0-9]/g, ''),
      });
    }

    // 8. Unit Price (must be > 0)
    const priceData = getCellValue(colIndexPrice);
    const parsedPrice = Number(priceData.strVal.replace(/[^0-9.]/g, ''));
    if (!priceData.strVal || isNaN(parsedPrice) || parsedPrice <= 0) {
      errors.push({
        productName,
        cell: priceData.cellRef,
        missingField: 'Unit Price (must be a valid amount greater than 0)',
        formattedMessage: `${productName} in cell ${priceData.cellRef} is missing Unit Price (must be greater than 0)`,
        rowNumber,
        columnKey: priceData.cellRef.replace(/[0-9]/g, ''),
      });
    }

    // 9. Compatible Heavy Machinery
    const machineryData = getCellValue(colIndexMachinery);
    if (!machineryData.strVal) {
      errors.push({
        productName,
        cell: machineryData.cellRef,
        missingField: 'Compatible Heavy Machinery Models',
        formattedMessage: `${productName} in cell ${machineryData.cellRef} is missing Compatible Heavy Machinery Models`,
        rowNumber,
        columnKey: machineryData.cellRef.replace(/[0-9]/g, ''),
      });
    }

    // 10. Warehouse Storage Bin Location
    const binData = getCellValue(colIndexBin);
    if (!binData.strVal) {
      errors.push({
        productName,
        cell: binData.cellRef,
        missingField: 'Warehouse Storage Bin Location',
        formattedMessage: `${productName} in cell ${binData.cellRef} is missing Warehouse Storage Bin Location`,
        rowNumber,
        columnKey: binData.cellRef.replace(/[0-9]/g, ''),
      });
    }

    // Optional Part ID / Number
    const idData = getCellValue(colIndexId);
    let optionalId = idData.strVal ? idData.strVal.toUpperCase() : undefined;
    if (optionalId && !optionalId.startsWith('KA')) {
      // normalize or keep
    }

    // If this row has no errors, push to candidate list
    if (rawName && oemData.strVal && parsedBrand && catData.strVal && descData.strVal && !isNaN(parsedStock) && parsedStock >= 1 && !isNaN(parsedMinAlert) && parsedMinAlert >= 1 && !isNaN(parsedPrice) && parsedPrice > 0 && machineryData.strVal && binData.strVal) {
      const modelsArray = machineryData.strVal.split(',').map(s => s.trim()).filter(Boolean);
      validParts.push({
        name: rawName,
        oem_number: oemData.strVal,
        brand: parsedBrand,
        category: catData.strVal,
        description: descData.strVal,
        stock_quantity: parsedStock,
        min_stock_alert: parsedMinAlert,
        unit_price: parsedPrice,
        unit_cost: parsedPrice * 0.65,
        machinery_models: modelsArray.length > 0 ? modelsArray : ['Universal Equipment'],
        warehouse_bin: binData.strVal,
        part_number: optionalId,
        rawRowNumber: rowNumber,
      });
    }
  }

  if (totalDataRows === 0) {
    return {
      isValid: false,
      totalRows: 0,
      errors: [
        {
          productName: 'Spreadsheet',
          cell: 'A2',
          missingField: 'Data Rows',
          formattedMessage: 'No product data rows found in the uploaded file.',
          rowNumber: 2,
          columnKey: 'A',
        }
      ],
      firstErrorMessage: 'No product data rows found in the uploaded file.',
      validParts: [],
    };
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    totalRows: totalDataRows,
    errors,
    firstErrorMessage: errors.length > 0 ? errors[0].formattedMessage : null,
    validParts: isValid ? validParts : [],
  };
};
