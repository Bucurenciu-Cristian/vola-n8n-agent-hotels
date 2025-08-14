# VolaBot - AI Travel Consultant

> **AI-powered travel consultant that curates personalized hotel recommendations by analyzing 100+ properties from Booking.com, Airbnb, and Google Maps with streamlined parallel processing.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![N8N Workflow](https://img.shields.io/badge/N8N-Workflow-blue)](https://n8n.io/)
[![Powered by Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-orange)](https://ai.google.dev/)

## 🌟 Overview

VolaBot is an intelligent travel consultant built as an N8N workflow that helps users find accommodations by:

- **Multi-Platform Search**: Simultaneously scrapes Booking.com, Airbnb, and Google Maps
- **Intelligent Curation**: Always returns exactly 7 properties with strict 5-2 platform ratio
- **Review Integration**: Uses available review data from property scrapers and Google Maps
- **Smart Image Selection**: Uses caption intelligence to prioritize user-relevant visuals
- **Travel Consultant Persona**: Witty, insightful voice with multi-language support

### Key Features

- 🤖 **AI Agent**: Google Gemini 2.5-flash with PostgreSQL chat memory
- 📊 **Multi-Platform Data**: Booking.com + Airbnb + Google Maps integration
- 🎯 **Intelligent Ranking**: Budget-based filtering with quality thresholds
- 🌍 **Multi-Language Support**: Auto-detection with consistent translation
- 📸 **Smart Image Curation**: Maximum 3 strategically selected images per property
- 📝 **Review Integration**: Uses available review data from main scrapers and Google Maps

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ installed
- Access to N8N instance (Railway hosted)
- API credentials for Apify, Google Gemini, and PostgreSQL

### Setup

1. **Clone and setup project:**
   ```bash
   git clone <your-repo-url>
   cd vola-n8n-agent-hotels
   npm run setup
   ```

2. **Make your first change:**
   ```bash
   # Edit the system prompt
   nano MAIN_PROMPT.md
   
   # Sync changes to workflow
   npm run dev
   ```

3. **Deploy to N8N:**
   - Import `Hotels-Agent-CRISTI.json` into your N8N instance
   - Configure credentials (Apify, Google Gemini, PostgreSQL)
   - Test the workflow

## 📁 Project Structure

```
vola-n8n-agent-hotels/
├── README.md                      # 👋 You are here
├── CLAUDE.md                      # Development guide and project context
├── MAIN_PROMPT.md                 # 🎯 Single source of truth for AI prompt
├── Hotels-Agent-CRISTI.json       # 🔧 N8N workflow configuration
├── comparison.md                  # Evolution analysis and client presentation
│
├── scripts/                       # 🛠️ Automation tools
│   ├── sync-prompt.js             # Sync MAIN_PROMPT.md → JSON
│   ├── validate-workflow.js       # Validate workflow before deployment
│   └── organize-test-data.js      # Organize scattered test files
│
├── config/                        # ⚙️ Configuration documentation
│   ├── README.md                  # Configuration guide
│   ├── api-parameters.md          # API parameter reference
│   └── node-settings.md           # N8N node configuration
│
├── test-data/                     # 🧪 Testing and examples
│   ├── README.md                  # Testing guide
│   ├── sample-requests/           # Example requests and scenarios
│   └── api-responses/             # Real API response examples
│
├── docs/                          # 📚 Technical documentation
│   ├── api-documentation/         # API reference docs
│   └── development-notes.md       # Development insights
│
└── archive/                       # 📦 Legacy files and backups
    ├── backups/                   # Automated workflow backups
    ├── init/                      # Original workflow versions
    └── development-notes/         # Historical development files
```

## 🔧 Development Workflow

### Making Changes

The recommended workflow eliminates duplication and GUI clicking:

```bash
# 1. Edit the system prompt (single source of truth)
nano MAIN_PROMPT.md

# 2. Sync changes to N8N workflow JSON
npm run sync-prompt

# 3. Validate workflow structure
npm run validate

# 4. Import Hotels-Agent-CRISTI.json to N8N
# 5. Test the workflow
```

### Available Commands

```bash
npm run help          # 📖 Show all available commands
npm run sync-prompt    # 🔄 Update JSON with MAIN_PROMPT.md content
npm run validate       # ✅ Validate workflow structure
npm run organize       # 📁 Organize test data files
npm run dev           # 🚀 Quick development cycle (sync + validate)
npm run deploy-prep   # 🎯 Full preparation for deployment
npm run backup        # 💾 Create timestamped backup
```

### Key Principles

- **📝 Local First**: `MAIN_PROMPT.md` is the single source of truth
- **🔄 Sync Before Deploy**: Always run `npm run sync-prompt` before N8N import
- **✅ Validate Everything**: Use `npm run validate` to catch issues early
- **📦 Backup Automatically**: Scripts create backups before changes

## 🎯 Core Features Deep Dive

### Multi-Platform Search Strategy

VolaBot executes 3 scraper APIs simultaneously when users confirm search:

1. **Booking.com Scraper** (`voyager~booking-scraper`)
2. **Airbnb Scraper** (`tri_angle~airbnb-scraper`)  
3. **Google Maps Scraper** (`compass~crawler-google-places`)

**Architecture**: Parallel execution with graceful error handling - system continues operating even if individual scrapers fail.

### Intelligent Property Curation Algorithm

**Step 1: Candidate Pools**
- Gather properties from both platforms
- Apply budget-based quality filters

**Step 2: Unified Ranking**  
- Combine and rank by adherence to focus criteria
- Secondary sort by rating + Google Maps enhancement

**Step 3: 5-2 Platform Ratio Enforcement**
- Select top 7 while maintaining strict 5-2 platform distribution
- Quality gates ensure minimum ratings

### Smart Image Curation

**For Airbnb (Caption Intelligence):**
- Uses `caption` text as primary filter for reliability
- Matches user priorities: "pool" → "piscin", "ștrand", "înot"
- Room identification: "Dormitor principal", "Living", "Bucătărie"

**For Booking.com (Visual Analysis):**
- Standard visual quality assessment
- Focus on user experience priorities

## 🔨 Technical Architecture

### Core Components

- **N8N Workflow**: Event-driven architecture with chat triggers
- **AI Agent**: Google Gemini with sophisticated travel consultant persona  
- **Memory**: PostgreSQL chat memory for session persistence
- **Data Sources**: Multi-platform scraping with intelligent aggregation

### API Integration

```json
{
  "booking_scraper": "voyager~booking-scraper",
  "airbnb_scraper": "tri_angle~airbnb-scraper", 
  "googlemaps_scraper": "compass~crawler-google-places",
  "ai_model": "gemini-2.5-flash",
  "memory": "postgresql"
}
```

### Critical Parameters

- **flexibility_window**: Only `"0"`, `"1"`, `"2"`, `"7"` (exact string values)
- **language**: Always `"ro"` for scraper tools (hardcoded)
- **Date formats**: ISO format required (YYYY-MM-DD)
- **Platform ratio**: Strict 5-2 distribution (5 Booking + 2 Airbnb or vice versa)

## 🧪 Testing

### Manual Testing Process

1. **Start N8N chat interface**
2. **Input**: Destination + dates + preferences
3. **Verify**: Parameter extraction and validation
4. **Monitor**: Scraper tool execution (~5 minutes)
5. **Validate**: Response formatting and link integrity

### Test Data Organization

- **`test-data/api-responses/`**: Real API responses for structure validation
- **`test-data/sample-requests/`**: Example requests and testing scenarios
- **`Testing.http`**: HTTP requests for manual API testing

### Quality Assurance

- ✅ **7 Properties**: Always exactly 7 recommendations
- ✅ **5-2 Platform Ratio**: Strict distribution enforcement
- ✅ **Review Integration**: Uses available review data from main scrapers
- ✅ **Link Integrity**: URLs copied verbatim from source
- ✅ **Language Consistency**: All output in user's detected language

## 🔐 Security & Configuration

### API Credentials Required

- **Apify API Token**: For scraper tools access
- **Google Gemini API Key**: For AI agent functionality
- **PostgreSQL Connection**: For chat memory persistence

### Environment Variables

Configure in N8N credentials manager:
- `APIFY_API_TOKEN`
- `GOOGLE_GEMINI_API_KEY`  
- `POSTGRES_CONNECTION_STRING`

## 🚢 Deployment

### Railway N8N Deployment

1. **Prepare locally:**
   ```bash
   npm run deploy-prep
   ```

2. **Import to N8N:**
   - Upload `Hotels-Agent-CRISTI.json`
   - Configure credentials
   - Test webhook endpoints

3. **Validate deployment:**
   - Test chat interface
   - Verify scraper connections
   - Check AI agent responses

### Deployment Checklist

- [ ] Run `npm run validate` successfully
- [ ] All API credentials configured
- [ ] PostgreSQL database accessible  
- [ ] Webhook URLs updated
- [ ] Chat interface tested

## 📊 Performance Metrics

### Operational Targets

- **Response Time**: ~5 minutes for full search
- **Property Coverage**: 100+ properties analyzed
- **Review Integration**: Available review data from scrapers + Google Maps
- **Image Quality**: Maximum 3 strategically selected images
- **Platform Distribution**: Strict 5-2 ratio maintained

### Cost Optimization

- **Google Maps Scraper**: Limited to 10 places per search for performance
- **Apify Scrapers**: Limited to 10 items each for performance
- **AI Token Usage**: Optimized prompts and streamlined responses

## 🤝 Contributing

### Development Process

1. **Fork** the repository
2. **Create** feature branch from `main`
3. **Edit** `MAIN_PROMPT.md` for prompt changes
4. **Run** `npm run dev` to sync and validate
5. **Test** changes in N8N environment
6. **Submit** pull request with description

### Code Standards

- **Single Source of Truth**: Always edit `MAIN_PROMPT.md`, never JSON directly
- **Validation Required**: All changes must pass `npm run validate`
- **Documentation**: Update relevant docs for configuration changes
- **Testing**: Include test scenarios for new features

## 📞 Support

### Getting Help

- **Development Guide**: See `CLAUDE.md` for project context and setup
- **API Configuration**: Review N8N workflow configuration
- **System Evolution**: Check `comparison.md` for technical achievements
- **Prompt Updates**: Edit `MAIN_PROMPT.md` for system behavior changes

### Common Issues

- **Invalid flexibility_window**: Must use exact string values
- **Date format errors**: Ensure ISO format (YYYY-MM-DD)
- **Platform ratio violations**: Algorithm must enforce 5-2 split
- **Link corruption**: URLs must be copied verbatim from source

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**VolaBot** - Where AI meets travel expertise. Built with ❤️ by the Vola team.