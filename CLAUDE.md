# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a N8N workflow project for **VolaBot**, an AI-powered travel consultant that helps users find accommodations by scraping and analyzing data from Booking.com and Airbnb. The system provides curated hotel recommendations with detailed review analysis, image curation, and pricing information.

## Architecture

### Core Components

**N8N Workflow (`Hotels-Agent-CRISTI.json`)**
- Main workflow configuration defining the entire agent pipeline
- Event-driven architecture triggered by chat messages
- Integrated AI agent with sophisticated travel consultant persona
- Multi-platform data aggregation and intelligent ranking system

**AI Agent System**
- **Language Model**: Google Gemini (gemini-2.5-flash)
- **Memory**: PostgreSQL chat memory for session persistence
- **Persona**: VolaBot - sophisticated travel consultant with witty, insightful communication style
- **Core Logic**: Property curation algorithm with strict 5-2 platform ratio (5 Booking.com + 2 Airbnb properties)

**Data Sources & Scraping**
- **Booking.com Scraper**: Apify voyager~booking-scraper for accommodation data
- **Airbnb Scraper**: Apify tri_angle~airbnb-scraper for accommodation data
- **Review Scrapers**: Separate scrapers for detailed review analysis from both platforms
- **Google Maps Reviews**: compass~google-maps-reviews-scraper for authentic guest experiences, ratings validation, and amenity verification

### Workflow Architecture

```
Chat Input → AI Agent → Scraping Tools → Review Analysis → Response
     ↓         ↓           ↓              ↓
 Webhook → PostgreSQL → Apify APIs → Data Processing
```

**Node Flow**:
1. **Chat Trigger**: Receives user messages via N8N chat interface
2. **Webhook Integration**: External API endpoint for third-party integrations
3. **AI Agent**: Central orchestration with business logic and persona
4. **Scraping Tools**: Parallel data collection from multiple sources
5. **Review Analysis**: Detailed sentiment and preference analysis
6. **Response Generation**: Formatted recommendations with images and links

## Key Features

### Intelligent Property Curation
- **Mandatory 7 Properties**: Always returns exactly 7 accommodations
- **5-2 Platform Ratio**: Strict distribution between Booking.com and Airbnb
- **Budget-Based Filtering**: Automatic quality thresholds based on price range
- **Ranking Algorithm**: Quality score + platform ratio enforcement

### Advanced Review Analysis
- **Volume**: Analyzes up to 500 reviews per property
- **Segmentation**: Groups reviews by traveler type (couples, families, business)
- **Sentiment Analysis**: 3-4 positives + 2 negatives with context explanation
- **Sample Size Transparency**: Shows number of reviews analyzed

### Google Maps Integration
- **Enhanced Validation**: Cross-validates property ratings with Google Maps reviews
- **Amenity Verification**: Uses Google reviews to confirm gym, spa, pool availability
- **Ranking Boost**: Properties with 4.0+ Google rating get priority scoring
- **Cost Optimized**: 25 reviews per property (~$15/month operational cost)
- **Authentic Experience**: Incorporates genuine guest experiences from Google platform

### Smart Image Curation
- **User-Priority Matching**: Prioritizes images based on user's stated preferences
- **Quality Filtering**: Eliminates low-quality, irrelevant, or mundane images
- **Visual Storytelling**: Maximum 3 strategically selected images per property
- **Fallback Strategy**: Shows fewer high-quality images rather than padding with mediocre ones

### Multi-Language Support
- **Language Detection**: Automatically detects user's language from first message
- **Consistent Translation**: Translates all content to user's language, including mixed-language property titles
- **Hardcoded Backend**: Uses Romanian (`"ro"`) for scraper tool operations while maintaining user language for responses

## Development Commands

### N8N Workflow Management
```bash
# Import workflow (if N8N CLI available)
n8n import:workflow --file=Hotels-Agent-CRISTI.json

# Export workflow changes
n8n export:workflow --id=pkELWZSsqdr9pNfy --output=Hotels-Agent-CRISTI.json
```

### Environment Configuration
```bash
# Set up environment variables
cp .env.example .env
# Configure Apify API tokens, PostgreSQL connection, Google Gemini API key
```

### Database Setup
```bash
# PostgreSQL chat memory table
# Table: hotels_agent (managed by N8N PostgreSQL Chat Memory node)
```

## Configuration Files

### System Prompts
- **`MAIN_PROMPT.txt`**: Current active system prompt (embedded in workflow)
- **`initial_prompt.txt`**: Alternative/backup prompt version
- **Prompt Location**: Both files contain identical VolaBot system instructions

### Workflow Configuration
- **`Hotels-Agent-CRISTI.json`**: Complete N8N workflow definition (primary workflow)
- **`Hotels-Agent.json`**: Legacy workflow file (backup)
- **Node Configuration**: All tool integrations, AI settings, and flow logic
- **Credentials**: References to PostgreSQL, Google Gemini, and Apify API configurations

## API Integrations

### Apify Scrapers
```javascript
// Booking.com Scraper
POST https://api.apify.com/v2/acts/voyager~booking-scraper/run-sync-get-dataset-items
// Parameters: checkIn, checkOut, search, adults, children, rooms, currency, language

// Airbnb Scraper
POST https://api.apify.com/v2/acts/tri_angle~airbnb-scraper/run-sync-get-dataset-items
// Parameters: adults, children, checkIn, checkOut, locationQueries, priceMin, priceMax

// Review Scrapers
POST https://api.apify.com/v2/acts/voyager~booking-reviews-scraper/run-sync-get-dataset-items
POST https://api.apify.com/v2/acts/tri_angle~airbnb-reviews-scraper/run-sync-get-dataset-items

// Google Maps Reviews Scraper
POST https://api.apify.com/v2/acts/compass~google-maps-reviews-scraper/run-sync-get-dataset-items
// Parameters: startUrls (Google Maps URLs), maxReviews (25), reviewsSort ("newest"), reviewsOrigin ("Google")
```

### Critical Parameters
- **`flexibility_window`**: Only valid values are `"0"`, `"1"`, `"2"`, or `"7"`
- **`language`**: Always hardcoded to `"ro"` for scraper tools
- **Date Formats**: ISO date format required (YYYY-MM-DD)
- **Currency**: User-specified or inferred (EUR, USD, RON)

### Google Maps Parameters
- **`maxReviews`**: Set to 25 for cost optimization (estimated $15/month)
- **`reviewsSort`**: "newest" for relevant recent feedback
- **`reviewsStartDate`**: "6 months" for recent reviews only
- **`reviewsOrigin`**: "Google" for hotels to avoid diluted results
- **`personalDataEnabled`**: false for privacy compliance

## Business Logic

### Property Selection Algorithm
1. **Candidate Pools**: Gather properties from both platforms
2. **Budget Filtering**: Apply quality thresholds based on price range
3. **Unified Ranking**: Combine and rank all candidates by quality + rating
4. **Google Maps Enhancement**: Apply bonus scoring for 4.0+ Google ratings, verify amenities through Google reviews
5. **5-2 Enforcement**: Select top 7 while maintaining platform ratio
6. **Quality Gates**: Ensure minimum ratings and focus criteria are met

### User Interaction Flow
1. **Information Gathering**: Destination, dates, budget, preferences
2. **Confirmation Request**: Summarize search parameters, ask permission
3. **Data Collection**: Parallel scraping from multiple sources (~5 minutes)
4. **Analysis & Curation**: Review analysis, image selection, ranking
5. **Response Generation**: Formatted recommendations with booking links

### Date Handling Logic
- **Exact Dates**: Set `flexibility_window = "0"`
- **Vague Dates**: Set `flexibility_window = "3"` (safe default)
- **Required Format**: Must resolve to specific ISO dates before search
- **Validation**: No search proceeds without exact dates

## Quality Standards

### Output Requirements
- **7 Properties**: Mandatory count (unless fewer available)
- **Platform Mix**: Strict 5-2 distribution
- **Review Coverage**: No property shown without review analysis
- **Link Integrity**: URLs copied verbatim from source data
- **Language Consistency**: All output in user's detected language

### Content Quality
- **Review Analysis**: 3-4 positives + 2 negatives with explanations
- **Image Curation**: Maximum 3 high-quality, distinct images
- **Writing Style**: Sophisticated, witty travel consultant voice
- **Transparency**: Show number of reviews analyzed for each property

## Testing & Validation

### Manual Testing
```bash
# Test via N8N chat interface
# 1. Start with destination and dates
# 2. Verify parameter extraction
# 3. Check scraper tool calls
# 4. Validate response formatting
# 5. Confirm link integrity
```

### Integration Points
- **PostgreSQL**: Chat memory persistence
- **Apify APIs**: Data scraping reliability
- **Google Gemini**: AI response quality
- **Webhook**: External integration capability

## Troubleshooting

### Common Issues
- **Invalid flexibility_window**: Must use exact string values `"0"`, `"1"`, `"2"`, `"7"`
- **Date Format Errors**: Ensure ISO format (YYYY-MM-DD) for scraper tools
- **Platform Ratio Violations**: Algorithm must enforce 5-2 split exactly
- **Language Inconsistency**: All output must match user's detected language
- **Link Corruption**: URLs must be copied verbatim from source JSON

### Debug Workflow
1. **Check Node Execution**: Verify each node completes successfully
2. **Validate Parameters**: Ensure AI extracts correct search parameters
3. **Review API Responses**: Check Apify scraper data quality
4. **Test Output Format**: Validate final response structure
5. **Monitor Chat Memory**: Ensure PostgreSQL persistence works

## Deployment Notes

- **N8N Environment**: Requires N8N instance with LangChain nodes
- **Database**: PostgreSQL with chat memory table
- **API Keys**: Apify, Google Gemini, PostgreSQL credentials
- **Webhook URL**: Configure for external integrations
- **Resource Limits**: Apify scrapers limited to 15 items each for performance
