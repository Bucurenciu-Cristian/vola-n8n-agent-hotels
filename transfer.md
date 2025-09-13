# VolaBot N8N Workflow - Project Transfer Guide

## 🎯 Project Overview

**VolaBot** is an AI-powered travel consultant built as an N8N workflow that provides personalized hotel recommendations by scraping 100+ properties from multiple platforms (Booking.com, Airbnb) with dual AI agent analysis.

---

## 📁 Essential Files (CORE - DO NOT IGNORE)

### 🚀 Primary Workflow File
- **`Hotels-Agent-CRISTI.full.json`** - This is the COMPLETE N8N workflow file
  - Import this file into N8N to get the full working system
  - Contains dual AI agents, all integrations, and validation logic

### 🤖 AI Agent System Prompts
- **`MAIN_PROMPT.md`** - Main AI agent system prompt (Travel Consultant)
  - Google Gemini 2.5-flash model configuration
  - Handles user interaction, platform orchestration, parameter extraction
  - Enforces 5-2 platform ratio (5 Booking + 2 Airbnb or vice versa)

- **`IMAGE_PROMPT.md`** - Image AI agent system prompt  
  - Specialized image curation and visual analysis
  - Called by main agent via "Image AI AGENT ANALYZER" tool
  - Processes property images using Google Gemini vision

---

## 🌐 Live Access Points

### Production Workflow (N8N)
- **N8N Workflow URL**: https://primary-production-11988.up.railway.app/workflow/y9jenh0MXes2vec3
- **Status**: Hotels-Agent-CRISTI.full.json is imported 1:1 here

### Client Interface
- **Public Chat Interface**: https://primary-production-11988.up.railway.app/webhook/b419f5d3-82dd-41d3-933d-eca656870ab6/chat
- **Purpose**: End-user hotel recommendation chat interface

### Admin Dashboard
- **Dashboard URL**: https://vola-internal.vercel.app/dashboard
- **Credentials**:
  - Username: `admin`
  - Password: `REDACTED`

---

## 🔧 Critical Scrapers (Apify Actors)

### Primary Data Sources
1. **Booking.com Scraper**: https://apify.com/voyager/booking-scraper
   - Handles hotel property data extraction
   - Requires specific `flexibility_window` parameter ("0", "1", "2", "7" only)

2. **Airbnb Property Scraper**: https://apify.com/tri_angle/airbnb-scraper  
   - Extracts Airbnb listing data
   - Handles alternative accommodation options

3. **Airbnb Reviews Scraper**: https://apify.com/tri_angle/airbnb-reviews-scraper
   - Processes Airbnb review data for property analysis
   - Essential for quality assessment algorithm

---

## ⚙️ Development Workflow

### Core Development Pattern
```bash
# Edit system prompts (NEVER edit JSON directly)
nano MAIN_PROMPT.md        # Main agent behavior
nano IMAGE_PROMPT.md       # Image agent behavior

# Sync changes to workflow
make sync                  # Updates both .json and .full.json versions

# Validate workflow
make validate              # Check for errors before import

# Import to N8N
# Use Hotels-Agent-CRISTI.full.json in N8N GUI
```

### Critical Rules
- **NEVER edit JSON files directly** - Always edit prompts first, then sync
- **Always use .full.json for N8N import** - Contains complete workflow
- **Test after every import** - Verify chat interface functionality

---

## 🏗️ Architecture Overview

### Dual AI Agent System
- **Main Agent**: Travel consultant with witty personality
  - Handles user interaction and platform orchestration
  - Enforces business rules (5-2 platform ratio, quality gates)
  - PostgreSQL chat memory for session persistence

- **Image Agent**: Specialized visual curation  
  - Called via "Image AI AGENT ANALYZER" tool
  - Processes one property at a time for optimal image selection
  - Uses Google Gemini vision for content analysis

### Data Flow
```
User Input → Main Agent → Parameter Validation → 
Multi-Platform Scraping → Image Analysis → 
7 Curated Properties Response (5-2 ratio)
```

### Business Logic
- **Output**: Exactly 7 properties total
- **Platform Ratio**: 5 Booking + 2 Airbnb (or inverse based on quality)
- **Review Analysis**: Up to 500 reviews per property analyzed
- **Quality Gates**: No property shown without review analysis

---

## 🚨 Critical Configuration Notes

### API Parameter Requirements
- **flexibility_window**: MUST be strings "0", "1", "2", or "7" only
- **Date format**: ISO YYYY-MM-DD format required
- **Language**: Hardcoded "ro" for scrapers, but output follows user language

### Required Credentials (N8N Setup)
- **APIFY_API_TOKEN** - For scraper access
- **GOOGLE_GEMINI_API_KEY** - For AI agent functionality  
- **POSTGRES_CONNECTION_STRING** - For chat memory persistence

---

## 🎯 What Matters Most

1. **Hotels-Agent-CRISTI.full.json** is your working workflow - import this into N8N
2. **MAIN_PROMPT.md** and **IMAGE_PROMPT.md** control AI behavior - edit these, never JSON
3. **Always sync after prompt changes** using `make sync`
4. **Test the chat interface** after every change to ensure functionality
5. **The workflow is live and functional** - don't break what's working

---

## 🔄 Quick Start Checklist

- [ ] Access N8N workflow at Railway URL
- [ ] Verify Hotels-Agent-CRISTI.full.json is imported
- [ ] Test chat interface functionality
- [ ] Review MAIN_PROMPT.md and IMAGE_PROMPT.md for AI behavior
- [ ] Understand prompt → sync → validate → import workflow
- [ ] Confirm all Apify scrapers are accessible and functional

**Everything else in the project is supporting infrastructure or noise. Focus on these essentials.**