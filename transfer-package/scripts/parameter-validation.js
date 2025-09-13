/**
 * Apify Scraper Parameter Validation Functions
 * Use this in N8N Code nodes between AI Agent and scrapers
 */

// Validation for Booking.com scraper parameters
function validateBookingParams(params) {
  const errors = [];
  const warnings = [];
  
  // Critical: flexWindow validation
  const validFlexWindows = ['0', '1', '2', '7'];
  if (!validFlexWindows.includes(params.flexWindow)) {
    errors.push(`flexWindow must be exactly one of: ${validFlexWindows.join(', ')}. Got: '${params.flexWindow}'`);
    // Auto-fix: use '0' for exact dates as safe default
    params.flexWindow = '0';
    warnings.push('Auto-corrected flexWindow to "0" (exact dates)');
  }
  
  // Critical: Date format validation
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(params.checkIn)) {
    errors.push(`checkIn must be ISO format YYYY-MM-DD. Got: '${params.checkIn}'`);
  }
  if (!dateRegex.test(params.checkOut)) {
    errors.push(`checkOut must be ISO format YYYY-MM-DD. Got: '${params.checkOut}'`);
  }
  
  // Date logic validation
  const checkInDate = new Date(params.checkIn);
  const checkOutDate = new Date(params.checkOut);
  const today = new Date();
  
  if (checkInDate < today) {
    errors.push(`checkIn date ${params.checkIn} is in the past`);
  }
  if (checkOutDate <= checkInDate) {
    errors.push(`checkOut date ${params.checkOut} must be after checkIn date ${params.checkIn}`);
  }
  
  // Price range format validation
  if (params.minMaxPrice && !params.minMaxPrice.match(/^\d+-\d+$/)) {
    warnings.push(`minMaxPrice should be format 'min-max'. Got: '${params.minMaxPrice}'`);
  }
  
  // Property type validation
  const validPropertyTypes = [
    'Hotels', 'Apartments', 'Hostels', 'Guest Houses', 'Homestays',
    'Bed an breakfasts', 'Holiday homes', 'Boats', 'Villas', 'Motels',
    'Resorts', 'Holiday parks', 'Campsites', 'Luxury tents', 'none'
  ];
  if (params.propertyType && !validPropertyTypes.includes(params.propertyType)) {
    warnings.push(`propertyType '${params.propertyType}' not in valid list. Consider: ${validPropertyTypes.join(', ')}`);
  }
  
  // Numeric validations
  if (params.adults && (params.adults < 1 || params.adults > 20)) {
    warnings.push(`adults count ${params.adults} seems unusual (1-20 expected)`);
  }
  if (params.children && (params.children < 0 || params.children > 10)) {
    warnings.push(`children count ${params.children} seems unusual (0-10 expected)`);
  }
  if (params.rooms && (params.rooms < 1 || params.rooms > 10)) {
    warnings.push(`rooms count ${params.rooms} seems unusual (1-10 expected)`);
  }
  
  return { errors, warnings, validatedParams: params };
}

// Validation for Airbnb scraper parameters  
function validateAirbnbParams(params) {
  const errors = [];
  const warnings = [];
  
  // Date format validation (same as booking)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(params.checkIn)) {
    errors.push(`checkIn must be ISO format YYYY-MM-DD. Got: '${params.checkIn}'`);
  }
  if (!dateRegex.test(params.checkOut)) {
    errors.push(`checkOut must be ISO format YYYY-MM-DD. Got: '${params.checkOut}'`);
  }
  
  // Location queries validation
  if (!params.locationQueries || !Array.isArray(params.locationQueries) || params.locationQueries.length === 0) {
    errors.push('locationQueries must be a non-empty array');
  }
  
  // Price range validation
  if (params.priceMin && params.priceMax && params.priceMin > params.priceMax) {
    errors.push(`priceMin (${params.priceMin}) cannot be greater than priceMax (${params.priceMax})`);
  }
  
  // Locale validation
  const validLocales = ['ro-RO', 'en-US', 'en-GB', 'de-DE', 'fr-FR'];
  if (params.locale && !validLocales.includes(params.locale)) {
    warnings.push(`locale '${params.locale}' not in common list: ${validLocales.join(', ')}`);
  }
  
  return { errors, warnings, validatedParams: params };
}

// URL cleaning for review scrapers
function cleanUrlsForReviewScraper(propertyResults, platform = 'booking') {
  const cleanedUrls = [];
  
  if (!Array.isArray(propertyResults)) {
    throw new Error('Property results must be an array');
  }
  
  propertyResults.forEach((property, index) => {
    if (!property.url) {
      console.warn(`Property ${index} missing url field`);
      return;
    }
    
    // Strip query parameters (everything after ?)
    const cleanUrl = property.url.split('?')[0];
    
    // Validate URL format
    try {
      new URL(cleanUrl);
      cleanedUrls.push({ url: cleanUrl });
    } catch (error) {
      console.error(`Invalid URL at property ${index}: ${property.url}`);
    }
  });
  
  console.log(`Cleaned ${cleanedUrls.length} URLs for ${platform} review scraper`);
  return cleanedUrls;
}

// Debug logging function
function logParameterDebug(nodeType, parameters, validationResult = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    nodeType,
    parameters,
    validation: validationResult,
    parameterCount: Object.keys(parameters).length
  };
  
  console.log(`[PARAMETER DEBUG] ${nodeType}:`, JSON.stringify(logEntry, null, 2));
  
  // Store in N8N dataset for monitoring (if available)
  if (typeof $('Set').first() !== 'undefined') {
    return [{
      timestamp,
      nodeType,
      parameters: JSON.stringify(parameters),
      validation: JSON.stringify(validationResult),
      status: validationResult?.errors?.length > 0 ? 'ERROR' : 'OK'
    }];
  }
  
  return logEntry;
}

// Main validation function for N8N Code node
function validateScraperParameters(nodeType, parameters) {
  let result;
  
  switch (nodeType) {
    case 'booking':
      result = validateBookingParams(parameters);
      break;
    case 'airbnb':
      result = validateAirbnbParams(parameters);
      break;
    default:
      throw new Error(`Unknown node type: ${nodeType}`);
  }
  
  // Log debug information
  logParameterDebug(nodeType, parameters, result);
  
  // Fail fast if critical errors
  if (result.errors.length > 0) {
    const errorMessage = `Parameter validation failed for ${nodeType}:\n${result.errors.join('\n')}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  
  // Log warnings
  if (result.warnings.length > 0) {
    console.warn(`Parameter validation warnings for ${nodeType}:`, result.warnings);
  }
  
  return result.validatedParams;
}

// Export for N8N usage
module.exports = {
  validateBookingParams,
  validateAirbnbParams,
  cleanUrlsForReviewScraper,
  validateScraperParameters,
  logParameterDebug
};

// Example usage in N8N Code node:
/*
// Booking.com validation
const bookingParams = {
  minMaxPrice: $json.minMaxPrice,
  checkIn: $json.checkIn,
  checkOut: $json.checkOut,
  search: $json.search,
  flexWindow: $json.flexWindow,
  adults: $json.adults,
  children: $json.children,
  currency: $json.currency,
  rooms: $json.rooms,
  propertyType: $json.propertyType
};

const validatedParams = validateScraperParameters('booking', bookingParams);
return [{ validatedParams }];
*/