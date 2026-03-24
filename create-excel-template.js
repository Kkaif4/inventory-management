const XLSX = require('xlsx');
const path = require('path');

// Headers with normal casing
const headers = [
  'Product Group Name',
  'Brand',
  'HSN Code',
  'GST Rate',
  'Base Unit',
  'Purchase Unit',
  'Conversion Ratio',
  'Category L1',
  'Category L2',
  'Category L3',
  'Variant SKU',
  'Variant Spec',
  'Purchase Price',
  'Selling Price',
  'Pricing Method',
  'Markup Percent',
  'Min Stock Level',
  'Warehouse Name',
  'Current Stock',
  'Batch Date',
  'Batch Cost Per Unit'
];

// Sample data
const sampleData = [
  ['Electric Drill', 'Bosch', '84672100', 18, 'Piece', 'Box', 10, 'Tools', 'Power Tools', 'Drills', 'BOS-DRL-500', '500W', 2500, 2875, 'MARKUP', 15, 10, 'Main Distribution Center', 35, '15/02/2026', 2500],
  ['Electric Drill', 'Bosch', '84672100', 18, 'Piece', 'Box', 10, 'Tools', 'Power Tools', 'Drills', 'BOS-DRL-750', '750W', 3200, 3680, 'MARKUP', 15, 8, 'Main Distribution Center', 28, '15/02/2026', 3200],
  ['Electric Drill', 'Bosch', '84672100', 18, 'Piece', 'Box', 10, 'Tools', 'Power Tools', 'Drills', 'BOS-DRL-1000', '1000W', 3800, 4370, 'MARKUP', 15, 6, 'Main Distribution Center', 20, '15/02/2026', 3800],
  ['Cordless Drill', 'DeWalt', '84672100', 18, 'Piece', 'Box', 10, 'Tools', 'Power Tools', 'Drills', 'DEW-CD-18V', '18V Battery', 4800, 5500, 'MANUAL', '', 5, 'Main Distribution Center', 15, '16/02/2026', 4800],
  ['Angle Grinder', 'Stanley', '84672900', 18, 'Piece', 'Box', 10, 'Tools', 'Power Tools', 'Grinders', 'STN-GRN-4', '4 Inch', 1800, 2100, 'MARKUP', 17, 12, 'Main Distribution Center', 40, '10/02/2026', 1800],
  ['Angle Grinder', 'Stanley', '84672900', 18, 'Piece', 'Box', 10, 'Tools', 'Power Tools', 'Grinders', 'STN-GRN-5', '5 Inch', 2200, 2600, 'MARKUP', 18, 10, 'Main Distribution Center', 32, '10/02/2026', 2200],
  ['Hammer Drill', 'DeWalt', '84672100', 18, 'Piece', 'Box', 10, 'Tools', 'Power Tools', 'Hammer Drills', 'DEW-HDR-800', '800W', 4200, 4830, 'MARKUP', 15, 6, 'Main Distribution Center', 18, '12/02/2026', 4200],
  ['Rotary Hammer', 'Bosch', '84672100', 18, 'Piece', 'Box', 10, 'Tools', 'Power Tools', 'Hammer Drills', 'BOS-RH-1200', '1200W', 7200, 8280, 'MARKUP', 15, 4, 'Main Distribution Center', 10, '16/02/2026', 7200],
  ['Impact Driver', 'DeWalt', '84672900', 18, 'Piece', 'Box', 10, 'Tools', 'Power Tools', 'Impact Drivers', 'DEW-IMP-20V', '20V', 5200, 6000, 'MANUAL', '', 5, 'Main Distribution Center', 12, '12/02/2026', 5200],
  ['Circular Saw', 'Makita', '84672200', 18, 'Piece', 'Box', 10, 'Tools', 'Power Tools', 'Saws', 'MAK-CS-7', '7 Inch', 4600, 5290, 'MARKUP', 15, 5, 'Main Distribution Center', 14, '11/02/2026', 4600],
  ['Jigsaw Machine', 'Makita', '84672200', 18, 'Piece', 'Box', 10, 'Tools', 'Power Tools', 'Saws', 'MAK-JS-01', 'Wood Cutting', 3500, 4025, 'MARKUP', 15, 6, 'Main Distribution Center', 18, '13/02/2026', 3500],
  ['Bench Grinder', 'Makita', '84672900', 18, 'Piece', 'Box', 10, 'Tools', 'Workshop Tools', 'Grinders', 'MAK-BG-01', 'Industrial Bench', 3000, 3450, 'MARKUP', 15, 7, 'Main Distribution Center', 16, '09/02/2026', 3000],
  ['Heat Gun', 'Stanley', '85162900', 18, 'Piece', 'Box', 10, 'Tools', 'Power Tools', 'Heat Tools', 'STN-HG-2000', '2000W', 1500, 1800, 'MARKUP', 20, 10, 'Main Distribution Center', 25, '14/02/2026', 1500],
  ['Steel Hammer', 'Tata', '82052000', 12, 'Piece', 'Box', 20, 'Tools', 'Hand Tools', 'Hammers', 'TAT-HMR-500', '500g', 250, 320, 'MANUAL', '', 30, 'Main Distribution Center', 120, '05/02/2026', 250],
  ['Steel Hammer', 'Tata', '82052000', 12, 'Piece', 'Box', 20, 'Tools', 'Hand Tools', 'Hammers', 'TAT-HMR-1KG', '1kg', 350, 420, 'MANUAL', '', 25, 'Main Distribution Center', 100, '05/02/2026', 350],
  ['Adjustable Wrench', 'Taparia', '82041200', 12, 'Piece', 'Box', 20, 'Tools', 'Hand Tools', 'Wrenches', 'TAP-WRN-10', '10 Inch', 280, 340, 'MANUAL', '', 20, 'Main Distribution Center', 85, '06/02/2026', 280],
  ['Adjustable Wrench', 'Taparia', '82041200', 12, 'Piece', 'Box', 20, 'Tools', 'Hand Tools', 'Wrenches', 'TAP-WRN-12', '12 Inch', 340, 410, 'MANUAL', '', 20, 'Main Distribution Center', 75, '06/02/2026', 340],
  ['Screwdriver Set', 'Taparia', '82054000', 12, 'Set', 'Box', 10, 'Tools', 'Hand Tools', 'Screwdrivers', 'TAP-SD-6', '6 Piece', 180, 220, 'MANUAL', '', 30, 'Main Distribution Center', 140, '04/02/2026', 180],
  ['Screwdriver Set', 'Taparia', '82054000', 12, 'Set', 'Box', 10, 'Tools', 'Hand Tools', 'Screwdrivers', 'TAP-SD-12', '12 Piece', 320, 390, 'MANUAL', '', 20, 'Main Distribution Center', 90, '04/02/2026', 320],
  ['Bolt Cutter', 'Taparia', '82034000', 12, 'Piece', 'Box', 10, 'Tools', 'Hand Tools', 'Cutters', 'TAP-BC-18', '18 Inch', 900, 1100, 'MANUAL', '', 12, 'Main Distribution Center', 40, '12/02/2026', 900],
  ['Bolt Cutter', 'Taparia', '82034000', 12, 'Piece', 'Box', 10, 'Tools', 'Hand Tools', 'Cutters', 'TAP-BC-24', '24 Inch', 1400, 1700, 'MANUAL', '', 10, 'Main Distribution Center', 30, '12/02/2026', 1400],
  ['Combination Pliers', 'Taparia', '82032000', 12, 'Piece', 'Box', 20, 'Tools', 'Hand Tools', 'Pliers', 'TAP-PLR-01', 'Standard', 180, 240, 'MANUAL', '', 25, 'Main Distribution Center', 100, '11/02/2026', 180],
  ['Long Nose Pliers', 'Taparia', '82032000', 12, 'Piece', 'Box', 20, 'Tools', 'Hand Tools', 'Pliers', 'TAP-PLR-02', 'Long Nose', 200, 260, 'MANUAL', '', 20, 'Main Distribution Center', 90, '11/02/2026', 200],
  ['Allen Key Set', 'Taparia', '82054000', 12, 'Set', 'Box', 10, 'Tools', 'Hand Tools', 'Allen Keys', 'TAP-AK-9', '9 Piece', 120, 160, 'MANUAL', '', 30, 'Main Distribution Center', 150, '10/02/2026', 120],
  ['Allen Key Set', 'Taparia', '82054000', 12, 'Set', 'Box', 10, 'Tools', 'Hand Tools', 'Allen Keys', 'TAP-AK-15', '15 Piece', 220, 280, 'MANUAL', '', 20, 'Main Distribution Center', 110, '10/02/2026', 220],
  ['PVC Pipe Cutter', 'Stanley', '82034000', 12, 'Piece', 'Box', 10, 'Plumbing', 'Plumbing Tools', 'Cutters', 'STN-PVC-CUT', 'Standard', 420, 520, 'MARKUP', 20, 15, 'Main Distribution Center', 55, '07/02/2026', 420],
  ['Pipe Wrench', 'Ridgid', '82041200', 12, 'Piece', 'Box', 10, 'Plumbing', 'Plumbing Tools', 'Wrenches', 'RID-PW-12', '12 Inch', 950, 1140, 'MARKUP', 20, 10, 'Main Distribution Center', 30, '07/02/2026', 950],
  ['Pipe Wrench', 'Ridgid', '82041200', 12, 'Piece', 'Box', 10, 'Plumbing', 'Plumbing Tools', 'Wrenches', 'RID-PW-18', '18 Inch', 1350, 1620, 'MARKUP', 20, 8, 'Main Distribution Center', 22, '07/02/2026', 1350],
  ['Water Pump', 'Kirloskar', '84137000', 18, 'Piece', 'Box', 5, 'Plumbing', 'Plumbing Tools', 'Pumps', 'KIR-WP-1HP', '1HP', 6500, 7800, 'MARKUP', 20, 4, 'Main Distribution Center', 12, '08/02/2026', 6500],
  ['Water Pump', 'Kirloskar', '84137000', 18, 'Piece', 'Box', 5, 'Plumbing', 'Plumbing Tools', 'Pumps', 'KIR-WP-2HP', '2HP', 9500, 11400, 'MARKUP', 20, 3, 'Main Distribution Center', 8, '08/02/2026', 9500],
  ['PVC Pipe', 'Astral', '39172300', 18, 'Piece', 'Bundle', 20, 'Plumbing', 'Plumbing Materials', 'Pipes', 'AST-PVC-1', '1 Inch', 120, 160, 'MANUAL', '', 50, 'Main Distribution Center', 300, '07/02/2026', 120],
  ['PVC Pipe', 'Astral', '39172300', 18, 'Piece', 'Bundle', 20, 'Plumbing', 'Plumbing Materials', 'Pipes', 'AST-PVC-2', '2 Inch', 220, 280, 'MANUAL', '', 40, 'Main Distribution Center', 200, '07/02/2026', 220],
  ['Measuring Tape', 'Freemans', '90178010', 18, 'Piece', 'Box', 20, 'Tools', 'Measuring Tools', 'Tapes', 'FRM-MT-5', '5 Meter', 110, 140, 'MANUAL', '', 40, 'Main Distribution Center', 200, '03/02/2026', 110],
  ['Measuring Tape', 'Freemans', '90178010', 18, 'Piece', 'Box', 20, 'Tools', 'Measuring Tools', 'Tapes', 'FRM-MT-10', '10 Meter', 210, 260, 'MANUAL', '', 35, 'Main Distribution Center', 150, '03/02/2026', 210],
  ['Spirit Level', 'Stanley', '90318000', 18, 'Piece', 'Box', 10, 'Tools', 'Measuring Tools', 'Levels', 'STN-SL-24', '24 Inch', 550, 660, 'MARKUP', 20, 12, 'Main Distribution Center', 48, '08/02/2026', 550],
  ['Spirit Level', 'Stanley', '90318000', 18, 'Piece', 'Box', 10, 'Tools', 'Measuring Tools', 'Levels', 'STN-SL-36', '36 Inch', 720, 860, 'MARKUP', 20, 10, 'Main Distribution Center', 36, '08/02/2026', 720],
  ['Industrial Extension Cord', 'Havells', '85444299', 18, 'Piece', 'Box', 5, 'Electrical', 'Electrical Tools', 'Cables', 'HAV-EXT-10', '10 Meter', 650, 780, 'MARKUP', 20, 15, 'Main Distribution Center', 60, '09/02/2026', 650],
  ['Industrial Extension Cord', 'Havells', '85444299', 18, 'Piece', 'Box', 5, 'Electrical', 'Electrical Tools', 'Cables', 'HAV-EXT-20', '20 Meter', 950, 1140, 'MARKUP', 20, 10, 'Main Distribution Center', 42, '09/02/2026', 950],
  ['Digital Multimeter', 'Fluke', '90303100', 18, 'Piece', 'Box', 10, 'Electrical', 'Electrical Tools', 'Testing', 'FLK-DMM-01', 'Digital', 2500, 3000, 'MANUAL', '', 8, 'Main Distribution Center', 22, '09/02/2026', 2500],
  ['Wire Stripper', 'Stanley', '82032000', 12, 'Piece', 'Box', 10, 'Electrical', 'Electrical Tools', 'Strippers', 'STN-WS-01', 'Automatic', 350, 450, 'MARKUP', 20, 20, 'Main Distribution Center', 70, '09/02/2026', 350],
  ['Crimping Tool', 'Stanley', '82032000', 12, 'Piece', 'Box', 10, 'Electrical', 'Electrical Tools', 'Crimpers', 'STN-CR-01', 'Heavy Duty', 600, 750, 'MARKUP', 25, 15, 'Main Distribution Center', 50, '08/02/2026', 600],
  ['Safety Helmet', '3M', '65061010', 18, 'Piece', 'Box', 25, 'Safety', 'Safety Equipment', 'Helmets', '3M-HLM-01', 'Industrial', 320, 420, 'MANUAL', '', 25, 'Main Distribution Center', 95, '02/02/2026', 320],
  ['Safety Gloves', '3M', '61161000', 18, 'Pair', 'Box', 25, 'Safety', 'Safety Equipment', 'Gloves', '3M-GLV-01', 'Protective', 120, 160, 'MANUAL', '', 50, 'Main Distribution Center', 180, '02/02/2026', 120],
  ['Safety Goggles', '3M', '90049090', 18, 'Piece', 'Box', 25, 'Safety', 'Safety Equipment', 'Goggles', '3M-GOG-01', 'Protective', 150, 200, 'MANUAL', '', 35, 'Main Distribution Center', 120, '06/02/2026', 150],
  ['Reflective Safety Jacket', '3M', '62104000', 18, 'Piece', 'Box', 20, 'Safety', 'Safety Equipment', 'Jackets', '3M-JKT-01', 'High Visibility', 400, 520, 'MARKUP', 30, 20, 'Main Distribution Center', 60, '06/02/2026', 400]
];

// Create workbook and worksheet
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);

// Set column widths
const colWidths = [
  { wch: 20 }, // Product Group Name
  { wch: 15 }, // Brand
  { wch: 12 }, // HSN Code
  { wch: 10 }, // GST Rate
  { wch: 12 }, // Base Unit
  { wch: 12 }, // Purchase Unit
  { wch: 15 }, // Conversion Ratio
  { wch: 15 }, // Category L1
  { wch: 15 }, // Category L2
  { wch: 15 }, // Category L3
  { wch: 15 }, // Variant SKU
  { wch: 15 }, // Variant Spec
  { wch: 15 }, // Purchase Price
  { wch: 15 }, // Selling Price
  { wch: 15 }, // Pricing Method
  { wch: 15 }, // Markup Percent
  { wch: 15 }, // Min Stock Level
  { wch: 20 }, // Warehouse Name
  { wch: 15 }, // Current Stock
  { wch: 15 }, // Batch Date
  { wch: 18 }  // Batch Cost Per Unit
];
ws['!cols'] = colWidths;

// Format header row
const headerStyle = {
  font: { bold: true, color: { rgb: 'FFFFFF' } },
  fill: { fgColor: { rgb: '4472C4' } },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
};

// Apply header styles
for (let i = 0; i < headers.length; i++) {
  const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
  if (!ws[cellRef]) ws[cellRef] = {};
  ws[cellRef].s = headerStyle;
}

// Add worksheet to workbook
XLSX.utils.book_append_sheet(wb, ws, 'Products');

// Write file
const outputPath = path.join(__dirname, 'sample-template.xlsx');
XLSX.writeFile(wb, outputPath);
console.log(`✓ Excel template created: ${outputPath}`);
