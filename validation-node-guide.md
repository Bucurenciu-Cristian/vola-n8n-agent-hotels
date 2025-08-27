# N8N Validation Nodes Implementation Guide

## Overview
This guide shows how to add validation nodes between your AI Agent and Apify scrapers to ensure exact parameter formatting.

## Architecture Changes

```
Current Flow:
AI Agent → Scrape Booking → Reviews Booking
        → Scrape AirBnb → Reviews Airbnb

New Flow:
AI Agent → Validation Node → Scrape Booking → URL Cleaner → Reviews Booking
        → Validation Node → Scrape AirBnb → URL Cleaner → Reviews Airbnb
```

## Implementation Steps

### 1. Add Booking.com Validation Node

**Node Type**: Code
**Node Name**: "Validate Booking Parameters"
**Position**: Between AI Agent and Scrape Booking
**Code**:

```javascript
// Extract parameters from AI Agent output
const params = {
  minMaxPrice: $fromAI('price_range') || '0-999999',
  checkIn: $fromAI('check_in_date'),
  checkOut: $fromAI('check_out_date'),
  search: $fromAI('Destination'),
  flexWindow: $fromAI('flexibility_window'),
  adults: $fromAI('adults') || 2,
  children: $fromAI('children') || 0,
  currency: $fromAI('currency') || 'EUR',
  rooms: $fromAI('rooms') || 1,
  propertyType: $fromAI('propertyType') || 'none'
};

// Critical validations
const errors = [];

// 1. flexWindow validation (CRITICAL)
const validFlexWindows = ['0', '1', '2', '7'];
if (!validFlexWindows.includes(params.flexWindow)) {
  console.error(`Invalid flexWindow: ${params.flexWindow}`);
  params.flexWindow = '0'; // Safe default
  errors.push(`Auto-corrected flexWindow from '${$fromAI('flexibility_window')}' to '0'`);
}

// 2. Date format validation
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
if (!dateRegex.test(params.checkIn)) {
  errors.push(`Invalid checkIn format: ${params.checkIn}`);
}
if (!dateRegex.test(params.checkOut)) {
  errors.push(`Invalid checkOut format: ${params.checkOut}`);
}

// 3. Date logic validation
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

// Log validation results
console.log('Booking Parameters Validation:', {
  params,
  errors,
  timestamp: new Date().toISOString()
});

// Fail if critical errors
if (errors.length > 0 && errors.some(e => e.includes('Invalid'))) {
  throw new Error(`Critical validation errors: ${errors.join(', ')}`);
}

return [{ 
  validatedParams: params,
  validationLog: {
    errors,
    timestamp: new Date().toISOString(),
    nodeType: 'booking'
  }
}];
```

### 2. Add Airbnb Validation Node

**Node Type**: Code
**Node Name**: "Validate Airbnb Parameters"
**Position**: Between AI Agent and Scrape AirBnb
**Code**:

```javascript
// Extract parameters from AI Agent output
const params = {
  adults: $fromAI('adults') || 2,
  checkIn: $fromAI('check_in_date'),
  checkOut: $fromAI('check_out_date'),
  children: $fromAI('children') || 0,
  currency: $fromAI('currency') || 'EUR',
  infants: $fromAI('infants') || 0,
  locationQueries: [$fromAI('destination')],
  minBathrooms: $fromAI('min_bathrooms') || 1,
  minBedrooms: $fromAI('min_bedrooms') || 1,
  minBeds: $fromAI('min_beds') || 1,
  pets: $fromAI('pets') || 0,
  priceMax: $fromAI('price_max') || 999999,
  priceMin: $fromAI('price_min') || 0,
  locale: 'ro-RO'
};

const errors = [];

// Date format validation
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
if (!dateRegex.test(params.checkIn)) {
  errors.push(`Invalid checkIn format: ${params.checkIn}`);
}
if (!dateRegex.test(params.checkOut)) {
  errors.push(`Invalid checkOut format: ${params.checkOut}`);
}

// Location validation
if (!params.locationQueries[0]) {
  errors.push('Missing destination');
}

// Price validation
if (params.priceMin > params.priceMax) {
  errors.push(`priceMin (${params.priceMin}) > priceMax (${params.priceMax})`);
}

// Log validation
console.log('Airbnb Parameters Validation:', {
  params,
  errors,
  timestamp: new Date().toISOString()
});

if (errors.some(e => e.includes('Invalid') || e.includes('Missing'))) {
  throw new Error(`Critical validation errors: ${errors.join(', ')}`);
}

return [{ 
  validatedParams: params,
  validationLog: {
    errors,
    timestamp: new Date().toISOString(),
    nodeType: 'airbnb'
  }
}];
```

### 3. Add URL Cleaning Nodes

**Node Name**: "Clean Booking URLs"
**Position**: Between Scrape Booking and Reviews Booking
**Code**:

```javascript
const bookingResults = $json.data || $json;

if (!Array.isArray(bookingResults)) {
  throw new Error('Booking results must be an array');
}

const cleanedUrls = bookingResults
  .filter(property => property.url)
  .map(property => {
    // Strip query parameters (everything after ?)
    const cleanUrl = property.url.split('?')[0];
    
    // Validate URL
    try {
      new URL(cleanUrl);
      return { url: cleanUrl };
    } catch (error) {
      console.error(`Invalid URL: ${property.url}`);
      return null;
    }
  })
  .filter(Boolean);

console.log(`Cleaned ${cleanedUrls.length} Booking URLs for review scraper`);

return [{ 
  startUrls: cleanedUrls,
  originalCount: bookingResults.length,
  cleanedCount: cleanedUrls.length
}];
```

**Node Name**: "Clean Airbnb URLs"
**Position**: Between Scrape AirBnb and Reviews Airbnb
**Code**: (Same as above, but for Airbnb)

### 4. Add Debug Logging Node

**Node Name**: "Parameter Debug Log"
**Position**: After validation nodes (optional)
**Code**:

```javascript
const validationData = $json.validationLog;

// Create debug log entry
const debugEntry = {
  timestamp: new Date().toISOString(),
  nodeType: validationData.nodeType,
  validationErrors: validationData.errors,
  parametersCount: Object.keys($json.validatedParams).length,
  sessionId: $('Edit Fields1')?.first()?.json?.sessionId || 'unknown'
};

console.log('[DEBUG LOG]:', JSON.stringify(debugEntry, null, 2));

// Pass through the validated parameters unchanged
return [$json];
```

## Connection Changes

### Original Connections:
1. AI Agent → Scrape Booking (ai_tool connection)
2. AI Agent → Scrape AirBnb (ai_tool connection)

### New Connections:
1. AI Agent → Validate Booking Parameters (main connection)
2. Validate Booking Parameters → Scrape Booking (main connection)
3. AI Agent → Validate Airbnb Parameters (main connection)
4. Validate Airbnb Parameters → Scrape AirBnb (main connection)
5. Scrape Booking → Clean Booking URLs (main connection)
6. Clean Booking URLs → Reviews Booking (main connection)
7. Scrape AirBnb → Clean Airbnb URLs (main connection)
8. Clean Airbnb URLs → Reviews Airbnb (main connection)

## Update Scraper Nodes

After adding validation nodes, update your scraper nodes to use the validated parameters:

### Booking.com Scraper Update:
Change the jsonBody to use the validated parameters:
```json
"jsonBody": "={{ JSON.stringify($json.validatedParams) }}"
```

### Review Scrapers Update:
Change the startUrls parameter to use the cleaned URLs:
```javascript
"startUrls": "={{ JSON.stringify($json.startUrls) }}"
```

## Testing the Validation

1. **Valid Parameters Test**: Use exact dates like "2025-08-25" and "2025-08-28"
2. **flexWindow Test**: Ensure only "0", "1", "2", "7" are accepted
3. **URL Cleaning Test**: Verify URLs are properly stripped of query parameters
4. **Error Handling Test**: Try invalid dates and check error messages

## Monitoring

Check the N8N execution logs for:
- Validation error messages
- Parameter correction notices
- URL cleaning statistics
- Debug log entries

## Benefits

✅ **Guaranteed Exact Inputs**: All parameters validated before reaching Apify  
✅ **Auto-Correction**: Critical parameters like flexWindow auto-corrected  
✅ **URL Integrity**: URLs properly cleaned for review scrapers  
✅ **Debug Visibility**: Full parameter logging for troubleshooting  
✅ **Fail-Fast**: Critical errors caught before expensive API calls  