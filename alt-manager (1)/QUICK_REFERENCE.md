# 🚀 ALT Manager - Quick Reference Guide

## One-Command Setup

```powershell
# 1. Setup analytics tables
.\setup-analytics.ps1

# 2. Start everything
npm run dev

# 3. Test endpoints
.\test-analytics.ps1
```

---

## 📍 New URLs

| Feature | URL | Description |
|---------|-----|-------------|
| **Analytics Dashboard** | http://localhost:5173/analytics | Full analytics with trends, blindspots, progress |
| **Minutes of Meeting** | http://localhost:5173/moms | View all MoMs with detail view |
| **Chat** | http://localhost:5173/chat | Generate conversations for MoMs |

---

## 🔌 New API Endpoints

### MoM Endpoints
```bash
# Generate MoM from conversation
POST /api/analysis/mom
Body: { transcript: "...", date: "DD-MM-YYYY" }

# Get all MoMs
GET /api/analysis/moms?limit=50&offset=0

# Get single MoM
GET /api/analysis/moms/:id
```

### Analysis Endpoints
```bash
# Generate trend analysis
POST /api/analysis/trends
Body: { momIds: [1,2,3] }  # Optional, uses all if empty

# Generate blindspot analysis
POST /api/analysis/blindspots
Body: { momIds: [1,2,3] }

# Generate progress analysis
POST /api/analysis/progress
Body: { momIds: [1,2,3] }

# Get analytics dashboard
GET /api/analysis/dashboard
```

### Get Latest Analysis
```bash
GET /api/analysis/trends/latest
GET /api/analysis/blindspots/latest
GET /api/analysis/progress/latest
```

---

## 🧪 Quick Test with cURL

```powershell
# 1. Login
$response = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/auth/login" `
  -ContentType "application/json" `
  -Body '{"email":"test@example.com","password":"test123"}'
$token = $response.token

# 2. Generate MoM
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/analysis/mom" `
  -Headers @{Authorization="Bearer $token"} `
  -ContentType "application/json" `
  -Body '{"transcript":"User: I need help with time management. Manager: Let us discuss strategies...","date":"14-10-2025"}'

# 3. Get Dashboard
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/api/analysis/dashboard" `
  -Headers @{Authorization="Bearer $token"}
```

---

## 📊 MoM Structure (7 Fields)

```json
{
  "title": "Time Management Discussion | 14-10-2025",
  "summary": "Three sentences summarizing the conversation.",
  "developmentAreas": ["Time Management", "Prioritization"],
  "emotionalTone": "frustrated → hopeful",
  "actionItems": [
    "Block 2-hour focus time daily",
    "Audit meetings this week",
    "Communicate focus hours to team"
  ],
  "insights": [
    "User hasn't considered time-blocking before",
    "Aha moment: treating focus time as meetings",
    "Key question: How to say no to meetings?"
  ],
  "blindspots": [
    "Not recognizing need for boundaries",
    "Assuming all meetings are mandatory"
  ]
}
```

---

## 🎯 Progress Indicators

| Icon | Meaning | Description |
|------|---------|-------------|
| 🟢 | Clear Progress | Visible improvement, momentum building |
| 🟡 | Incremental Movement | Some progress, needs more focus |
| 🔴 | Stuck/Regressing | No visible change or declining |

---

## 🗂️ Database Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `mom_records` | Store MoMs | title, summary, action_items, insights, blindspots |
| `trend_analysis` | Track patterns | primary_development_areas, emotional_trajectory |
| `blindspot_analysis` | Deep insights | recurring_blindspots, growth_blockers |
| `progress_analysis` | Measure growth | key_themes, progress_scores, overall_trajectory |

---

## 🔐 Authentication

All `/api/analysis/*` endpoints require JWT token:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

Get token from `/api/auth/login` or `/api/auth/register`

---

## 🎨 UI Components

### Analytics Dashboard
- **3 Tabs:** Progress, Trends, Blindspots
- **Stats Cards:** Session count, analysis status
- **Generate Buttons:** Create new analysis
- **Download PDF:** Export reports (placeholder)

### MoM Page
- **Left Sidebar:** List of all MoMs
- **Main Panel:** Full MoM detail with color-coded sections
- **Filters:** By date, development area (coming soon)

---

## 🐛 Troubleshooting

### "No MoMs found for analysis"
**Solution:** Generate at least 1 MoM first via `POST /api/analysis/mom`

### "Failed to generate MoM"
**Check:**
1. GEMINI_API_KEY is set in `.env`
2. Transcript is not empty
3. API key has quota remaining

### "Database connection failed"
**Check:**
1. DATABASE_URL in `.env` is correct
2. PostgreSQL is running
3. Tables created via `setup-analytics.ps1`

### TypeScript errors in IDE
**Solution:** Run `npm install` in both client and server directories

---

## 📦 Dependencies

### Backend
- `@google/generative-ai` - Gemini AI integration
- `drizzle-orm` - Type-safe database queries
- `express` - REST API framework
- `jsonwebtoken` - JWT authentication

### Frontend
- `react` + `react-router-dom` - UI framework
- `framer-motion` - Animations
- `axios` - HTTP client
- `lucide-react` - Icons
- `tailwindcss` - Styling

---

## 🚀 Deployment Checklist

- [ ] Set production `DATABASE_URL`
- [ ] Set production `GEMINI_API_KEY`
- [ ] Set strong `JWT_SECRET` (min 32 chars)
- [ ] Run `setup-analytics.ps1` on production DB
- [ ] Set `NODE_ENV=production`
- [ ] Configure `CORS_ORIGIN` for frontend domain
- [ ] Run `npm run build` for both client and server
- [ ] Test all endpoints in production
- [ ] Monitor API rate limits (Gemini)
- [ ] Setup error logging (Sentry, etc.)

---

## 📞 Quick Links

- **Full Documentation:** `ANALYTICS_UPGRADE_SUMMARY.md`
- **API Docs:** `API_DOCUMENTATION.md`
- **Setup Guide:** `SETUP_GUIDE.md`
- **Troubleshooting:** `TROUBLESHOOTING.md`

---

**Last Updated:** October 2025  
**Version:** 2.0.0 (Analytics Upgrade)
