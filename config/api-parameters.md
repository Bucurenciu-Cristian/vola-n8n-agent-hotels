# VolaBot API Parameters Guide

> **Comprehensive reference for all API parameters used in VolaBot scraper tools**

This guide covers all the API parameters for the three scraper tools used by VolaBot, including validation rules, common combinations, and troubleshooting.

## 📋 Overview

VolaBot uses three primary APIs for data collection:

1. **Booking.com Scraper** (`voyager~booking-scraper`)
2. **Airbnb Scraper** (`tri_angle~airbnb-scraper`)  
3. **Google Maps Scraper** (`compass~crawler-google-places`)

## 🏨 Booking.com Scraper Parameters

### Required Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Destination city or location | `"Paris"` |
| `checkIn` | string | Check-in date (ISO format) | `"2025-08-20"` |
| `checkOut` | string | Check-out date (ISO format) | `"2025-08-22"` |
| `adults` | number | Number of adult guests | `2` |
| `rooms` | number | Number of rooms needed | `1` |
| `currency` | string | Price currency display | `"EUR"` |
| `language` | string | **Always "ro"** (hardcoded) | `"ro"` |

### Critical Parameters

#### flexibility_window
**Type**: string (not number!)  
**Valid Values**: Only `"0"`, `"1"`, `"2"`, or `"7"`  
**Logic**:
- **Exact dates** → `"0"`
- **Vague dates** → `"3"` (safe default)

❌ **Common Mistakes**:
```json
"flexibility_window": 0      // Wrong - number
"flexibility_window": "2 days" // Wrong - descriptive text  
"flexibility_window": "week"   // Wrong - invalid value
```

✅ **Correct Usage**:
```json
"flexibility_window": "0"   // Exact dates
"flexibility_window": "3"   // Vague dates (safe default)
```

### Optional Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `children` | number | Number of children | `0` |
| `minMaxPrice` | string | Price range | `"0-999999"` |
| `stars` | array | Hotel star ratings | `[]` |
| `propertyTypes` | array | Property type filters | `[]` |
| `amenities` | array | Required amenities | `[]` |

### Example Request Body

```json
{
  "search": "Sibiu",
  "checkIn": "2025-08-20",
  "checkOut": "2025-08-22", 
  "adults": 2,
  "children": 0,
  "rooms": 1,
  "currency": "EUR",
  "language": "ro",
  "flexibility_window": "0",
  "minMaxPrice": "50-200"
}
```

## 🏠 Airbnb Scraper Parameters

### Required Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `locationQueries` | array | Destination(s) to search | `["Paris"]` |
| `checkIn` | string | Check-in date (ISO format) | `"2025-08-20"` |
| `checkOut` | string | Check-out date (ISO format) | `"2025-08-22"` |
| `adults` | number | Number of adult guests | `2` |
| `currency` | string | Price currency display | `"EUR"` |
| `locale` | string | Locale for results | `"ro-RO"` |

### Optional Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `children` | number | Number of children | `0` |
| `infants` | number | Number of infants | `0` |
| `pets` | number | Number of pets | `0` |
| `priceMin` | number | Minimum price per night | `0` |
| `priceMax` | number | Maximum price per night | `999999` |
| `minBedrooms` | number | Minimum bedrooms | `0` |
| `minBathrooms` | number | Minimum bathrooms | `0` |
| `minBeds` | number | Minimum beds | `0` |

### Example Request Body

```json
{
  "locationQueries": ["Sibiu"],
  "checkIn": "2025-08-20",
  "checkOut": "2025-08-22",
  "adults": 2,
  "children": 0,
  "infants": 0,
  "pets": 0,
  "currency": "EUR", 
  "locale": "ro-RO",
  "priceMin": 50,
  "priceMax": 200
}
```

## 🗺️ Google Maps Scraper Parameters

### Required Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `searchStringsArray` | array | Search terms | `["hotels"]` |
| `locationQuery` | string | Target location | `"Sibiu"` |
| `language` | string | **Always "ro"** (hardcoded) | `"ro"` |
| `maxCrawledPlacesPerSearch` | number | Results per search | `2` |

### Important Parameters

| Parameter | Type | Description | Value |
|-----------|------|-------------|--------|
| `scrapePlaceDetailPage` | boolean | Get detailed info | `true` |
| `maxReviews` | number | Reviews per place | `10` |
| `reviewsSort` | string | Review ordering | `"newest"` |
| `reviewsOrigin` | string | Review source | `"google"` |

### Example Request Body

```json
{
  "searchStringsArray": ["hotels"],
  "locationQuery": "Sibiu",
  "maxCrawledPlacesPerSearch": 2,
  "language": "ro",
  "scrapePlaceDetailPage": true,
  "maxReviews": 10,
  "reviewsSort": "newest",
  "reviewsOrigin": "google"
}
```

## 🔄 Parameter Coordination

### Date Synchronization
All three APIs must use the **same exact dates**:

```javascript
const checkIn = "2025-08-20";
const checkOut = "2025-08-22";

// Use in all three API calls
bookingParams.checkIn = checkIn;
bookingParams.checkOut = checkOut;
airbnbParams.checkIn = checkIn; 
airbnbParams.checkOut = checkOut;
// Google Maps doesn't use dates
```

### Location Mapping
Different APIs expect locations in different formats:

| User Input | Booking | Airbnb | Google Maps |
|------------|---------|--------|-------------|
| "Paris" | `search: "Paris"` | `locationQueries: ["Paris"]` | `locationQuery: "Paris"` |
| "New York City" | `search: "New York"` | `locationQueries: ["New York City"]` | `locationQuery: "New York"` |

### Currency Consistency
Ensure all APIs use the same currency:

```javascript
const currency = "EUR"; // or "USD", "RON"

bookingParams.currency = currency;
airbnbParams.currency = currency;
// Google Maps shows local currency automatically
```

## ⚠️ Common Parameter Errors

### 1. flexibility_window Type Error
```javascript
// ❌ Wrong - number type
"flexibility_window": 0

// ✅ Correct - string type  
"flexibility_window": "0"
```

### 2. Date Format Error
```javascript
// ❌ Wrong - US format
"checkIn": "08/20/2025"

// ❌ Wrong - European format
"checkIn": "20.08.2025"

// ✅ Correct - ISO format
"checkIn": "2025-08-20"
```

### 3. Language Hardcoding
```javascript
// ❌ Wrong - dynamic language
"language": userLanguage

// ✅ Correct - always Romanian
"language": "ro"
```

### 4. Array vs String Confusion
```javascript
// ❌ Wrong - string for Airbnb
"locationQueries": "Paris"

// ✅ Correct - array for Airbnb
"locationQueries": ["Paris"]
```

## 📊 Parameter Validation Rules

### Booking.com Validation
```javascript
function validateBookingParams(params) {
  // Date validation
  if (!params.checkIn || !params.checkOut) {
    throw new Error('checkIn and checkOut required');
  }
  
  // flexibility_window validation
  const validFlex = ['0', '1', '2', '7'];
  if (!validFlex.includes(params.flexibility_window)) {
    throw new Error('Invalid flexibility_window value');
  }
  
  // Language hardcoding
  if (params.language !== 'ro') {
    throw new Error('Language must be "ro"');
  }
}
```

### Airbnb Validation
```javascript
function validateAirbnbParams(params) {
  // Location validation
  if (!Array.isArray(params.locationQueries)) {
    throw new Error('locationQueries must be an array');
  }
  
  // Locale validation
  if (params.locale !== 'ro-RO') {
    throw new Error('Locale should be "ro-RO"');
  }
  
  // Price validation
  if (params.priceMin > params.priceMax) {
    throw new Error('priceMin cannot exceed priceMax');
  }
}
```

### Google Maps Validation
```javascript
function validateGoogleMapsParams(params) {
  // Search terms validation
  if (!Array.isArray(params.searchStringsArray)) {
    throw new Error('searchStringsArray must be an array');
  }
  
  // Results limit validation
  if (params.maxCrawledPlacesPerSearch > 10) {
    console.warn('High result count may slow performance');
  }
  
  // Language hardcoding
  if (params.language !== 'ro') {
    throw new Error('Language must be "ro"');
  }
}
```

## 🔧 API Limits & Performance

### Rate Limits
| API | Requests/minute | Requests/day |
|-----|----------------|--------------|
| Booking.com | 60 | Unlimited |
| Airbnb | 60 | Unlimited |
| Google Maps | 60 | 1000 |

### Performance Optimization

#### Booking.com
- Limit `stars` array to 2-3 values max
- Use specific `propertyTypes` to reduce results
- Set reasonable `minMaxPrice` range

#### Airbnb
- Use single location in `locationQueries` when possible
- Set realistic price ranges (`priceMin`, `priceMax`)
- Limit bedroom/bathroom requirements

#### Google Maps
- Use `maxCrawledPlacesPerSearch: 2` for balance
- Set `maxReviews: 10` to control cost
- Use specific search terms in `searchStringsArray`

### Cost Optimization
| Parameter | Setting | Monthly Cost Impact |
|-----------|---------|-------------------|
| `maxReviews` | 10 vs 25 | $5 vs $15 |
| `maxCrawledPlacesPerSearch` | 2 vs 5 | $10 vs $25 |
| Booking results | 15 vs 30 | $20 vs $40 |

## 🛠️ Testing Parameters

### Manual Testing Commands

```bash
# Test parameter extraction logic
curl -X POST "https://api.apify.com/v2/acts/voyager~booking-scraper/run-sync" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "search": "Paris",
    "checkIn": "2025-08-20", 
    "checkOut": "2025-08-22",
    "adults": 2,
    "rooms": 1,
    "currency": "EUR",
    "language": "ro",
    "flexibility_window": "0"
  }'
```

### Parameter Debug Logging

Add to N8N workflow for debugging:
```javascript
// Log all parameters before API calls
console.log('Booking params:', JSON.stringify(bookingParams, null, 2));
console.log('Airbnb params:', JSON.stringify(airbnbParams, null, 2));
console.log('Google Maps params:', JSON.stringify(googleMapsParams, null, 2));
```

## 📚 Reference Examples

### Complete Parameter Sets

See `test-data/sample-requests/` for working examples:
- `Testing.http`: Manual API testing requests
- `examples.md`: Documented parameter combinations  
- `enhanced-examples.md`: Advanced usage patterns

### API Response Examples

See `test-data/api-responses/` for expected response formats:
- Booking.com response structure
- Airbnb property data format
- Google Maps place information

---

**Remember**: Parameter validation is crucial for VolaBot reliability. Always validate locally before deploying to Railway N8N instance.