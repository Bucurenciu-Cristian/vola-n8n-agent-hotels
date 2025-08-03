# Google Maps Reviews Scraper - Implementation Guide

## Overview
The Apify Google Maps Reviews Scraper is perfect for your AI Travel Accommodation Advisor project. It extracts reviews, ratings, and detailed place information that will feed into your VolaBot system for better accommodation recommendations.

## Key Implementation Details

### 1. API Endpoints & Access

**Primary Actor ID**: `compass/google-maps-reviews-scraper`

**Main API Endpoints**:
```bash
# Synchronous run (wait for completion and get results)
POST https://api.apify.com/v2/acts/compass~google-maps-reviews-scraper/run-sync-get-dataset-items?token=<YOUR_API_TOKEN>

# Asynchronous run (start and monitor separately)
POST https://api.apify.com/v2/acts/compass~google-maps-reviews-scraper/runs?token=<YOUR_API_TOKEN>

# Get results from completed run
GET https://api.apify.com/v2/datasets/<DATASET_ID>/items?format=json&token=<YOUR_API_TOKEN>
```

### 2. Input Parameters Schema

```json
{
  "startUrls": [
    {
      "url": "https://www.google.com/maps/place/Hotel+Example/@40.7128,-74.0060,17z/data=..."
    }
  ],
  "placeIds": [
    "ChIJbf8C1yFxdDkR3n12P4DkKt0"
  ],
  "maxReviews": 100,
  "reviewsSort": "newest",
  "reviewsStartDate": "2024-01-01",
  "reviewsEndDate": "2025-08-03",
  "reviewsOrigin": "Google",
  "personalDataOptions": {
    "personalDataEnabled": false
  },
  "language": "en"
}
```

**Key Parameters Explained**:
- **`startUrls`**: Array of Google Maps URLs for hotels/accommodations
- **`placeIds`**: Alternative to URLs - Google Place IDs
- **`maxReviews`**: Limit reviews per place (0 = no reviews, 99999 = all)
- **`reviewsSort`**: `"newest"`, `"mostRelevant"`, `"highestRanking"`, `"lowestRanking"`
- **`reviewsStartDate`**: Filter reviews from this date (ISO format or relative like "3 months")
- **`reviewsOrigin`**: `"All"` or `"Google"` (use "Google" for hotels to avoid reduced results)
- **`personalDataEnabled`**: Set to `false` for privacy compliance

### 3. Output Data Structure

Each result contains:
```json
{
  "url": "https://www.google.com/maps/place/...",
  "name": "Hotel Example",
  "totalScore": 4.2,
  "reviewsCount": 1234,
  "category": "Hotel",
  "address": "123 Main St, Paris, France",
  "location": {
    "lat": 48.8566,
    "lng": 2.3522
  },
  "website": "https://example-hotel.com",
  "phone": "+33 1 23 45 67 89",
  "reviews": [
    {
      "name": "John Smith",
      "text": "Great location, excellent service...",
      "publishAt": "2024-07-15T10:30:00.000Z",
      "publishedAtDate": "2024-07-15",
      "likesCount": 5,
      "reviewId": "ABC123",
      "reviewUrl": "https://www.google.com/maps/reviews/...",
      "reviewerUrl": "https://www.google.com/maps/contrib/...",
      "reviewerPhotoUrl": "https://lh3.googleusercontent.com/...",
      "stars": 5,
      "responseFromOwnerText": "Thank you for your review!"
    }
  ],
  "imageUrls": [
    "https://lh5.googleusercontent.com/..."
  ],
  "scrapedAt": "2024-08-03T15:45:00.000Z"
}
```

### 4. n8n Integration Implementation

For your existing n8n workflow, add this HTTP Request node:

```json
{
  "url": "https://api.apify.com/v2/acts/compass~google-maps-reviews-scraper/run-sync-get-dataset-items",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "qs": {
    "token": "{{$env.APIFY_API_TOKEN}}"
  },
  "body": {
    "startUrls": [
      {
        "url": "{{$node['Hotel Data'].json['google_maps_url']}}"
      }
    ],
    "maxReviews": 50,
    "reviewsSort": "newest",
    "reviewsStartDate": "1 year",
    "reviewsOrigin": "Google",
    "personalDataOptions": {
      "personalDataEnabled": false
    }
  }
}

### 7. Integration with Your Travel Advisor

**In your n8n workflow**:

1. **After Booking.com/Airbnb scraping**: Extract Google Maps URLs from property data
2. **Google Maps Reviews Node**: Use the scraper to get reviews and ratings
3. **Data Merge Node**: Combine reviews with property data
4. **AI Processing Node**: Feed enriched data to your VolaBot prompt

**Data mapping for VolaBot**:
```json
{
  "property_id": "booking_123",
  "name": "Hotel Example",
  "google_rating": 4.2,
  "google_review_count": 1234,
  "recent_reviews": [
    {
      "text": "Great location...",
      "rating": 5,
      "date": "2024-07-15",
      "traveler_type": "couple"
    }
  ],
  "review_summary": {
    "positive_keywords": ["location", "service", "clean"],
    "negative_keywords": ["noise", "small room"],
    "sentiment_score": 0.85
  }
}
```

### 8. Cost Optimization

**Pricing**: $0.50 per 1,000 reviews ($0.0005 per review)

**Cost-saving strategies**:
- Set `maxReviews: 20-50` for initial analysis
- Use `reviewsStartDate: "6 months"` to get recent, relevant reviews
- Set `reviewsOrigin: "Google"` for hotels to avoid diluted results
- Cache results for 24-48 hours to avoid re-scraping

**Monthly cost estimation**:
- 1,000 properties × 30 reviews each = 30,000 reviews
- Cost: 30,000 × $0.0005 = $15/month

### 9. Advanced Features

**Batch processing multiple hotels**:
```json
{
  "startUrls": [
    {"url": "https://www.google.com/maps/place/Hotel1/"},
    {"url": "https://www.google.com/maps/place/Hotel2/"},
    {"url": "https://www.google.com/maps/place/Hotel3/"}
  ],
  "maxReviews": 30
}
```

**Review filtering by date**:
```json
{
  "reviewsStartDate": "2024-01-01",
  "reviewsEndDate": "2024-08-03"
}
```

**Flat output for easier processing**:
```json
{
  "flatOutput": true  // One object per review instead of grouped by place
}
```

### 10. Error Handling & Monitoring

```javascript
async function scrapeWithRetry(url, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await scrapeHotelReviews(url);
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}
```

### 11. Integration with VolaBot Prompt

Enhance your VolaBot system prompt to use the Google Maps data:

```
## Google Maps Integration
When a property has Google Maps review data, prioritize it in ranking:
- Properties with 4.0+ Google rating and 100+ reviews get priority
- Use recent review sentiment to identify standout features
- Flag properties with recent negative review patterns
- Extract amenity mentions from review text (pool, gym, spa, etc.)

## Review Analysis for User Matching
- Couple reviews: Look for "romantic", "anniversary", "honeymoon"
- Family reviews: Check for "kids", "family room", "playground"
- Business reviews: Note "conference", "business center", "wifi"
```

This implementation will give your travel advisor access to authentic guest experiences and help VolaBot make more informed recommendations based on real user feedback.
