# CRITICAL PARAMETER FORMATS - EXACT EXAMPLES

## Overview
This document contains the exact parameter formats that the AI agent MUST provide to ensure Apify scrapers work correctly. These formats are non-negotiable and scrapers will fail with incorrect formats.

## flexWindow Parameter (CRITICAL)

### ✅ CORRECT Examples:
- `flexWindow = "0"` (for exact dates like "August 25-28")
- `flexWindow = "1"` (flexible by 1 day)
- `flexWindow = "2"` (flexible by 2 days) 
- `flexWindow = "7"` (flexible by 7 days)
- `flexWindow = "3"` (for vague dates like "next weekend" - safe default)

### ❌ WRONG Examples:
- `flexWindow = "2 days"` (text description)
- `flexWindow = 3` (number instead of string)
- `flexWindow = "flexible"` (descriptive text)
- `flexWindow = "5"` (invalid number - not in allowed list)
- `flexWindow = ""` (empty string)

### Rule:
ONLY these four string values are valid: `"0"`, `"1"`, `"2"`, `"7"`. Use `"0"` for exact dates, `"3"` for flexible dates.

## Date Parameters (CRITICAL)

### ✅ CORRECT Examples:
- `checkIn = "2025-08-25"`, `checkOut = "2025-08-28"`
- `checkIn = "2025-12-31"`, `checkOut = "2026-01-03"`
- `checkIn = "2025-03-15"`, `checkOut = "2025-03-20"`

### ❌ WRONG Examples:
- `checkIn = "Aug 25, 2025"` (text format)
- `checkIn = "25/08/2025"` (European format)
- `checkIn = "2025-8-25"` (missing leading zeros)
- `checkIn = "25-08-2025"` (day-month-year)
- `checkIn = "August 25, 2025"` (full text)

### Rule:
MUST be ISO format: `YYYY-MM-DD` with leading zeros. No other format allowed.

## URL Cleaning Examples (for Review Scrapers)

### ✅ CORRECT Examples:
- Original: `"https://booking.com/hotel.html?checkin=2025-08-25&adults=2"`
- Cleaned: `"https://booking.com/hotel.html"`

- Original: `"https://airbnb.com/rooms/123?check_in=2025-01-15&adults=2"`  
- Cleaned: `"https://airbnb.com/rooms/123"`

### ❌ WRONG Examples:
- `"https://booking.com/hotel.html?checkin=2025-08-25&adults=2"` (keeping query parameters)
- `"booking.com/hotel.html"` (missing protocol)
- `""` (empty string)

### Rule:
Strip ALL query parameters (everything after and including `?`). Keep only the base URL.

## Price Range Examples

### ✅ CORRECT Examples:
- `minMaxPrice = "50-200"`
- `minMaxPrice = "0-999999"` (wide range)
- `minMaxPrice = "100-150"`

### ❌ WRONG Examples:
- `minMaxPrice = "cheap"` (descriptive text)
- `minMaxPrice = "50 to 200"` (text format)
- `minMaxPrice = "€50-€200"` (with currency symbols)

### Rule:
Format as `"min-max"` with numbers only, hyphen separator.

## Property Type Examples

### ✅ CORRECT Examples (Booking.com):
- `propertyType = "Hotels"`
- `propertyType = "Apartments"`  
- `propertyType = "Hostels"`
- `propertyType = "Guest Houses"`
- `propertyType = "none"`

### Valid Property Types:
`"Hotels"`, `"Apartments"`, `"Hostels"`, `"Guest Houses"`, `"Homestays"`, `"Bed an breakfasts"`, `"Holiday homes"`, `"Boats"`, `"Villas"`, `"Motels"`, `"Resorts"`, `"Holiday parks"`, `"Campsites"`, `"Luxury tents"`, `"none"`

## Location Synchronization (CRITICAL)

### ✅ CORRECT Examples:
- Booking: `"search": "Sibiu"`
- Airbnb: `"locationQueries": ["Sibiu"]`

- Booking: `"search": "Paris"`
- Airbnb: `"locationQueries": ["Paris"]`

### ❌ WRONG Examples:
- Booking: `"search": "Sibiu, Romania"`
- Airbnb: `"locationQueries": ["Sibiu"]` (inconsistent)

### Rule:
Use IDENTICAL destination string across both scrapers. No country, region, or modifiers.

## Numeric Parameter Examples

### ✅ CORRECT Examples:
- `adults = 2` (number, not string)
- `children = 0` (number, not string)
- `rooms = 1` (number, not string)
- `priceMin = 50` (number for Airbnb)
- `priceMax = 200` (number for Airbnb)

### ❌ WRONG Examples:
- `adults = "2"` (string instead of number)
- `children = "zero"` (text)
- `rooms = ""` (empty string)

### Rule:
Numeric parameters must be actual numbers, not strings.

## Language Parameter (Hardcoded)

### ✅ CORRECT:
- `language = "ro"` (always hardcoded)
- `locale = "ro-RO"` (for Airbnb)

### Rule:
Always hardcode these values regardless of user's actual language.

## Array Format Examples (Review Scrapers)

### ✅ CORRECT Examples:
```json
"startUrls": [
  {"url": "https://booking.com/hotel1.html"},
  {"url": "https://booking.com/hotel2.html"}
]
```

### ❌ WRONG Examples:
```json
"startUrls": "https://booking.com/hotel1.html"  // Single string
"startUrls": ["https://booking.com/hotel1.html"]  // Array of strings
```

### Rule:
Must be array of objects, each with `"url"` property.

## Critical Validation Checklist

Before calling any scraper, verify:

✅ **flexWindow** is exactly one of: `"0"`, `"1"`, `"2"`, `"7"`  
✅ **checkIn/checkOut** are ISO format: `YYYY-MM-DD`  
✅ **checkOut** is after **checkIn**  
✅ **Dates** are in the future  
✅ **URLs** are cleaned (no query parameters)  
✅ **Location** is identical across both scrapers  
✅ **Numeric** parameters are numbers, not strings  
✅ **Arrays** are properly formatted as objects  

## Error Prevention

- **Never guess** parameter values
- **Never use** descriptive text for structured parameters  
- **Always validate** before API calls
- **Always strip** query parameters from URLs
- **Always use** identical location strings
- **Always provide** exact ISO dates

## Testing Commands

Use these to test parameter validation:
```bash
node scripts/parameter-tests.js
```

This will run comprehensive tests for all critical parameters and show exactly which formats work and which fail.