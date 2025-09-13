# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VolaBot is an AI-powered travel consultant built as an N8N workflow that curates personalized hotel recommendations by analyzing 100+ properties from multiple platforms (Booking.com, Airbnb, Google Maps) with intelligent AI agent delegation.

### Core Architecture

- **N8N Workflow**: Event-driven architecture with dual AI agent pattern
- **Main AI Agent**: Google Gemini with travel consultant persona and PostgreSQL chat memory
- **Image AI Agent**: Specialized image curation and analysis agent
- **Multi-Platform Integration**: Parallel scraping via Apify actors
- **Prompt-First Development**: Single source of truth pattern with automated sync

## Essential Commands

### Development Workflow

```bash
# Core development cycle (most important commands)
make dev                    # Sync prompts + validate workflow
make sync                   # Update JSON workflow with prompt changes
make validate               # Validate workflow structure

# Alternative using npm
npm run dev                 # Same as make dev
npm run sync-prompt         # Same as make sync
npm run validate           # Same as make validate
```

### Deployment Commands

```bash
make deploy                 # Full deployment preparation (backup + sync + validate)
make backup                 # Create timestamped backup
make import-ready          # Prepare workflow for N8N GUI import
```

### Project Management

```bash
make setup                 # Initial project setup
make organize              # Organize scattered test data files
make status               # Show project status and file info
make help                 # Show all available commands
```

## Key Architecture Patterns

### Dual AI Agent Pattern

The workflow uses a sophisticated AI agent delegation system:

1. **Main AI Agent** (`MAIN_PROMPT.md`):
   - Google Gemini 2.5-flash model
   - Travel consultant persona with witty, insightful voice
   - Handles user interaction, parameter extraction, platform orchestration
   - Manages 5-2 platform ratio enforcement (5 Booking + 2 Airbnb or vice versa)
   - PostgreSQL chat memory for session persistence

2. **Image AI Agent** (`IMAGE_PROMPT.md`):
   - Specialized image curation and analysis
   - Called by Main Agent via "Image AI AGENT ANALYZER" tool
   - Processes one property at a time for simplified operation
   - Caption-based intelligence for Airbnb, visual analysis for Booking.com

### Prompt-First Development

Critical pattern: **Never edit JSON directly**

```bash
# ✅ CORRECT: Edit prompts, then sync
nano MAIN_PROMPT.md        # Edit main agent behavior
nano IMAGE_PROMPT.md       # Edit image agent behavior
make sync                  # Update workflow JSON files

# ❌ INCORRECT: Never edit JSON directly
# nano Hotels-Agent-CRISTI.json  # Don't do this!
```

The sync system creates two versions:

- `Hotels-Agent-CRISTI.json` - Stripped template (for git commits)
- `Hotels-Agent-CRISTI.json.full` - Full workflow (for N8N import)

### Multi-Platform Scraping Architecture

```javascript
// Parallel execution pattern with graceful error handling
const scrapers = {
  booking: "voyager~booking-scraper",
  airbnb: "tri_angle~airbnb-scraper", 
  googlemaps: "compass~crawler-google-places"
};

// Critical parameters (exact string values required)
flexibility_window: "0"|"1"|"2"|"7"  // Only these exact strings
language: "ro"                       // Hardcoded for scrapers
maxItems: 10                         // Performance optimization
```

## Critical Configuration Details

### API Parameters (Exact Values Required)

```javascript
// flexibility_window validation - CRITICAL
"0" = exact dates only
"1" = ±1 day flexibility  
"2" = ±2 days flexibility
"7" = ±7 days flexibility
// Must be strings, not numbers!

// Date format requirements
checkInDate: "YYYY-MM-DD"     // ISO format required
checkOutDate: "YYYY-MM-DD"    // ISO format required

// Language settings
language: "ro"                // Hardcoded for all scrapers
```

### Platform Ratio Enforcement

The algorithm enforces strict 5-2 platform distribution:

```javascript
// Always exactly 7 properties total
const finalSelection = {
  booking: 5, airbnb: 2    // OR
  booking: 2, airbnb: 5    // Based on quality/preference
};
```

## File Structure and Responsibilities

### Core Files

MAIN_PROMPT.md              # 🎯 Main AI agent system prompt (single source of truth)
IMAGE_PROMPT.md             # 🖼️ Image AI agent system prompt
Hotels-Agent-CRISTI.json    # 🔧 N8N workflow template (auto-generated)
Hotels-Agent-CRISTI.json.full # 🚀 Full workflow for N8N import

### Development Tools

scripts/sync-prompt.js      # Syncs prompts to JSON workflow
scripts/validate-workflow.js # Validates workflow structure
scripts/update-api-limits.py # Updates API rate limits
scripts/truncate-json.py    # Truncates large JSON test files

### Configuration & Documentation

config/api-parameters.md    # API parameter reference
config/node-settings.md     # N8N node configuration guide
test-data/                  # Sample requests and API responses
docs/                       # Technical documentation

## Development Patterns

### Making Prompt Changes

```bash
# 1. Edit the system prompts (single source of truth)
cursor MAIN_PROMPT.md         # Main agent behavior
cursor IMAGE_PROMPT.md        # Image agent behavior

# 2. Sync changes to workflow
make sync                   # Creates both .json and .json.full versions

# 3. Validate workflow structure
make validate               # Checks for errors before deployment

# 4. Import to N8N
# Import Hotels-Agent-CRISTI.json.full into N8N GUI

# 5. Test in N8N interface
```

### API Limit Management

```bash
# Update API limits interactively
make update-limits

# Set specific limits
make update-limits-to-10    # Set maxItems to 10
make update-charge-to-2.50  # Set charge limits to $2.50
```

### Test Data Management

```bash
# Organize scattered test files
make organize

# Truncate large JSON test files
make truncate FILE=test-data/large-dataset.json LIMIT=5
```

## Image Agent Integration

### Tool Name Consistency

Critical: The Main Agent calls the Image Agent using exact tool name:

```javascript
// ✅ CORRECT tool name in MAIN_PROMPT.md
"Image AI AGENT ANALYZER"

// ❌ WRONG - will break integration
"Tool Call for url images"
"Image Analysis Tool"
```

### Processing Pattern

The Main Agent processes properties sequentially:

```javascript
// Process ONE property at a time (not batch)
for (const property of finalProperties) {
  const images = await callTool("Image AI AGENT ANALYZER", {
    property: property  // Single property object
  });
  // Expect 3 image URLs returned
}
```

### Simplified Image Selection

The Image Agent uses basic selection rules:

- **Booking.com**: Take first 3 images (pre-ordered by quality)
- **Airbnb**: Skip generic captions, prefer descriptive ones
- **No HTTP tools required** - works with URLs and captions directly

## Common Issues and Solutions

### Tool Name Mismatches

**Problem**: Main Agent tool calls don't trigger Image Agent
**Solution**: Ensure exact tool name match in both prompts:

```bash
grep -n "Image AI AGENT ANALYZER" MAIN_PROMPT.md
# Should show 4 occurrences
```

### Parameter Validation Errors

**Problem**: flexibility_window validation fails
**Solution**: Use exact string values, not numbers:

```javascript
// ✅ CORRECT
"flexibility_window": "1"

// ❌ INCORRECT  
"flexibility_window": 1
```

### Workflow Import Issues

**Problem**: N8N import fails with parsing errors
**Solution**: Always validate before import:

```bash
make validate               # Check for JSON syntax errors
```

### Sync Script Issues

**Problem**: Prompt changes not reflected in workflow
**Solution**: Ensure both prompt files exist and run full sync:

```bash
ls -la MAIN_PROMPT.md IMAGE_PROMPT.md  # Verify files exist
make sync                               # Full sync process
```

## Testing and Validation

### Manual Testing Process

1. **Start N8N chat interface** via webhook URL
2. **Input test request**: Destination + dates + preferences  
3. **Monitor execution**: Check logs for scraper tool calls
4. **Verify output**: Exactly 7 properties with 5-2 ratio
5. **Validate links**: URLs should be copied verbatim from sources

### Automated Validation

```bash
make test                   # Run all validation checks
make validate              # Workflow structure validation
node scripts/parameter-tests.js  # Parameter validation tests
```

### Performance Expectations

- **Total execution time**: ~5 minutes for full search
- **Property coverage**: 100+ properties analyzed  
- **Final output**: Exactly 7 curated recommendations
- **Platform distribution**: Strict 5-2 ratio enforcement
- **Image selection**: Maximum 3 images per property

## Deployment Process

### Railway N8N Deployment

```bash
# 1. Prepare for deployment
make deploy                 # Creates backup + syncs + validates

# 2. Import to N8N
# - Upload Hotels-Agent-CRISTI.json.full to N8N GUI
# - Configure API credentials (Apify, Google Gemini, PostgreSQL)
# - Test webhook endpoints

# 3. Validate deployment
# - Test chat interface functionality
# - Verify scraper tool connections  
# - Check AI agent response quality
```

### Required Credentials

Configure in N8N credentials manager:

- `APIFY_API_TOKEN` - For scraper access
- `GOOGLE_GEMINI_API_KEY` - For AI agent functionality
- `POSTGRES_CONNECTION_STRING` - For chat memory persistence

## Memory and Session Management

The project uses Serena MCP for persistent memory across sessions:

- Project context and architectural patterns
- Implementation discoveries and technical learnings
- Session checkpoints for complex development work
- Prompt engineering patterns and optimization techniques

Access memory with:

```bash
# Via Serena MCP tools when needed
read_memory("project_context")
write_memory("session_summary", "development outcomes")
```
