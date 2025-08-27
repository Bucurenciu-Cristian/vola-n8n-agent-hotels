// AIRBNB SCRAPER VALIDATION TOOL
// Validates final parameters before sending to Apify tri_angle~airbnb-scraper
// Used for last-mile validation of scraper API parameters

// Debug: Log incoming parameters
console.log('=== AIRBNB SCRAPER VALIDATION ===');

// Get validated parameters from previous validation step
const inputParams = $input.all()[0];
console.log('Input from previous validation:', JSON.stringify(inputParams, null, 2));

// Extract the validated parameters
const params = inputParams.validatedParams || inputParams;

// Final parameter mapping for Apify Airbnb scraper
const scrapingParams = {
  adults: params.adults || 2,
  checkIn: params.checkIn,
  checkOut: params.checkOut,
  children: params.children || 0,
  currency: params.currency || 'EUR',
  infants: params.infants || 0,
  locationQueries: Array.isArray(params.locationQueries) ? params.locationQueries : [params.locationQueries || 'Unknown'],
  minBathrooms: params.minBathrooms || 1,
  minBedrooms: params.minBedrooms || 1,
  minBeds: params.minBeds || 1,
  pets: params.pets || 0,
  priceMax: params.priceMax || 999999,
  priceMin: params.priceMin || 0,
  locale: params.locale || 'ro-RO',
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

if (!scrapingParams.locationQueries || scrapingParams.locationQueries.length === 0 || 
    !scrapingParams.locationQueries[0] || scrapingParams.locationQueries[0] === 'Unknown') {
  errors.push('Invalid location queries for Airbnb scraper');
}

// Date validation (dates should already be validated, but double-check)
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
if (!dateRegex.test(scrapingParams.checkIn)) {
  errors.push(`Invalid checkIn format for scraper: ${scrapingParams.checkIn}`);
}
if (!dateRegex.test(scrapingParams.checkOut)) {
  errors.push(`Invalid checkOut format for scraper: ${scrapingParams.checkOut}`);
}

// Price range warnings
if (scrapingParams.priceMax <= scrapingParams.priceMin) {
  warnings.push('Price range may be too restrictive');
}

// Guest capacity warnings
const totalGuests = scrapingParams.adults + scrapingParams.children + scrapingParams.infants;
if (totalGuests > 16) {
  warnings.push(`Large group (${totalGuests} guests) may have limited results`);
}

// Create final output for Apify HTTP request
const apifyPayload = {
  ...scrapingParams
};

const validationResult = {
  nodeType: 'airbnb-scraper',
  timestamp: new Date().toISOString(),
  finalParams: apifyPayload,
  errors,
  warnings,
  ready: errors.length === 0
};

console.log('=== AIRBNB SCRAPER VALIDATION RESULTS ===');
console.log(JSON.stringify(validationResult, null, 2));

if (errors.length > 0) {
  const errorMsg = `Airbnb scraper validation failed: ${errors.join(', ')}`;
  console.error(errorMsg);
  throw new Error(errorMsg);
}

if (warnings.length > 0) {
  console.warn('Airbnb scraper warnings:', warnings.join(', '));
}

console.log('✅ Airbnb scraper validation passed - ready for API call');

return [{
  scrapingParams: apifyPayload,
  validationLog: validationResult
}];