# VolaBot N8N Node Configuration Guide

> **Complete configuration reference for all N8N nodes in the VolaBot workflow**

This guide covers the configuration of every node type used in the VolaBot N8N workflow, including parameters, credentials, and troubleshooting.

## 📋 Node Overview

The VolaBot workflow consists of these primary node types:

1. **Chat Trigger** - User interaction interface
2. **AI Agent** - Core VolaBot intelligence
3. **HTTP Request Tools** - Scraper API integrations (3 tools)
4. **PostgreSQL Chat Memory** - Conversation persistence

## 💬 Chat Trigger Node

### Basic Configuration

| Setting | Value | Description |
|---------|-------|-------------|
| **Public** | `true` | Allows external access |
| **Initial Messages** | `"Bună, sunt Volabot! 👋\nCu ce te pot ajuta azi?"` | Welcome message |

### Advanced Options

| Option | Value | Purpose |
|--------|--------|---------|
| **Input Placeholder** | Custom placeholder text | Guides user input format |
| **Response Mode** | `responseNode` | Uses AI Agent for responses |
| **Show Welcome Screen** | `true` | Displays initial greeting |
| **Title** | `"Descoperă opțiuni de cazare cu Vola!"` | Chat window title |
| **Subtitle** | Descriptive text | Explains the service |

### Custom CSS Styling

The chat interface uses custom CSS for Vola branding:

```css
:root {
  --chat--color-primary: #4169E1;      /* Vola Blue */
  --chat--color-secondary: #FFB800;     /* Vola Yellow */
  --chat--window--width: 400px;
  --chat--window--height: 600px;
  /* ... more variables */
}
```

**Key Styling Features**:
- Vola brand colors (blue primary, yellow accent)
- Rounded message bubbles
- Modern gradient header
- Responsive design
- Smooth hover animations

## 🤖 AI Agent Node

### Core Configuration

| Setting | Value | Description |
|---------|--------|-------------|
| **Type** | `@n8n/n8n-nodes-langchain.agent` | LangChain agent node |
| **System Message** | Content from MAIN_PROMPT.md | AI behavior definition |
| **Return Intermediate Steps** | `false` | Hide internal processing |

### System Message Structure

The system message contains these critical sections:

1. **Identity & Rules**: VolaBot persona and language consistency
2. **Conversation Flow**: User interaction patterns
3. **Search Execution**: Multi-platform API coordination  
4. **Curation Algorithm**: Property selection logic
5. **Writing Style**: Response formatting and tone
6. **Image Curation**: Smart visual selection
7. **Quality Gates**: Validation requirements

### Memory Integration

The AI Agent connects to PostgreSQL Chat Memory for session persistence:
- **Memory Type**: PostgreSQL
- **Table**: `hotels_agent`
- **Session Management**: Automatic
- **Context Window**: Unlimited (database-backed)

## 🔧 HTTP Request Tool Nodes (Scrapers)

### 1. Booking.com Scraper

| Setting | Value |
|---------|-------|
| **URL** | `https://api.apify.com/v2/acts/voyager~booking-scraper/run-sync-get-dataset-items` |
| **Method** | `POST` |
| **Authentication** | Predefined Credential (Apify API) |
| **Tool Description** | `"Scrape Booking to get listings."` |

**Query Parameters**:
- `maxItems`: `10`
- `limit`: `10`

**JSON Body Structure**:
```json
{
  "search": "{{ $fromAI('destination', 'The destination the user wants to visit', 'string') }}",
  "checkIn": "{{ $fromAI('check_in_date', 'Check-in date as ISO date only', 'string') }}",
  "checkOut": "{{ $fromAI('check_out_date', 'Check-out date as ISO date only', 'string') }}",
  "adults": {{ $fromAI('adults', 'Number of adults on the trip', 'number') }},
  "children": {{ $fromAI('children', 'Number of children on the trip', 'number') }},
  "rooms": {{ $fromAI('rooms', 'Number of rooms needed', 'number') }},
  "currency": "{{ $fromAI('currency', 'Currency in which to display results', 'string') }}",
  "language": "ro",
  "flexibility_window": "{{ $fromAI('flexibility_window', 'Flexibility window for dates', 'string') }}",
  "minMaxPrice": "{{ $fromAI('price_range', 'Price range for accommodations', 'string') }}"
}
```

**Field Optimization**:
- **fieldsToInclude**: `except`
- **Excluded Fields**: `id,descriptionOriginalLanguage,metaDescription,seoTitle,thumbnail,androidLink,iosLink,breadcrumbs,host,coHosts,locationSubtitle,htmlDescription,brandHighlights,icon,timestamp,language`

### 2. Airbnb Scraper

| Setting | Value |
|---------|-------|
| **URL** | `https://api.apify.com/v2/acts/tri_angle~airbnb-scraper/run-sync-get-dataset-items` |
| **Method** | `POST` |
| **Authentication** | Predefined Credential (Apify API) |
| **Tool Description** | `"Scrape AirBnb to get available listings."` |

**JSON Body Structure**:
```json
{
  "adults": {{ $fromAI('adults', 'Number of adults on the trip', 'number') }},
  "checkIn": "{{ $fromAI('check_in_date', 'Check-in date as ISO date only', 'string') }}",
  "checkOut": "{{ $fromAI('check_out_date', 'Check-out date as ISO date only', 'string') }}",
  "children": {{ $fromAI('children', 'Number of children on the trip', 'number') }},
  "currency": "{{ $fromAI('currency', 'Currency in which to display results', 'string') }}",
  "infants": {{ $fromAI('infants', 'Number of infants on the trip', 'number') }},
  "locale": "ro-RO",
  "locationQueries": ["{{ $fromAI('destination', 'The destination the user wants to visit', 'string') }}"],
  "minBathrooms": {{ $fromAI("min_bathrooms", "Minimum number of bathrooms", "number") }},
  "minBedrooms": {{ $fromAI("min_bedrooms", "Minimum number of bedrooms", "number") }},
  "minBeds": {{ $fromAI("min_beds", "Minimum number of beds", "number") }},
  "pets": {{ $fromAI('pets', 'Number of pets on the trip', 'number') }},
  "priceMax": {{ $fromAI('price_max', 'Maximum price per night', 'number') }},
  "priceMin": {{ $fromAI('price_min', 'Minimum price per night', 'number') }}
}
```

### 3. Google Maps Scraper

| Setting | Value |
|---------|-------|
| **URL** | `https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items` |
| **Method** | `POST` |
| **Authentication** | Predefined Credential (Apify API) |
| **Tool Description** | `"Search for hotels and accommodations on Google Maps to get location data, reviews, and ratings."` |

**JSON Body Structure**:
```json
{
  "searchStringsArray": ["hotels"],
  "locationQuery": "{{ $fromAI('destination', 'The destination to search for hotels', 'string') }}",
  "maxCrawledPlacesPerSearch": 2,
  "language": "ro",
  "searchMatching": "all",
  "website": "allPlaces",
  "skipClosedPlaces": false,
  "scrapePlaceDetailPage": true,
  "maxReviews": 25,
  "reviewsSort": "newest",
  "reviewsOrigin": "Google"
}
```

## 🗄️ PostgreSQL Chat Memory

### Connection Configuration

| Setting | Description |
|---------|-------------|
| **Host** | PostgreSQL server hostname |
| **Port** | Database port (default: 5432) |
| **Database** | Database name |
| **Username** | Database username |
| **Password** | Database password (credential) |

### Table Structure

The chat memory automatically creates a table with this structure:
```sql
CREATE TABLE hotels_agent (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255),
  message_type VARCHAR(50),
  content TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Memory Management

- **Session Persistence**: Conversations persist across page refreshes
- **Auto-Cleanup**: Old sessions cleaned based on configuration
- **Context Window**: Unlimited (database-backed)
- **Performance**: Indexed by session_id for fast retrieval

## 🔐 Credentials Configuration

### Apify API Credential

| Field | Description |
|-------|-------------|
| **Name** | `Apify account` |
| **Token** | Your Apify API token |
| **Usage** | All three scraper tools |

**Setup**:
1. Get API token from Apify Console
2. Create credential in N8N
3. Reference in HTTP Request Tool nodes

### PostgreSQL Credential

| Field | Description |
|-------|-------------|
| **Name** | `PostgreSQL Hotels` |
| **Host** | Database server hostname |
| **Port** | 5432 (default) |
| **Database** | Your database name |
| **Username** | Database username |
| **Password** | Database password |

**Setup**:
1. Create PostgreSQL database
2. Create credential in N8N
3. Reference in Chat Memory node

### Google Gemini API (if separate)

| Field | Description |
|-------|-------------|
| **Name** | `Google Gemini API` |
| **API Key** | Your Gemini API key |
| **Usage** | AI Agent node |

## ⚙️ Node Connections and Flow

### Connection Map

```
Chat Trigger → AI Agent ← → PostgreSQL Memory
                 ↓
           [AI decides when to use tools]
                 ↓
    ┌────────────┼────────────┐
    ↓            ↓            ↓
Booking Tool  Airbnb Tool  Google Maps Tool
    ↓            ↓            ↓
         AI Agent (processes results)
                 ↓
          Response to Chat
```

### Execution Flow

1. **User Input**: Chat Trigger receives message
2. **AI Processing**: Agent analyzes request and context
3. **Memory Check**: Previous conversation loaded
4. **Parameter Extraction**: AI determines search parameters
5. **Tool Activation**: All three scrapers called simultaneously
6. **Data Processing**: AI processes and ranks results
7. **Response Generation**: Formatted response with recommendations
8. **Memory Update**: Conversation state saved

## 🔧 Advanced Configuration

### Error Handling

Each HTTP Request Tool has error handling configured:

| Setting | Value | Purpose |
|---------|-------|---------|
| **Retry on Fail** | `true` | Automatic retry on failure |
| **On Error** | `continueRegularOutput` | Don't stop workflow |
| **Timeout** | 120 seconds | Prevent hanging requests |

### Performance Optimization

- **Query Limits**: 10-15 results per scraper
- **Field Exclusion**: Remove unnecessary response data
- **Parallel Execution**: All scrapers run simultaneously
- **Response Caching**: PostgreSQL memory reduces redundant calls

### Security Settings

- **Webhook Security**: Public access with rate limiting
- **Credential Encryption**: All API keys encrypted at rest
- **Data Privacy**: No sensitive user data logged
- **Network Security**: HTTPS-only connections

## 🔍 Troubleshooting

### Common Node Issues

#### 1. AI Agent Not Responding
**Symptoms**: Agent doesn't process messages
**Solutions**:
- Check Google Gemini API credential
- Verify system message is loaded
- Check memory connection

#### 2. Scraper Tools Failing  
**Symptoms**: Tools return errors or no data
**Solutions**:
- Verify Apify API credential
- Check API endpoint URLs
- Validate parameter formats
- Review rate limiting

#### 3. Memory Issues
**Symptoms**: Conversations not persisting
**Solutions**:
- Check PostgreSQL connection
- Verify table permissions
- Check database disk space

#### 4. Chat Interface Problems
**Symptoms**: Chat not loading or responding
**Solutions**:
- Check webhook URL accessibility
- Verify chat trigger configuration
- Review browser console errors

### Diagnostic Commands

```javascript
// Check node connections in N8N console
console.log('Node connections:', workflow.connections);

// Validate tool parameters
console.log('Tool params:', $input.all());

// Check memory state
console.log('Memory context:', $('PostgreSQL Chat Memory').all());
```

### Performance Monitoring

- **Response Times**: Monitor API call durations
- **Error Rates**: Track failed requests
- **Memory Usage**: Monitor database growth
- **User Engagement**: Track conversation lengths

## 📚 References

- **N8N Documentation**: [n8n.io/docs](https://docs.n8n.io/)
- **Apify APIs**: [docs.apify.com](https://docs.apify.com/)
- **PostgreSQL**: [postgresql.org/docs](https://www.postgresql.org/docs/)
- **Google Gemini**: [ai.google.dev/docs](https://ai.google.dev/docs)

---

**Note**: Always test configuration changes in a staging environment before deploying to production Railway instance.