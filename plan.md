# Image Analysis Feature - Implementation Plan

## 🎯 **Objective**
Create a dedicated image analysis workflow that processes property images from the main Hotels-Agent-CRISTI workflow, selecting the top 3 most compelling images for each of the 7 curated properties based on user preferences.

## 📊 **Current State Assessment**
- ✅ Separate workflow structure exists in `z_images_feature/`
- ✅ Sophisticated prompt with caption scoring algorithm (0-4 scale)
- ✅ Test data structure defined
- ⚠️ Tool integration partially configured but needs completion
- ⚠️ Data transformation layer missing
- ⚠️ Response handling not implemented

## 🏗️ **Architecture Design**

### **Microservice Pattern**
```
Main Workflow (Hotels-Agent-CRISTI)
    ↓ [After 7 properties selected]
Tool Call → Image Analysis Workflow
    ↓ [Process each property]
AI Agent (Gemini 2.5) → Caption Analysis
    ↓ [Return curated images]
Response → Main Workflow Integration
```

## 📋 **Implementation Plan**

### **Phase 1: Workflow Configuration** (45 min)
1. **Update Hotels-Image-Analyzer.json**
   - Convert from webhook to tool-callable workflow
   - Add workflow metadata and proper ID
   - Configure input/output schemas

2. **Configure Main Workflow Tool Node**
   - Update toolWorkflow node with correct workflow ID
   - Define parameter mappings
   - Set up error handling

3. **Create Data Transformation Node**
   - Extract property data from scrapers
   - Format for image analyzer input
   - Handle both Booking.com and Airbnb structures

### **Phase 2: Data Contract Implementation** (30 min)
1. **Define Input Schema**
   ```json
   {
     "properties": [
       {
         "id": "unique_identifier",
         "name": "Property Name",
         "platform": "booking|airbnb",
         "images": [
           {"url": "...", "caption": "..."}
         ],
         "amenities": [],
         "rating": 8.5
       }
     ],
     "userPreferences": {
       "tripType": "romantic|family|business",
       "preferredAmenities": [],
       "budget": "luxury|moderate|budget"
     }
   }
   ```

2. **Define Output Schema**
   ```json
   {
     "curatedImages": [
       {
         "propertyId": "...",
         "images": ["url1", "url2", "url3"],
         "reasons": ["Hook", "Reality", "Bonus"]
       }
     ]
   }
   ```

### **Phase 3: Image Analysis Enhancement** (60 min)
1. **Refine Caption Scoring Algorithm**
   - Implement language detection for captions
   - Add pattern matching for Romanian/English terms
   - Create fallback strategies for missing captions

2. **User Preference Mapping**
   - Romantic: views, terraces, sunsets
   - Family: space, kitchen, activities
   - Business: workspace, location, connectivity
   - Luxury: pools, spas, premium finishes

3. **Quality Control Rules**
   - Skip SCORE 0 images (generic/useless)
   - Ensure image diversity (no duplicates)
   - Validate URL accessibility
   - Handle missing images gracefully

### **Phase 4: Integration Layer** (45 min)
1. **Main Workflow Updates**
   - Add image analysis tool call after property selection
   - Create response handler node
   - Integrate curated images into final output

2. **Error Handling Strategy**
   - Timeout handling (max 10s per property)
   - Fallback to original images if analysis fails
   - Logging for debugging

3. **Performance Optimization**
   - Batch processing for 7 properties
   - Implement caching for repeated properties
   - Optimize image array processing

### **Phase 5: Testing & Validation** (30 min)
1. **Test Scenarios**
   - Romantic getaway to Sibiu
   - Family trip to Bucharest
   - Business travel to Cluj
   - Budget accommodation search
   - Luxury resort selection

2. **Edge Cases**
   - Properties with <3 images
   - Missing captions
   - Mixed language captions
   - Network failures
   - Timeout scenarios

3. **Validation Criteria**
   - Each property gets 1-3 images
   - Images match user preferences
   - No duplicate images
   - Response time <15 seconds
   - Graceful degradation

### **Phase 6: Production Deployment** (15 min)
1. **Activation Steps**
   - Deploy image analyzer workflow
   - Update main workflow with tool reference
   - Configure credentials
   - Set environment variables

2. **Monitoring Setup**
   - Log analysis performance
   - Track error rates
   - Monitor response times
   - User feedback collection

## 🔧 **Technical Specifications**

### **Node Configurations**
1. **toolWorkflow Node** (Main Workflow)
   ```javascript
   {
     "workflowId": "DrlxA5AGJvnclCTG",
     "parameters": {
       "properties": "={{ $json.selectedProperties }}",
       "userPreferences": "={{ $json.userContext }}"
     }
   }
   ```

2. **AI Agent Configuration** (Image Analyzer)
   - Model: Google Gemini 2.5-flash
   - Temperature: 0.3 (consistent selection)
   - Max tokens: 2000
   - Response format: JSON

### **Performance Requirements**
- Max 2 seconds per property analysis
- Total processing <15 seconds for 7 properties
- Memory usage <512MB
- Error rate <5%

## 📝 **File Structure**
```
vola-n8n-agent-hotels/
├── Hotels-Agent-CRISTI.json (UPDATE)
├── z_images_feature/
│   ├── Hotels-Image-Analyzer.json (UPDATE)
│   ├── IMAGE_PROMPT.md (REFINE)
│   ├── test-image-analyzer.json (EXPAND)
│   └── integration-tests.json (CREATE)
└── plan.md (THIS FILE)
```

## ✅ **Success Criteria**
- ✓ All 7 properties have curated images
- ✓ Images match user preferences
- ✓ Response time under 15 seconds
- ✓ Graceful error handling
- ✓ Maintains VolaBot personality
- ✓ Seamless integration with main workflow

## 🚀 **Next Steps**
1. Review and approve this plan
2. Start with Phase 1: Workflow Configuration
3. Test each phase before proceeding
4. Document any deviations or improvements
5. Deploy to production after full validation

---
**Estimated Total Time**: 3.5 hours
**Priority**: High
**Risk Level**: Medium (existing foundation reduces risk)