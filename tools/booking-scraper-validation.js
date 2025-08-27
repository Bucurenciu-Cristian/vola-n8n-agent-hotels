// BOOKING.COM SCRAPER VALIDATION TOOL
// Validates final parameters before sending to Apify voyager~booking-scraper
// Used for last-mile validation of scraper API parameters

// Debug: Log incoming parameters
console.log('=== BOOKING SCRAPER VALIDATION ===');

// Get validated parameters from previous validation step
const inputParams = $input.all()[0];
console.log('Input from previous validation:', JSON.stringify(inputParams, null, 2));

// Extract the validated parameters
const params = inputParams.validatedParams || inputParams;

// Final parameter mapping for Apify Booking scraper
const scrapingParams = {
  checkIn: params.checkIn,
  checkOut: params.checkOut,
  search: params.search,
  adults: params.adults || 2,
  children: params.children || 0,
  rooms: params.rooms || 1,
  currency: params.currency || 'EUR',
  language: params.language || 'ro',
  propertyType: params.propertyType || 'hotels',
  flexWindow: String(params.flexWindow || "0"),  // Must be string
  maxItems: 15  // Limit for performance
};

console.log('Final scraper parameters:', JSON.stringify(scrapingParams, null, 2));

// Final validation checks
const errors = [];
const warnings = [];

// Critical validations for Apify scraper
if (!scrapingParams.checkIn || !scrapingParams.checkOut) {
  errors.push('Missing check-in or check-out dates for scraper');
}

if (!scrapingParams.search || scrapingParams.search.trim() === '') {
  errors.push('Missing search destination for Booking.com scraper');
}

// Date validation (dates should already be validated, but double-check)
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
if (!dateRegex.test(scrapingParams.checkIn)) {
  errors.push(`Invalid checkIn format for scraper: ${scrapingParams.checkIn}`);
}
if (!dateRegex.test(scrapingParams.checkOut)) {
  errors.push(`Invalid checkOut format for scraper: ${scrapingParams.checkOut}`);
}

// FlexWindow validation (critical for Booking.com)
const validFlexWindows = ["0", "1", "2", "7"];
if (!validFlexWindows.includes(scrapingParams.flexWindow)) {
  errors.push(`Invalid flexWindow: "${scrapingParams.flexWindow}" (must be one of: ${validFlexWindows.join(', ')})`);
}

// Guest and room validation
if (scrapingParams.adults < 1) {
  errors.push('Adults must be at least 1');
}

if (scrapingParams.rooms < 1) {
  errors.push('Rooms must be at least 1');
}

if (scrapingParams.children < 0) {
  errors.push('Children cannot be negative');
}

// Property type validation
const validPropertyTypes = ['hotels', 'apartments', 'homes'];
if (!validPropertyTypes.includes(scrapingParams.propertyType)) {
  warnings.push(`Unusual propertyType: ${scrapingParams.propertyType}`);
}

// Guest capacity warnings
const totalGuests = scrapingParams.adults + scrapingParams.children;
if (totalGuests > 30) {
  warnings.push(`Very large group (${totalGuests} guests) may have limited results`);
}

// Room capacity logic check
if (scrapingParams.adults > (scrapingParams.rooms * 2)) {
  warnings.push(`${scrapingParams.adults} adults in ${scrapingParams.rooms} room(s) may be crowded`);
}

// Create final output for Apify HTTP request
const apifyPayload = {
  ...scrapingParams
};

const validationResult = {
  nodeType: 'booking-scraper',
  timestamp: new Date().toISOString(),
  finalParams: apifyPayload,
  errors,
  warnings,
  ready: errors.length === 0
};

console.log('=== BOOKING SCRAPER VALIDATION RESULTS ===');
console.log(JSON.stringify(validationResult, null, 2));

if (errors.length > 0) {
  const errorMsg = `Booking scraper validation failed: ${errors.join(', ')}`;
  console.error(errorMsg);
  throw new Error(errorMsg);
}

if (warnings.length > 0) {
  console.warn('Booking scraper warnings:', warnings.join(', '));
}

console.log('✅ Booking scraper validation passed - ready for API call');

return [{
  scrapingParams: apifyPayload,
  validationLog: validationResult
}];