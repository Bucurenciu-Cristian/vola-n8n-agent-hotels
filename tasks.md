# Project: AI Travel Accommodation Advisor – Completion & Launch

## 1. Project Status

We already have n8n flows and Apify scrapers pulling Booking.com and Airbnb data in real time. Users can search "romantic in Paris, Aug 20‑28, under €200" and the system returns live options. What's left is to wire up Google Maps, cross-check Booking inventory at Ratehawk for cheaper prices, and polish the AI's voice so it feels like a concierge, not a chatbot.

## 2. Objectives (in plain English)

• Finish the data integration by adding Google Maps ratings/amenities and Ratehawk price checks.
• Teach the AI to pick the best images and surface the single strongest choice first.
• Tweak system prompting to optimize responses and TOV

## 3. In‑scope tasks

**Google Maps integration** – someone is building a scraper & integrating it for us; slot its output into the n8n pipeline and map fields to the AI prompt.

**Ratehawk API** – REST integration that, given a Booking hotel ID, returns Ratehawk's net rate and availability. If cheaper, show it.

**AI fine‑tuning** – adjust prompt chain so the summary weighs price, sentiment, amenities, and location photos; cap response at 3 options, plus a "best value" badge.

**QA & tests**

## 4. Deliverables

• Updated n8n workflow file, version‑controlled.
• Google Maps scraper module plugged in and documented.
• Ratehawk connector with env‑based credentials.
• Prompt template v2 with test cases proving improved ranking and tone.
• Image Analysis - AI should choose the best images to show to the user based on their request

## 5. Acceptance criteria

• For any test search, system returns 7 options in under 4 minutes, each with price, review score, one hero image, and "Ratehawk saves X %" where applicable.
• The selection of the hotels is 90% accurate (meaning: no single beds if people ask for romantic stays, if people ask for a gym the AI checks for amenities and only shows hotels with gyms etc.)
