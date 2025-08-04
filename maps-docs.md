# Google Maps Reviews Scraper - Input Schema Documentation

**Actor ID**: `compass/google-maps-reviews-scraper`
**Pricing**: from $0.35 / 1,000 reviews
**Success Rate**: >99%
**Maintained by**: Apify (Compass)

## Overview
Extract all reviews of Google Maps places using place URLs. Get review text, published date, response from owner, review URL, and reviewer's details. Download scraped data, run the scraper via API, schedule and monitor runs or integrate with other tools.

## Input Parameters

### 🗺️ Google Maps place URLs
**Parameter**: `startUrls`
**Type**: `array` (Optional)
**Description**: List of URLs to be crawled. They can be search URLs, place URLs or review detail URLs. Valid Google Maps place URLs must contain one of the following subpaths: `/maps/search`, `/maps/place` or `/maps/reviews`.

**Example**:
```json
{
  "startUrls": [
    {
      "url": "https://www.google.com/maps/place/Hotel+Ritz+Paris/@48.8683,2.3280,17z/"
    },
    {
      "url": "https://www.google.com/maps/place/Eiffel+Tower/@48.8584,2.2945,15z/"
    }
  ]
}
```

### 🗃️ Place IDs
**Parameter**: `placeIds`
**Type**: `array` (Optional)
**Description**: List of place IDs. You can add place IDs one by one or upload a list using the Bulk edit option.

**Example**:
```json
{
  "placeIds": [
    "ChIJbf8C1yFxdDkR3n12P4DkKt0",
    "ChIJ3aqq5Q1ZwokRb9hLO7Gyxgw"
  ]
}
```

### 📊 Number of reviews
**Parameter**: `maxReviews`
**Type**: `integer` (Optional)
**Default**: `10000000`
**Description**: Max number of reviews per place to scrape. If you fill in 0 or nothing, no reviews will be scraped. For all reviews, just put 99999.

**Usage Guidelines**:
- `0`: No reviews scraped
- `10-50`: Recommended for quick analysis
- `100-500`: Good sample size for sentiment analysis
- `99999`: All available reviews (can be expensive)

**Example**:
```json
{
  "maxReviews": 100
}
```

### 🔢 Sort reviews by
**Parameter**: `reviewsSort`
**Type**: `Enum` (Optional)
**Default**: `"newest"`
**Description**: Define how reviews should be sorted.

**Value Options**:
- `"newest"`: Most recent reviews first
- `"mostRelevant"`: Google's relevance algorithm
- `"highestRanking"`: Highest rated reviews first
- `"lowestRanking"`: Lowest rated reviews first

**Example**:
```json
{
  "reviewsSort": "newest"
}
```

### 📅 Only scrape reviews newer than [date]
**Parameter**: `reviewsStartDate`
**Type**: `string` (Optional)
**Description**: Either absolute date (e.g. `2024-05-03`) or relative date from now into the past (e.g. `8 days`, `3 months`). JSON input also supports adding time in both absolute (ISO standard, e.g. `2024-05-03T20:00:00`) and relative (e.g. `3 hours`) formats.

**Important Notes**:
- Absolute time is always interpreted in the UTC timezone, not your local timezone
- Supported relative units: `minutes`, `hours`, `days`, `weeks`, `months`, `years`

**Examples**:
```json
{
  "reviewsStartDate": "2024-01-01"
}
```

```json
{
  "reviewsStartDate": "6 months"
}
```

```json
{
  "reviewsStartDate": "2024-05-03T20:00:00"
}
```

### 🌐 Language
**Parameter**: `language`
**Type**: `Enum` (Optional)
**Default**: `"en"`
**Description**: Results details will show in this language.

**Value Options**:
- `"en"`: English
- `"af"`: Afrikaans
- `"az"`: Azerbaijan
- `"id"`: Indonesian
- `"ms"`: Malay
- `"bs"`: Bosnian
- `"ca"`: Catalan
- `"cs"`: Czech
- `"da"`: Danish
- `"de"`: German
- `"et"`: Estonian
- `"es"`: Spanish
- `"es-419"`: Spanish (Latin America)
- `"eu"`: Basque
- `"fil"`: Filipino
- `"fr"`: French
- `"gl"`: Galician
- `"hr"`: Croatian
- `"zu"`: Zulu
- `"is"`: Icelandic
- `"it"`: Italian
- `"sw"`: Swahili
- `"lv"`: Latvian
- `"lt"`: Lithuanian
- `"hu"`: Hungarian
- `"nl"`: Dutch
- `"no"`: Norwegian
- `"uz"`: Uzbek
- `"pl"`: Polish
- `"pt-BR"`: Portuguese (Brazil)
- `"pt-PT"`: Portuguese (Portugal)
- `"ro"`: Romanian
- `"sq"`: Albanian
- `"sk"`: Slovak
- `"sl"`: Slovenian
- `"fi"`: Finnish
- `"sv"`: Swedish
- `"vi"`: Vietnamese
- `"tr"`: Turkish
- `"el"`: Greek
- `"bg"`: Bulgarian
- `"ky"`: Kyrgyz
- `"kk"`: Kazakh
- `"mk"`: Macedonian
- `"mn"`: Mongolian
- `"ru"`: Russian
- `"sr"`: Serbian
- `"uk"`: Ukrainian
- `"ka"`: Georgian
- `"hy"`: Armenian
- `"iw"`: Hebrew
- `"ur"`: Urdu
- `"ar"`: Arabic
- `"fa"`: Persian
- `"am"`: Amharic
- `"ne"`: Nepali
- `"hi"`: Hindi
- `"mr"`: Marathi
- `"bn"`: Bengali
- `"pa"`: Punjabi
- `"gu"`: Gujarati
- `"ta"`: Tamil
- `"te"`: Telugu
- `"kn"`: Kannada
- `"ml"`: Malayalam
- `"si"`: Sinhala
- `"th"`: Thai
- `"lo"`: Lao
- `"my"`: Myanmar
- `"km"`: Khmer
- `"ko"`: Korean
- `"ja"`: Japanese
- `"zh-CN"`: Chinese (Simplified)
- `"zh-TW"`: Chinese (Traditional)

**Example**:
```json
{
  "language": "en"
}
```

### 🎯 Reviews origin
**Parameter**: `reviewsOrigin`
**Type**: `Enum` (Optional)
**Default**: `"all"`
**Description**: Select whether you want all reviews (from Google, Tripadvisor, etc.) or only reviews from Google.

**Value Options**:
- `"all"`: All reviews from Google and third-party sites
- `"google"`: Only Google native reviews

**Important Note**: Recent Google updates have reduced the number of Google reviews available through the "all" option, particularly for hotel reviews. For complete Google review coverage, set this to `"google"`.

**Example**:
```json
{
  "reviewsOrigin": "google"
}
```

### 🔒 Personal data
**Parameter**: `personalData`
**Type**: `boolean` (Optional)
**Default**: `true`
**Description**: This setting allows you to obtain personal data about reviewer (his ID, name, URL and his photo URL) and about review (ID and URL).

**Legal Notice**: Personal data is protected by the GDPR in the European Union and by other regulations around the world. You should not scrape personal data unless you have a legitimate reason to do so. If you're unsure whether your reason is legitimate, consult your lawyers.

**Example**:
```json
{
  "personalData": false
}
```

## Complete Input Schema Example

```json
{
  "startUrls": [
    {
      "url": "https://www.google.com/maps/place/Hotel+Ritz+Paris/@48.8683,2.3280,17z/"
    }
  ],
  "placeIds": [
    "ChIJbf8C1yFxdDkR3n12P4DkKt0"
  ],
  "maxReviews": 50,
  "reviewsSort": "newest",
  "reviewsStartDate": "6 months",
  "language": "en",
  "reviewsOrigin": "google",
  "personalData": false
}
```

## Best Practices for Travel Advisor Implementation

### For Hotel Reviews Analysis
```json
{
  "startUrls": [{"url": "HOTEL_GOOGLE_MAPS_URL"}],
  "maxReviews": 100,
  "reviewsSort": "newest",
  "reviewsStartDate": "1 year",
  "language": "en",
  "reviewsOrigin": "google",
  "personalData": false
}
```

### For Quick Sentiment Check
```json
{
  "startUrls": [{"url": "PLACE_URL"}],
  "maxReviews": 20,
  "reviewsSort": "mostRelevant",
  "reviewsStartDate": "3 months",
  "language": "en",
  "reviewsOrigin": "all",
  "personalData": false
}
```

### For Comprehensive Analysis
```json
{
  "startUrls": [{"url": "PLACE_URL"}],
  "maxReviews": 500,
  "reviewsSort": "newest",
  "reviewsStartDate": "2 years",
  "language": "en",
  "reviewsOrigin": "google",
  "personalData": false
}
```

## Cost Optimization Tips

1. **Limit `maxReviews`**: 20-100 reviews usually sufficient for analysis
2. **Use `reviewsStartDate`**: Focus on recent reviews (6 months to 1 year)
3. **Set `personalData: false`**: Reduces data size and improves privacy compliance
4. **Choose `reviewsOrigin: "google"`**: More reliable for hotels and accommodations
5. **Batch similar requests**: Group multiple places from same area

## Rate Limits & Performance

- **Processing Speed**: ~2-4 minutes per place for 100 reviews
- **Success Rate**: >99%
- **Concurrent Requests**: Handled automatically by Apify
- **Data Retention**: Results stored in Apify datasets for 7 days (free plan)

## Integration Notes

- Use with n8n HTTP nodes for automated workflows
- Perfect for combining with Booking.com data for comprehensive hotel analysis
- Results can be directly fed into AI prompts for sentiment analysis
- Export formats: JSON, CSV, Excel, XML, HTML
