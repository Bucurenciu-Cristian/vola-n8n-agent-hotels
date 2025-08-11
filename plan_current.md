# MAIN_PROMPT.md Optimization Plan - Detailed Strategy

## Current State Analysis
- **File**: MAIN_PROMPT.md 
- **Current Size**: 584 lines
- **Primary Issues**: Significant redundancy, mixed technical/operational content, verbose explanations
- **Target**: ~350-400 lines (40% reduction)
- **Approach**: Preserve all critical functionality while eliminating redundancy

## Executive Summary
The current MAIN_PROMPT.md contains substantial redundancy with the same information repeated across multiple sections. Through systematic analysis, we can achieve a 40% reduction in size while maintaining all critical functionality and improving readability.

## Detailed Redundancy Mapping

### Critical Redundancies Identified:

#### 1. Google Maps Parameters (2 locations)
- **Lines 89-102**: Operational instructions for AI
  ```
  * **`maxReviews`**: Set to 25 for comprehensive review analysis (cost-optimized)
  * **`reviewsSort`**: Set to "newest" for recent feedback
  * **`reviewsOrigin`**: Set to "google" for authentic Google reviews
  ```
- **Lines 463-516**: Technical API implementation details
  ```json
  {
    "searchStringsArray": ["hotels"],
    "locationQuery": "Sibiu",
    "maxCrawledPlacesPerSearch": 2,
    "language": "ro"
  }
  ```
- **Action**: Keep operational (89-102), move technical to `TECHNICAL_REFERENCE.md`
- **Savings**: ~50 lines

#### 2. Language Consistency Rules (3 locations)
- **Lines 7-13**: Critical language consistency rule
  - "You MUST IGNORE the language of the input data and translate everything into the user's detected language"
- **Lines 77-80**: Scraper language parameter explanation  
  - "The scraper tool requires the `language` parameter to be hardcoded to `\"ro\"`"
- **Lines 420-425**: Internal checklist language verification
  - "Confirmed the entire response is in the user's detected language"
- **Action**: Create unified "Language Protocol" section
- **Savings**: ~15 lines

#### 3. Platform Ratio Logic (Multiple locations)
- **Lines 161-169**: Detailed 5-2 algorithm explanation
  - Step-by-step counter system with booking_count/airbnb_count
- **Lines 186-193**: Sourcing and platform mix requirements
  - "The 7 properties must be sourced from a mix of Booking.com and Airbnb. The ratio must be **exactly 5-to-2**"
- **Lines 425**: Internal checklist verification
  - "Confirmed the output contains exactly 7 properties and respects the 5-2 platform mix"
- **Action**: Single comprehensive "5-2 Platform Selection" section
- **Savings**: ~20 lines

#### 4. Image Curation Verbose Section
- **Lines 271-367**: 95 lines for image selection
- **Core Logic**: Match priorities → Apply quality filters → Select max 3 distinct images
- **Verbose Elements**:
  - 6-step algorithm explanation (lines 277-345)
  - Detailed caption intelligence (lines 346-367)
  - Multiple examples and edge cases
- **Action**: Streamline to decision-tree format (~40 lines)
- **Savings**: ~55 lines

#### 5. Review Analysis Overlap
- **Lines 194-202**: Basic review requirements
  - "analyse all available reviews (up to a maximum of ~500)"
  - "Summarise 3‑4 recurring positives and 2 negatives"
- **Lines 248-268**: Google Maps review integration
  - "Review Analysis Algorithm: 1. Sentiment Extraction 2. Recency Weighting 3. Context Matching"
- **Action**: Merge into unified "Review Analysis Protocol"
- **Savings**: ~15 lines

#### 6. Date Handling Duplication
- **Lines 15-29**: Flexibility window logic
  - "IF the dates are Exact: You MUST set the parameter as `flexibility_window = \"0\"`"
- **Lines 70-75**: Date parameters section
  - "If a user provides vague dates, you must ask clarifying questions until you have resolved them into specific ISO date formats"
- **Action**: Consolidate into single "Date Processing" section
- **Savings**: ~10 lines

## 3-Phase Implementation Strategy

### Phase 1: Quick Wins (Target: 470 lines, 20% reduction)
**Timeline**: Immediate implementation
**Risk Level**: LOW

**Immediate Actions:**

1. **Extract Technical Documentation**
   - Move lines 547-582 (Testing protocol) → `TESTING.md`
     - "Test Case 1: Sibiu Search"
     - "Validation Checklist"
     - "Error Handling"
   - Move lines 463-516 (API implementation) → `TECHNICAL_REFERENCE.md`
     - Complete API payload examples
     - Parameter validation details
   - **Savings**: ~70 lines

2. **Consolidate Language Rules**
   - Merge lines 7-13, 77-80, 420-425 into single "Language Protocol"
   - Create clear hierarchy: User language → AI response language → Tool language
   - **Savings**: ~15 lines

3. **Remove Parameter Duplication**
   - Keep operational Google Maps instructions (89-102)
   - Reference technical details in separate doc
   - **Savings**: ~25 lines

4. **Consolidate Date Handling**
   - Merge lines 15-29 and 70-75 into unified "Date Processing Protocol"
   - **Savings**: ~10 lines

**Total Phase 1 Savings**: ~120 lines → **464 lines remaining**

**Testing Requirements**:
- Verify all API calls still work
- Confirm language consistency maintained
- Test date parameter extraction

### Phase 2: Structural Cleanup (Target: 380 lines, 35% reduction)
**Timeline**: After Phase 1 validation
**Risk Level**: MEDIUM

**Content Restructuring:**

1. **Streamline Image Curation (Lines 271-367)**
   - **Current**: 95 lines of verbose explanation
   - **Target**: ~40 lines using decision-tree format
   - **Preserve**: 
     - Caption intelligence for Airbnb
     - Quality filters and user priority matching
     - 3-image maximum rule
   - **New Structure**:
     ```
     Image Selection Protocol:
     1. Decode user intent (feature/experience priorities)
     2. Apply caption-based filtering (Airbnb) / visual assessment (Booking)
     3. Select max 3 distinct, high-quality images
     4. Format as numbered visual story
     ```
   - **Savings**: ~55 lines

2. **Consolidate Review Requirements**
   - Merge basic review rules (194-202) with Google integration (248-268)
   - Create unified "Review Analysis Protocol"
   - **New Structure**:
     ```
     Review Analysis Protocol:
     - Source: Up to 500 reviews per property + Google Maps data
     - Analysis: 3-4 positives, 2 negatives, GDPR compliant
     - Integration: Match Google sentiment, verify amenities
     - Output: "Reviews analysed: <number>" label
     ```
   - **Savings**: ~15 lines

3. **Simplify Platform Selection Algorithm**
   - Consolidate multiple explanations of 5-2 ratio
   - Single comprehensive section with clear examples
   - **New Structure**:
     ```
     5-2 Platform Selection:
     1. Create candidate pools (budget + quality filtered)
     2. Rank unified list by quality + rating
     3. Select top 7 enforcing 5 Booking + 2 Airbnb ratio
     ```
   - **Savings**: ~20 lines

**Total Phase 2 Savings**: ~90 lines → **374 lines remaining**

**Testing Requirements**:
- Validate image selection quality maintained
- Confirm review analysis completeness
- Test platform ratio enforcement

### Phase 3: Content Tightening (Target: 350 lines, 40% reduction)
**Timeline**: After Phase 2 validation  
**Risk Level**: LOW

**Final Optimization:**

1. **Create Decision Trees**
   - Convert remaining verbose explanations to bullet-point decision trees
   - Use cross-references instead of repetition
   - **Target Sections**:
     - Budget filtering table (lines 151-157) → concise decision tree
     - Output skeleton (lines 385-437) → streamlined template
   - **Savings**: ~20 lines

2. **Optimize Helper Functions**
   - Simplify lines 441-462 (helper functions)
   - Reference implementation details in separate doc
   - Keep only essential matching logic
   - **Savings**: ~15 lines

**Total Phase 3 Savings**: ~35 lines → **~350 lines final**

**Testing Requirements**:
- Final functionality verification
- Response quality assessment
- Performance validation

## Proposed New Structure (350-400 lines)

### Section 1: Core Identity & Language Protocol (30 lines)
**Content**:
- VolaBot persona definition
- Unified language consistency rule
- Output formatting requirements

**Key Elements**:
```
# VolaBot – Premium Travel Consultant
Language Protocol: Detect user language → Translate ALL content to user language → Use "ro" for tools only
Output: Clean Markdown, interactive links, no code blocks
```

### Section 2: Conversation Flow (25 lines)
**Content**:
- User interaction pattern
- Mandatory confirmation requirement
- Date processing protocol

**Key Elements**:
```
Flow: Gather essentials → Confirm search → Execute (5 min) → Deliver results
Confirmation: NEVER start search before explicit user consent
Dates: Exact dates (flexibility_window="0") vs Vague dates (flexibility_window="3")
```

### Section 3: Multi-Platform Search Parameters (40 lines)
**Content**:
- Consolidated parameter specifications for all platforms
- Location synchronization rules
- Currency and guest handling

**Key Elements**:
```
Simultaneous Tools: Booking + Airbnb + Google Maps
Location Sync: IDENTICAL string across all platforms ("Sibiu" not "Sibiu, Romania")
Parameters: checkIn/checkOut (ISO), adults/children/rooms, currency, budget
```

### Section 4: 5-2 Platform Selection Algorithm (35 lines)
**Content**:
- Clear candidate pool creation
- Unified ranking system
- Platform ratio enforcement logic

**Key Elements**:
```
Algorithm: Create pools → Apply budget filters → Rank unified → Select 7 (5+2 ratio)
Budget Filters: ≥150 RON (4★+), 100-149 (3.8★+), 50-99 (3.5★+), <50 (3.0★+)
Ratio: EXACTLY 5 from one platform, 2 from other
```

### Section 5: Content Analysis Protocol (45 lines)
**Content**:
- Review analysis requirements
- Google Maps integration and matching
- GDPR compliance rules

**Key Elements**:
```
Reviews: Up to 500 per property, 3-4 positives, 2 negatives, sample size label
Google Integration: Match by hotelAds URLs or name similarity (80%+), verify amenities
GDPR: Use textTranslated only, NEVER names/URLs/personal data
```

### Section 6: Output Guidelines (40 lines)
**Content**:
- Streamlined image curation algorithm
- Link integrity rules
- Output template structure

**Key Elements**:
```
Images: Max 3, caption-intelligent selection, distinct subjects, quality filters
Links: Verbatim URLs from source JSON, properly formatted Markdown
Template: Hotel Name • Rating • Platform • Google verification • Images • Details
```

### Section 7: Quality Assurance (35 lines)
**Content**:
- Internal validation checklist
- Critical requirements verification
- Error handling guidelines

**Key Elements**:
```
Checklist: Language consistency, 7 properties (5-2 ratio), link integrity, GDPR compliance
Validation: Google match ≥50%, review data ≥70%, image quality maintained
Errors: Location mismatch → check identical strings, timeout → extend limits
```

### Section 8: Quick Reference (25 lines)
**Content**:
- Essential parameters summary
- Common validation rules
- Emergency troubleshooting

**Key Elements**:
```
Critical Parameters: flexibility_window ("0"/"3"), language ("ro"), locationQuery (identical)
Must Preserve: 5-2 ratio, language translation, Google integration, image curation
Emergency: Backup to single platform if multi-platform fails
```

## Supporting Documentation Strategy

### TECHNICAL_REFERENCE.md (~200 lines)
**Purpose**: Implementation details separated from AI instructions

**Content**:
- Complete API payload examples with all parameters
- Helper function implementations and similarity algorithms
- Parameter validation details and error codes
- Performance optimization settings and timeout configurations
- Google Maps API technical specifications

**Benefits**:
- Reduces main prompt bloat
- Easier maintenance of technical details
- Clear separation of concerns

### TESTING.md (~50 lines)
**Purpose**: Quality assurance and validation procedures

**Content**:
- Comprehensive test cases (Sibiu, Cluj examples)
- Validation protocols and success criteria
- Error handling procedures and troubleshooting
- Quality assurance checklists and metrics

**Benefits**:
- Systematic testing approach
- Separate QA concerns from AI instructions
- Repeatable validation process

### EXAMPLES.md (~100 lines)
**Purpose**: Usage examples and best practices

**Content**:
- Sample user interactions and edge cases
- Output format examples and templates
- Best practice demonstrations
- Common scenario walkthroughs

**Benefits**:
- Training resource without bloating main prompt
- Reference material for edge cases
- Documentation for future updates

## Implementation Safety Measures

### Pre-Implementation Checklist:
- [ ] **Backup Current Version**: Create timestamped backup of MAIN_PROMPT.md
- [ ] **Test Environment Setup**: Prepare isolated testing environment
- [ ] **Success Metrics Defined**: Establish measurable quality benchmarks
- [ ] **Rollback Plan Ready**: Document rollback procedure if issues arise

### Testing Protocol for Each Phase:

#### Phase 1 Testing:
1. **Parameter Extraction**: Verify date, location, budget extraction accuracy
2. **API Calls**: Confirm all three scrapers (Booking, Airbnb, Google) execute
3. **Language Consistency**: Test response language matches user language
4. **Basic Functionality**: End-to-end workflow completion

#### Phase 2 Testing:
1. **Image Selection**: Verify caption intelligence and quality filters work
2. **Review Analysis**: Confirm 3-4 positives, 2 negatives structure maintained
3. **Platform Ratio**: Test 5-2 ratio enforcement with various scenarios
4. **Google Integration**: Validate property matching and amenity verification

#### Phase 3 Testing:
1. **Response Quality**: Compare output quality vs. original
2. **Decision Trees**: Verify simplified logic produces same results  
3. **Cross-References**: Confirm all references resolve correctly
4. **Performance**: Measure response time and accuracy

### Critical Preservation Checklist:

#### Core Functionality (Non-negotiable):
- ✅ **VolaBot Personality**: Sophisticated, witty travel consultant voice
- ✅ **5-2 Platform Ratio**: Exactly 5+2 distribution, never violated
- ✅ **Google Maps Integration**: Verification badges, amenity checking, rating validation
- ✅ **Language Consistency**: Everything translated to user's language
- ✅ **Image Curation**: Caption intelligence for Airbnb, quality filtering
- ✅ **Review Analysis**: GDPR compliant, comprehensive sentiment analysis
- ✅ **Confirmation Requirement**: No search without explicit user permission
- ✅ **Link Integrity**: Verbatim URL copying, no modifications

#### Quality Standards:
- **Response Completeness**: 7 properties (unless <7 available)
- **Review Coverage**: No property without review analysis
- **Image Quality**: High-quality, distinct, user-priority aligned
- **Writing Style**: Professional, engaging, informative
- **Technical Accuracy**: Correct parameter extraction and API calls

#### Performance Benchmarks:
- **Search Time**: <5 minutes for complete multi-platform search
- **Google Match Rate**: ≥50% of properties should have Google verification
- **Review Completeness**: ≥70% of properties should have detailed review insights
- **GDPR Compliance**: 100% - zero tolerance for personal data exposure

### Risk Mitigation Strategies:

#### High-Risk Areas:
1. **Image Curation Algorithm**: Complex caption intelligence logic
   - **Mitigation**: Preserve core matching keywords, test with multiple properties
   
2. **Google Maps Integration**: Property matching logic
   - **Mitigation**: Maintain fuzzy matching thresholds, test URL-based matching

3. **Platform Ratio Enforcement**: Complex counter-based selection
   - **Mitigation**: Validate with edge cases (all properties from one platform)

#### Medium-Risk Areas:
1. **Review Analysis Consolidation**: Merging two different approaches
   - **Mitigation**: Test sentiment analysis accuracy, verify GDPR compliance

2. **Language Protocol Unification**: Multiple rules in one section
   - **Mitigation**: Test with non-English users, verify translation consistency

### Success Metrics and KPIs:

#### Quantitative Metrics:
- **Size Reduction**: 40% reduction achieved (584 → 350 lines)
- **Functionality Preservation**: 100% of current features maintained
- **Response Time**: ≤5 minutes for complete search
- **Accuracy Rate**: ≥95% parameter extraction accuracy
- **Google Integration**: ≥50% properties with verification badges

#### Qualitative Metrics:
- **Readability**: Improved navigation and clarity
- **Maintainability**: Easier to update and modify
- **Consistency**: Reduced contradictions and redundancy
- **Professional Quality**: Maintained sophisticated writing style

#### User Experience Metrics:
- **Response Quality**: No degradation in recommendation quality
- **Information Completeness**: All essential details preserved
- **Visual Appeal**: Image quality and relevance maintained
- **Link Functionality**: All booking links work correctly

## Timeline and Milestones

### Week 1: Phase 1 Implementation
- **Days 1-2**: Extract technical documentation
- **Days 3-4**: Consolidate language and parameter sections
- **Days 5-7**: Testing and validation

### Week 2: Phase 2 Implementation  
- **Days 1-3**: Streamline image curation and review analysis
- **Days 4-5**: Consolidate platform selection algorithm
- **Days 6-7**: Testing and validation

### Week 3: Phase 3 Implementation
- **Days 1-2**: Create decision trees and optimize content
- **Days 3-4**: Final optimization and cross-referencing
- **Days 5-7**: Comprehensive testing and quality assurance

### Week 4: Validation and Launch
- **Days 1-3**: End-to-end testing with real scenarios
- **Days 4-5**: Performance benchmarking and fine-tuning
- **Days 6-7**: Documentation completion and deployment

## Post-Implementation Monitoring

### 30-Day Monitoring Plan:
- **Daily**: Response quality checks and error monitoring
- **Weekly**: Performance metrics and user feedback analysis  
- **Monthly**: Comprehensive review and optimization opportunities

### Key Performance Indicators:
- Search completion rate (target: >95%)
- Google Maps integration success (target: >50%)
- User satisfaction with recommendations (qualitative feedback)
- Technical error rate (target: <2%)

### Continuous Improvement:
- Monthly review of optimization opportunities
- Quarterly assessment of new feature integration needs
- Semi-annual comprehensive prompt audit and refresh

---

## Next Steps:
1. ✅ **Review and approve this detailed plan**
2. 🔄 **Create backups of current files** 
3. 📋 **Set up testing environment**
4. 🚀 **Begin Phase 1 implementation**
5. ✅ **Test and validate changes**
6. 📈 **Monitor performance and iterate**

---

*Document Version*: 1.0  
*Created*: 2025-01-08  
*Last Updated*: 2025-01-08  
*Status*: Ready for Implementation