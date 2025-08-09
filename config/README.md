# VolaBot Configuration Guide

## Overview
This directory contains configuration documentation and parameter guides for the VolaBot N8N workflow.

## Files

### `api-parameters.md`
Comprehensive guide to API parameters for all scraper tools:
- Booking.com scraper parameters
- Airbnb scraper parameters
- Google Maps scraper parameters
- Parameter validation rules
- Common parameter combinations

### `node-settings.md`
N8N node configuration guide:
- AI Agent node settings
- Chat Trigger configuration
- HTTP Request Tool setup
- Authentication and credentials
- Error handling configuration

## Parameter Reference

### Critical Parameters
- **flexibility_window**: Must be "0", "1", "2", or "7" (string values)
- **language**: Always "ro" for scraper tools (hardcoded)
- **checkIn/checkOut**: ISO date format (YYYY-MM-DD)
- **currency**: User-specified or inferred (EUR, USD, RON)

### Google Maps Parameters
- **maxCrawledPlacesPerSearch**: Set to 2 for performance
- **maxReviews**: Set to 10 for cost optimization
- **scrapePlaceDetailPage**: Always true for detailed info

## Configuration Workflow
1. Edit parameters in local files
2. Update Hotels-Agent-CRISTI.json manually
3. Run `npm run validate` to check configuration
4. Import updated workflow to N8N
5. Test parameter changes

## Troubleshooting
Common configuration issues and solutions:
- Invalid flexibility_window values
- Date format errors
- Authentication failures
- Parameter type mismatches
