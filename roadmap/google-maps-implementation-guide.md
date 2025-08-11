# VolaBot Google Maps Integration - Implementation Instructions

## 🔴 STEP 1: Update System Prompt (KNOWLEDGE Document)

### Find this section in your KNOWLEDGE document:
```markdown
## Multi-Platform Search Execution
```

### REPLACE IT ENTIRELY with:
```markdown
## Multi-Platform Search Execution

**CRITICAL: When user confirms search, you MUST simultaneously call ALL THREE scraper tools:**
1. **Booking.com scraper** with accommodation search parameters
2. **Airbnb scraper** with accommodation search parameters  
3. **Google Maps scraper** with location-based search for the destination

**LOCATION SYNCHRONIZATION RULE:**
The destination string MUST be IDENTICAL across all three scrapers:
- Booking: `"search": "Sibiu"`
- Airbnb: `"locationQueries": ["Sibiu"]`
- Google Maps: `"locationQuery": "Sibiu"`

Do NOT add country, region, or any modifiers - use the EXACT same string.
```

---

## 🔴 STEP 2: Add Google Maps Data Processing Section

### ADD this NEW section AFTER "## Reviews" in KNOWLEDGE:
```markdown
## Google Maps Data Integration

### Matching Properties Across Platforms

When Google Maps results return, match them with Booking/Airbnb properties:

**Primary Matching (Most Reliable):**
Check `hotelAds` array for Booking.com URLs:
```json
if (googleResult.hotelAds) {
  const bookingAd = googleResult.hotelAds.find(ad => ad.title === "Booking.com");
  if (bookingAd && bookingAd.url) {
    // This property DEFINITELY matches a Booking property
  }
}
```

**Secondary Matching (Name-Based):**
Use fuzzy matching for property names:
- Remove common words: "Hotel", "Hostel", "Pension", "Villa", "Casa"
- Compare core names: "Continental Forum" matches "Hotel Continental Forum Sibiu"
- Threshold: 80% similarity minimum

**Review Data Extraction:**
For matched properties, extract from Google Maps:
- `totalScore` → Additional rating data point
- `reviewsCount` → Total review volume
- `reviews[].textTranslated` → Review sentiment (anonymized)
- `additionalInfo.Amenities` → Verify claimed amenities

**GDPR Compliance:**
NEVER show from reviews:
- Reviewer names
- Reviewer URLs  
- Reviewer photos
- Review IDs

ALWAYS use from reviews:
- `textTranslated` content
- `stars` rating
- `publishedAtDate` for recency
- `reviewContext` for trip type

### Review Summary Template:
For each matched property, add:
"**Google Verification:** ✓ {{totalScore}}★ ({{reviewsCount}} reviews)
**Recent feedback:** [Summarize top 3 themes from textTranslated]"
```

---

## 🔴 STEP 3: Update HTTP Request Tool Node (Google Maps)

### In N8N, find your Google Maps HTTP Request Tool and UPDATE the body:

```json
{
  "searchStringsArray": ["hotels"],
  "locationQuery": "{{ $fromAI('destination', 'EXACT destination as used in Booking search', 'string') }}",
  "maxCrawledPlacesPerSearch": 5,
  "language": "ro",
  "searchMatching": "all",
  "website": "allPlaces",
  "skipClosedPlaces": false,
  "scrapePlaceDetailPage": true,
  "maxReviews": 25,
  "reviewsSort": "newest",
  "reviewsOrigin": "google",
  "scrapeReviewsPersonalData": false
}
```

**CRITICAL:** The `locationQuery` parameter MUST use the EXACT same AI extraction as Booking's `search` parameter.

---

## 🔴 STEP 4: Add Property Matching Logic to System Prompt

### Find this section: "## Final List Curation Algorithm"

### ADD this BEFORE Step 1:

```markdown
**Step 0: Google Maps Enrichment**
Before creating candidate pools, enrich Booking/Airbnb properties with Google data:

```javascript
// For each Booking property
bookingProperties.forEach(property => {
  // Try primary match (URL in hotelAds)
  let googleMatch = googleResults.find(g => 
    g.hotelAds?.some(ad => 
      ad.title === "Booking.com" && 
      ad.url.includes(property.name.toLowerCase().replace(/\s+/g, '-'))
    )
  );
  
  // If no URL match, try name match
  if (!googleMatch) {
    const cleanName = property.name.replace(/Hotel|Pension|Villa|Casa/gi, '').trim();
    googleMatch = googleResults.find(g => {
      const googleCleanName = g.title.replace(/Hotel|Pension|Villa|Casa/gi, '').trim();
      return similarity(cleanName, googleCleanName) > 0.8;
    });
  }
  
  // Enrich if matched
  if (googleMatch) {
    property.googleRating = googleMatch.totalScore;
    property.googleReviews = googleMatch.reviewsCount;
    property.recentSentiment = extractSentiment(googleMatch.reviews);
    property.verifiedAmenities = googleMatch.additionalInfo?.Amenities;
  }
});
```
```

---

## 🔴 STEP 5: Update Output Skeleton

### Find "## Output skeleton" and ADD Google verification:

```markdown
### Hotel Name • 9.2/10 • BOOKING.COM • ✓ Google 4.3★ (2827 reviews)
```

### In the "What couples loved" section, ADD:

```markdown
**Google Insights** (from 25 recent reviews):
• "Location perfect for exploring old town"
• "Breakfast variety exceptional"  
• Note: Parking is €8/day (not included)
```

---

## 🔴 STEP 6: Add Error Handling

### ADD to "Internal checklist before replying":

```markdown
- **Google Maps Data:** Confirmed at least 50% of properties have Google matches
- **Review Extraction:** Verified textTranslated is being used, not original text
- **GDPR Compliance:** Confirmed no reviewer names/URLs in output
- **Amenity Conflicts:** Noted any discrepancies between claimed and Google-verified amenities
```

---

## 🔴 STEP 7: Test Configuration

### Create a test search with these EXACT parameters:

1. **User message:** "Looking for hotels in Sibiu for August 20-22, 2 adults, under €200"

2. **Verify ALL THREE API calls use:**
   - Booking: `"search": "Sibiu"`
   - Airbnb: `"locationQueries": ["Sibiu"]`
   - Google Maps: `"locationQuery": "Sibiu"`

3. **Check the response includes:**
   - ✓ Google ratings appear for matched properties
   - ✓ Review insights are anonymized
   - ✓ No reviewer names visible
   - ✓ Amenity verifications noted

---

## 🔴 STEP 8: Add Fuzzy Matching Function

### ADD this to your system prompt in a new section called "## Helper Functions":

```markdown
## Helper Functions

### Name Similarity Check
When matching property names between platforms:
1. Remove these words: Hotel, Hostel, Pension, Vila, Villa, Casa, The, De, La
2. Convert to lowercase
3. Remove special characters: -, &, ', "
4. Check if 80% of words match

Example matches:
- "Hotel Continental Forum Sibiu" ↔ "Continental Forum" ✓
- "Casa Frieda" ↔ "Frieda Guest House" ✓  
- "The Am Ring Hotel" ↔ "Am Ring" ✓
```

---

## 🟡 WARNINGS TO WATCH FOR:

1. **Location Mismatch Alert**: If Google returns 0 matches, the location strings are different
2. **Review Language**: Reviews might not translate if `language: "ro"` doesn't match user language
3. **Timeout Risk**: Google Maps is often slower - ensure timeout is set to 120+ seconds
4. **Property Overflow**: Google might return 5 properties but only 2 match - that's normal

---

## ✅ VALIDATION CHECKLIST:

After implementing, verify:

- [ ] Test search "Sibiu" returns Google Maps data
- [ ] At least 1 property shows "✓ Google 4.X★" verification
- [ ] Review insights appear without names
- [ ] Properties are correctly matched (Continental Forum appears once, not twice)
- [ ] All 3 scrapers complete within 2 minutes

---

## 🚨 IF SOMETHING BREAKS:

### Problem: No Google matches found
**Fix:** Check if location strings are EXACTLY identical in all 3 API calls

### Problem: Duplicate properties in final list  
**Fix:** The matching logic is finding false positives - increase similarity threshold to 0.85

### Problem: Reviews show personal data
**Fix:** Only use `textTranslated`, never `name` or `reviewerUrl` fields

### Problem: Google Maps times out
**Fix:** Increase timeout to 180 seconds in HTTP Request Tool node

---

## 📝 COPY-PASTE READY CODE:

### For N8N Expression Editor (Google Maps locationQuery):
```
{{ $json["booking_search_destination"] }}
```

### For System Prompt (Review Anonymization):
```
Extract review insights using ONLY textTranslated field.
Format: "Recent guests mentioned: [theme1], [theme2], [theme3]"
NEVER include: "John said...", "Maria wrote...", or any names.
```

### For Testing Success:
```
Search: "hotels in Cluj for September 15-17, 2 adults, €100 budget"
Expected: At least 3 properties with Google verification badges
```