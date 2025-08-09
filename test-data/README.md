# VolaBot Testing Guide

## Overview
This directory contains test data, API responses, and sample requests for the VolaBot project.

## Directory Structure

### `api-responses/`
Contains real API response examples from the scraper tools:
- **Booking.com responses**: Examples from voyager~booking-scraper
- **Airbnb responses**: Examples from tri_angle~airbnb-scraper  
- **Google Maps responses**: Examples from compass~crawler-google-places

### `sample-requests/`
Contains example requests and testing scenarios:
- **Testing.http**: HTTP requests for manual API testing
- **examples.md**: Documented request examples
- **enhanced-examples.md**: Advanced usage examples

## Using Test Data

### For Development
1. Use API response examples to understand data structure
2. Reference sample requests for testing new features
3. Validate workflow changes against known good responses

### For Debugging
1. Compare current API responses with historical examples
2. Use sample requests to reproduce issues
3. Check parameter formats against working examples

## Adding New Test Data

### API Responses
Save new API responses with descriptive filenames:
- `booking-response-{destination}-{date}.json`
- `airbnb-response-{destination}-{date}.json`
- `googlemaps-response-{destination}-{date}.json`

### Sample Requests
Document new request patterns in the appropriate markdown files with:
- Request description
- Expected response format
- Usage context

## Best Practices
- Keep test data current (remove outdated examples)
- Use real anonymized data when possible
- Document the source and context of each test file
- Maintain consistent naming conventions
