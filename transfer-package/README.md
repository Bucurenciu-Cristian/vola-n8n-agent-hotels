# VolaBot Transfer Package

## 📦 Contents Overview

This transfer package contains **only the essential files** needed to work with the VolaBot N8N workflow project. Everything else in the main project is supporting infrastructure or development artifacts.

### 🚀 Core Files Included

**N8N Workflow Files:**
- `Hotels-Agent-CRISTI.full.json` - **COMPLETE** N8N workflow (import this into N8N)
- `Hotels-Agent-CRISTI.json` - Template version (for git commits)

**AI Agent System Prompts:**
- `MAIN_PROMPT.md` - Main AI agent configuration (Travel Consultant)
- `IMAGE_PROMPT.md` - Image AI agent configuration (Visual Curation)

**Development Tools:**
- `Makefile` - Essential development commands (`make sync`, `make validate`)
- `package.json` - Node.js dependencies and scripts

**Documentation:**
- `transfer.md` - **START HERE** - Complete project handoff guide
- `README.md` - This file

---

## 🎯 Quick Start (NEW DEVELOPER)

1. **Read the transfer guide first**: Open `transfer.md` for complete project overview
2. **Access the live workflow**: Use the URLs in `transfer.md`
3. **Test the system**: Verify chat interface functionality
4. **Make changes**: Edit prompts → run `make sync` → import to N8N

---

## 📁 File Usage Priority

**CRITICAL (Start Here):**
1. `transfer.md` - Project overview and access details
2. `Hotels-Agent-CRISTI.full.json` - Import this into N8N

**DEVELOPMENT:**
3. `MAIN_PROMPT.md` - Edit for main AI agent behavior changes
4. `IMAGE_PROMPT.md` - Edit for image analysis behavior changes
5. `Makefile` - Use `make sync` after prompt changes

**SUPPORTING:**
6. `package.json` - Dependencies (run `npm install` if needed)
7. `Hotels-Agent-CRISTI.json` - Template version (auto-generated)

---

## ⚠️ Critical Rules

- **Never edit JSON files directly** - Edit prompts, then `make sync`
- **Always use .full.json for N8N imports** - Contains complete workflow
- **Test after every change** - Use chat interface to verify functionality
- **Follow prompt-first development** - Prompts are single source of truth

---

**This package contains everything needed for seamless VolaBot project handoff.**