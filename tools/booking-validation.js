// BOOKING.COM VALIDATION TOOL
// Validates parameters for Booking.com scraper API calls
// Used in N8N Code node for parameter validation before API requests

// Debug: Log all available parameters from AI Agent
console.log('=== BOOKING VALIDATION DEBUG ===');
console.log('Available parameters from $fromAI:');
const availableParams = {};
const testParams = [
  'check_in_date', 'check_out_date', 'Destination', 'destination', 'flexibility_window',
  'flexWindow', 'adults', 'children', 'currency', 'rooms', 'propertyType',
  'checkIn', 'checkOut', 'location', 'search'
];

testParams.forEach(param => {
  try {
    const value = $fromAI(param);
    if (value !== undefined) {
      availableParams[param] = value;
      console.log(`✓ ${param}: ${JSON.stringify(value)}`);
    } else {
      console.log(`✗ ${param}: undefined`);
    }
  } catch (e) {
    console.log(`✗ ${param}: ERROR - ${e.message}`);
  }
});

console.log('Available parameters object:', JSON.stringify(availableParams, null, 2));

// Extract parameters with multiple fallback options
let params = {
  checkIn: $fromAI('check_in_date') || $fromAI('checkIn') || $fromAI('check_in'),
  checkOut: $fromAI('check_out_date') || $fromAI('checkOut') || $fromAI('check_out'),
  search: $fromAI('Destination') || $fromAI('destination') || $fromAI('location') || $fromAI('search'),
  flexWindow: $fromAI('flexibility_window') || $fromAI('flexWindow') || "0",
  adults: $fromAI('adults') || $fromAI('Adults') || 2,
  children: $fromAI('children') || $fromAI('Children') || 0,
  currency: $fromAI('currency') || $fromAI('Currency') || 'EUR',
  rooms: $fromAI('rooms') || $fromAI('Rooms') || 1,
  propertyType: $fromAI('propertyType') || $fromAI('property_type') || 'hotels',
  language: 'ro'
};

console.log('Extracted parameters:', JSON.stringify(params, null, 2));

const errors = [];
const warnings = [];
const autoCorrections = [];

// Date format validation
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
if (!params.checkIn || !dateRegex.test(params.checkIn)) {
  errors.push(`Invalid or missing checkIn: ${params.checkIn} (must be YYYY-MM-DD format)`);
}
if (!params.checkOut || !dateRegex.test(params.checkOut)) {
  errors.push(`Invalid or missing checkOut: ${params.checkOut} (must be YYYY-MM-DD format)`);
}

// Destination validation with detailed error info
if (!params.search || params.search.trim() === '') {
  errors.push(`Missing destination - search parameter is ${JSON.stringify(params.search)}`);
  
  // Try to help debug by showing what destination-related parameters were available
  const destinationParams = {
    Destination: $fromAI('Destination'),
    destination: $fromAI('destination'),
    location: $fromAI('location'),
    search: $fromAI('search')
  };
  console.log('DEBUG - Destination parameters available:', JSON.stringify(destinationParams, null, 2));
}

// Flexibility window validation (critical for Booking.com)
const validFlexWindows = ["0", "1", "2", "7"];
if (!validFlexWindows.includes(String(params.flexWindow))) {
  autoCorrections.push(`flexWindow corrected from "${params.flexWindow}" to "0" (valid: ${validFlexWindows.join(', ')})`);
  params.flexWindow = "0";
}

// Date logic validation
if (params.checkIn && params.checkOut && dateRegex.test(params.checkIn) && dateRegex.test(params.checkOut)) {
  const checkInDate = new Date(params.checkIn);
  const checkOutDate = new Date(params.checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkInDate < today) {
    errors.push(`checkIn ${params.checkIn} is in the past`);
  }
  if (checkOutDate <= checkInDate) {
    errors.push(`checkOut ${params.checkOut} must be after checkIn ${params.checkIn}`);
  }
}

// Guest and room validation
if (params.adults < 1) {
  autoCorrections.push(`Adults corrected from ${params.adults} to 1`);
  params.adults = 1;
}

if (params.children < 0) {
  autoCorrections.push(`Children corrected from ${params.children} to 0`);
  params.children = 0;
}

if (params.rooms < 1) {
  autoCorrections.push(`Rooms corrected from ${params.rooms} to 1`);
  params.rooms = 1;
}

// Property type validation
const validPropertyTypes = ['hotels', 'apartments', 'homes'];
if (!validPropertyTypes.includes(params.propertyType)) {
  autoCorrections.push(`PropertyType corrected from "${params.propertyType}" to "hotels"`);
  params.propertyType = 'hotels';
}

// Log comprehensive validation results
const validationLog = {
  nodeType: 'booking',
  timestamp: new Date().toISOString(),
  extractedParams: params,
  availableFromAI: availableParams,
  errors,
  warnings,
  autoCorrections
};

console.log('=== BOOKING VALIDATION RESULTS ===');
console.log(JSON.stringify(validationLog, null, 2));

if (errors.length > 0) {
  const errorMsg = `BOOKING validation failed: ${errors.join(', ')}`;
  console.error(errorMsg);
  throw new Error(errorMsg);
}

if (warnings.length > 0) {
  console.warn('BOOKING validation warnings:', warnings.join(', '));
}

if (autoCorrections.length > 0) {
  console.log('BOOKING auto-corrections applied:', autoCorrections.join(', '));
}

console.log('✅ BOOKING validation passed');

return [{ 
  validatedParams: params,
  validationLog: validationLog
}];