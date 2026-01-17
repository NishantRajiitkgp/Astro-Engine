# ✨ Astro Engine

<div align="center">

![Astro Engine Banner](https://img.shields.io/badge/Astro-Engine-8b5cf6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+PHBhdGggZD0ibTkuMDkgOS0uMSA0LjI0SDkuMWE0IDQgMCAxIDEgNS45MS0uNzNtLTQuNzIgM2gxLjUiLz48L3N2Zz4=)

**Professional Astrological Prediction Engine**

Generate personalized 12-month forecasts with detailed narrative reports

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-Educational-yellow?style=flat-square)](LICENSE)

[Live Demo](#demo) • [Features](#-features) • [Installation](#-installation) • [How It Works](#-how-it-works) • [API](#-api-reference)

</div>

---

## 🎥 Demo

<div align="center">

### Quick Overview Report
| Input Form | Prediction Results |
|:----------:|:------------------:|
| Enter birth details | See your cosmic blueprint |

### Detailed Narrative Report (20+ Pages)
| Introduction | Monthly Forecasts |
|:------------:|:-----------------:|
| Personalized analysis | Expandable sections |

</div>

---

## 🌟 Features

### 📊 Quick Overview Report
- ☀️ **Sun, Moon & Rising Signs** - Your core astrological identity
- 📅 **12-Month Grid** - Expandable cards with ratings
- ⭐ **Best Months** - Optimal timing for each life area
- 🎯 **4 Life Areas** - Relationships, Financial, Health, Career

### 📖 Detailed Narrative Report
- 📜 **Introduction** - Personalized to your Venus/Jupiter/Mars/Saturn
- 💫 **Lifetime Analysis** - Deep paragraphs about your natal patterns  
- 📆 **Monthly Forecasts** - Each month includes:
  - Monthly Overview (3+ paragraphs)
  - Key Planetary Movements
  - Opportunities & Challenges
  - Personalized Guidance
- 🖨️ **PDF Export** - Print-friendly layout

### 💕 Four Life Areas

| Area | Key Planets | Houses |
|------|-------------|--------|
| 💕 Relationships | Venus, Mars | 5th, 7th |
| 💰 Financial | Jupiter, Saturn | 2nd, 8th |
| 💪 Health | Mars, Sun | 1st, 6th |
| 💼 Career | Saturn, Jupiter | 6th, 10th |

---

## 🚀 Installation

### Prerequisites
- Node.js 18 or higher
- npm package manager

### Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/astro-engine.git

# Navigate to project
cd astro-engine

# Install dependencies
npm install

# Start the server
npm start
```

Open **http://localhost:3000** in your browser 🎉

---

## 🔧 How It Works

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Birth Data     │ ──▶ │  Astronomical    │ ──▶ │  Interpretation  │
│   (Form Input)   │     │  Calculations    │     │    Engine        │
└──────────────────┘     └──────────────────┘     └──────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
    • Name                  • Julian Day             • 50K+ words
    • Birth Date            • Planetary Pos          • Transit meanings
    • Birth Time            • House Cusps            • Aspect analysis
    • Location              • Aspect Detection       • Monthly guidance
```

### Calculation Pipeline

1. **Geocoding** - Birth place → Latitude/Longitude (OpenStreetMap)
2. **Julian Day** - Date/Time → Julian Day Number
3. **Planetary Positions** - Keplerian orbital elements + VSOP87
4. **House System** - Placidus approximation
5. **Aspect Detection** - Conjunctions, trines, squares, etc.
6. **Transit Analysis** - 12-month planetary movements
7. **Interpretation** - Match transits to interpretation database

---

## 📡 API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/predict` | Quick 12-month overview |
| `POST` | `/api/detailed-report` | Full narrative report |
| `POST` | `/api/chart` | Birth chart calculation only |
| `GET` | `/api/geocode/:place` | Location lookup |
| `GET` | `/api/health` | Server health check |

### Example Request

```bash
curl -X POST http://localhost:3000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "place": "New York, USA",
    "year": 1990,
    "month": 6,
    "day": 15,
    "hour": 10,
    "minute": 30,
    "timezone": -5
  }'
```

### Example Response

```json
{
  "birthData": { "name": "John Doe", ... },
  "natalChart": {
    "sunSign": "Gemini",
    "moonSign": "Scorpio",
    "risingSign": "Leo",
    "planets": { ... },
    "houses": { ... }
  },
  "monthlyPredictions": [
    {
      "relationships": { "month": "January", "rating": 4, "theme": "..." },
      "financial": { ... },
      "health": { ... },
      "career": { ... }
    }
  ],
  "summary": {
    "bestMonths": { "relationships": "March", ... },
    "overallOutlook": "..."
  }
}
```

---

## 📁 Project Structure

```
astro-engine/
├── 📄 package.json
├── 📄 README.md
├── 📄 .gitignore
├── 📂 src/
│   ├── server.js                    # Express API server
│   ├── ephemeris.js                 # Astronomical calculations
│   ├── birthChart.js                # Natal chart computation
│   ├── transits.js                  # Transit calculations
│   ├── predictionEngine.js          # Quick report generator
│   ├── detailedReportGenerator.js   # Narrative report generator
│   ├── interpretations.json         # Basic interpretations
│   ├── 📂 predictions/
│   │   ├── relationships.js
│   │   ├── financial.js
│   │   ├── health.js
│   │   └── career.js
│   └── 📂 detailed-interpretations/
│       ├── relationships-texts.json  # 15K+ words
│       ├── financial-texts.json      # 12K+ words
│       ├── health-texts.json         # 12K+ words
│       └── career-texts.json         # 12K+ words
└── 📂 public/
    ├── index.html                    # Main form page
    ├── styles.css                    # Premium dark theme
    ├── app.js                        # Main page logic
    ├── report.html                   # Detailed report page
    ├── report-styles.css             # Magazine-style layout
    └── report.js                     # Report page logic
```

---

## 🎯 Accuracy & Disclaimer

### ⚠️ Important Note

This application uses **simplified astronomical algorithms** for educational purposes.

| Aspect | Professional Tools | Astro Engine |
|--------|-------------------|--------------|
| Sun Position | Sub-arcsecond | ~0.5° variance |
| Moon Position | Sub-arcsecond | ~1-2° variance |
| House Cusps | Precise Placidus | Approximation |

### Use Cases

✅ **Good for**: Learning, entertainment, general guidance, timing awareness

❌ **Not for**: Professional practice, precise predictions, critical decisions

### Legal Disclaimer

> This application is for **entertainment and educational purposes only**. Astrological predictions should not be used as the basis for important life decisions. Always consult qualified professionals for medical, financial, legal, or other important matters.

---

## 🚀 Deployment

### Deploy to Render (Recommended)

1. Push to GitHub
2. Connect to [render.com](https://render.com)
3. Create Web Service
4. Configure:
   - **Build**: `npm install`
   - **Start**: `npm start`
   - **Environment**: Node

### Deploy to Railway

```bash
railway login
railway init
railway up
```

### Environment Variables

No environment variables required for basic operation.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Frontend**: Vanilla HTML/CSS/JS
- **Styling**: Glassmorphism dark theme
- **Fonts**: Google Fonts (Outfit, Playfair Display)
- **Geocoding**: OpenStreetMap Nominatim
- **Calculations**: Pure JavaScript (VSOP87, ELP2000)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is for **educational purposes only**. 

The astronomical algorithms are based on published scientific methods. The interpretation texts are original content.

---

## 🙏 Credits

- **Astronomical Algorithms**: Jean Meeus
- **Orbital Elements**: NASA JPL / VSOP87
- **Design Inspiration**: Astro.com (Astrodienst)
- **Fonts**: Google Fonts

---

<div align="center">

**Built with ✨ for cosmic exploration**

[⬆ Back to Top](#-astro-engine)

</div>
