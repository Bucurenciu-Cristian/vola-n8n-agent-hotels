// AIRBNB VALIDATION TOOL
// Validates parameters for Airbnb scraper API calls
// Used in N8N Code node for parameter validation before API requests

// Debug: Log parameters received from AI Agent
console.log('=== AIRBNB VALIDATION DEBUG ===');

// Check what the AI Agent provided via $fromAI()
let aiParams;
try {
  aiParams = $fromAI();
  console.log('Full $fromAI() output:', JSON.stringify(aiParams, null, 2));
} catch (e) {
  console.log('Error accessing $fromAI():', e.message);
  aiParams = {};
}

// Extract parameters from AI Agent output
const params = {
  adults: aiParams.adults || 2,
  checkIn: aiParams.check_in_date || aiParams.checkIn,
  checkOut: aiParams.check_out_date || aiParams.checkOut,
  children: aiParams.children || 0,
  currency: aiParams.currency || 'EUR',
  infants: aiParams.infants || 0,
  locationQueries: aiParams.locationQueries || 
                   (aiParams.destination ? [aiParams.destination] : null),
  minBathrooms: aiParams.min_bathrooms || 1,
  minBedrooms: aiParams.min_bedrooms || 1,
  minBeds: aiParams.min_beds || 1,
  pets: aiParams.pets || 0,
  priceMax: aiParams.price_max || 999999,
  priceMin: aiParams.price_min || 0,
  locale: 'ro-RO'
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

// Location validation with detailed error info
if (!params.locationQueries || !Array.isArray(params.locationQueries) || 
    params.locationQueries.length === 0 || !params.locationQueries[0] || 
    params.locationQueries[0].trim() === '') {
  errors.push(`Missing destination - locationQueries is ${JSON.stringify(params.locationQueries)}`);
  
  console.log('DEBUG - AI provided:', JSON.stringify(aiParams, null, 2));
}

// Price validation
if (params.priceMin > params.priceMax) {
  warnings.push(`priceMin (${params.priceMin}) > priceMax (${params.priceMax}) - may return no results`);
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

// Guest count validation
if (params.adults < 1) {
  autoCorrections.push(`Adults corrected from ${params.adults} to 1`);
  params.adults = 1;
}

// Log comprehensive validation results
const validationLog = {
  nodeType: 'airbnb',
  timestamp: new Date().toISOString(),
  aiOutput: aiParams,
  extractedParams: params,
  errors,
  warnings,
  autoCorrections
};

console.log('=== AIRBNB VALIDATION RESULTS ===');
console.log(JSON.stringify(validationLog, null, 2));

if (errors.length > 0) {
  const errorMsg = `AIRBNB validation failed: ${errors.join(', ')}`;
  console.error(errorMsg);
  throw new Error(errorMsg);
}

if (warnings.length > 0) {
  console.warn('AIRBNB validation warnings:', warnings.join(', '));
}

if (autoCorrections.length > 0) {
  console.log('AIRBNB auto-corrections applied:', autoCorrections.join(', '));
}

console.log('✅ AIRBNB validation passed');

return [{ 
  validatedParams: params,
  validationLog: validationLog
}];