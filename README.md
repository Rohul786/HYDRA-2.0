<p align="center">
  <img src="public/logo.png" width="160" height="160" alt="HYDRA 2.0 Logo" style="border-radius: 50%; box-shadow: 0 10px 25px rgba(0,0,0,0.15);" />
</p>

<h1 align="center">HYDRA 2.0</h1>
<p align="center">
  <strong>Hydrological Intelligence & Disaster Response Analytics</strong><br>
  <em>High-Resolution Urban Flood Nowcasting & Drainage Hydraulic Network Intelligence (0–3 Hour Lead Time)</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3.4-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Leaflet-GIS-green?style=for-the-badge&logo=leaflet" alt="Leaflet" />
  <img src="https://img.shields.io/badge/Turbopack-Enabled-0070F3?style=for-the-badge&logo=turbopack" alt="Turbopack" />
  <img src="https://img.shields.io/badge/Smart%20India%20Hackathon-Urban%20Flooding-orange?style=for-the-badge" alt="SIH" />
</p>

---

## 🌊 The Problem

Urban flooding in major Indian metros like **Mumbai, Delhi, and Chennai** has become an annual recurring catastrophe. Traditional Numerical Weather Prediction (NWP) models fall critically short: **knowing how much rain will fall in a district does not translate into knowing which specific streets or intersections will submerge**.

Urban inundation is a **hyper-local phenomenon** governed by:
1. **Micro-topography & Natural Depressions**: Subways, railway underpasses, and river embankments acting as catchment bowls.
2. **Concrete Imperviousness**: Rapid overland runoff ($C \ge 0.90$) across paved urban surfaces preventing natural ground infiltration.
3. **Invisible & Strained Underground Drainage Networks**: Sub-surface stormwater pipe chokes and coastal tidal flap gates where overcapacity causes pressurized **backflow surcharge** onto roads.

Without street-level, 0–3 hour forward-looking predictive intelligence, municipal authorities and citizens are caught off guard—triggering severe gridlocks, stalled vehicles, economic loss, and loss of life.

---

## ⚡ The Solution: Coupled Physics-Informed ML Framework

**HYDRA 2.0** moves away from isolated meteorological models. It couples real-time Doppler radar nowcasting with high-resolution Digital Elevation Models (DEM) and a directed graph representation of the city's stormwater drainage network:

```
[ Doppler Weather Radar (DWR) ]
      │ (Z-R Marshall-Palmer: Z = 200 * R^1.6)
      ▼
[ 2D Surface Runoff (Manning's Eq.) ] ───► [ Micro-Topography DEM (Slope & Elevation) ]
      │                                                │
      ▼                                                ▼
[ Underground Drainage Graph G=(V,E) ] ───► [ Surcharge Backflow (L/s) ]
      │ (Saint-Venant / Pipe Capacity)                 │
      └──────────────────────┬─────────────────────────┘
                             ▼
     [ Coupled Physics-Informed ML Inundation Surrogate ]
                             ▼
     [ Street Water Depth (cm) & 0-3h Flood-Safe Routing ]
```

---

## 🚀 Key Capabilities

### 1. 📡 Live Doppler Radar Precipitation Nowcasting
- Dynamically ingest or simulate Doppler Weather Radar rainfall rates ($0 - 120\text{ mm/hr}$).
- Converts Doppler radar reflectivity ($Z$ in dBZ) to instantaneous precipitation via the **Marshall-Palmer relationship**:
  $$Z = 200 \cdot R^{1.6} \implies R = \left(\frac{10^{\text{dBZ}/10}}{200}\right)^{\frac{1}{1.6}}$$
- Forward-looking predictive horizons: **0h (Nowcast)**, **+1h**, **+2h**, and **+3h**.
- One-click presets: *Cloudburst ($80\text{ mm/hr}$)*, *Heavy Monsoon ($45\text{ mm/hr}$)*, and *Clear ($0\text{ mm/hr}$)*.

### 2. 🚰 Directed Graph-Based Drainage Network ($G = (V, E)$)
- **Nodes ($V$)**: Stormwater inlets, manholes, junction sumps, pumping stations, and tidal outfalls.
  - Computes ground elevation, invert elevation, design intake capacity ($Q_{\text{cap}}$ L/s), current inflow ($Q_{\text{in}}$ L/s), and **surcharge backflow** ($Q_{\text{backflow}}$ L/s) when pipe capacity is exceeded.
- **Edges ($E$)**: Underground stormwater conduits, box culverts, and open canals.
  - Evaluates hydraulic capacity, slope velocity, and real-time pipe choking ($Q_{\text{flow}} \ge Q_{\text{cap}}$).
- **Coastal Tidal Surcharge**: Simulates tidal backwater resistance at coastal outfalls during High Tide (Mahim Creek in Mumbai, Adyar River Estuary in Chennai).

### 3. 🧠 Coupled Physics-Informed ML Inundation Engine
- Evaluates 2D micro-catchment runoff volume:
  $$Q_{\text{runoff}} = \frac{C \cdot I \cdot A}{0.36}$$
- Combines surface runoff accumulation with drainage surcharge backflow and depression trapping to predict:
  - **Street-Level Water Depth (cm)**: Precise water height (e.g., $15\text{ cm}$, $45\text{ cm}$, $90\text{ cm}$).
  - **Inundation Risk Classification**:
    - 🟢 **Safe** ($< 10\text{ cm}$ — Passable for all transit)
    - 🟡 **Warning** ($10 - 25\text{ cm}$ — Curb waterlogging; caution for sedans & two-wheelers)
    - 🔴 **Critical** ($> 25\text{ cm}$ — Engine stall hazard; road impassable)
  - **Flow Velocity ($m/s$)** and **Time-to-Peak Inundation (mins)**.
  - **ML Feature Attribution**: Visual breakdown of prediction drivers (Precipitation, Drainage Surcharge, DEM Elevation, Imperviousness).

### 4. 🏙️ Multi-Metro Basins for Major Indian Metros
Pre-calibrated high-resolution spatial datasets for critical flood-prone corridors:
- **Mumbai (Mithi River & BKC Basin)**:
  - *Hotspots*: BKC Road (Diamond Bourse), LBS Marg Kurla, Western Express Flyover, Milan Subway, Mahim Creek Outfall.
- **Delhi (Minto Bridge & Central Yamuna Basin)**:
  - *Hotspots*: Minto Road Railway Underpass, Deen Dayal Upadhyaya Marg, ITO Junction, Connaught Outer Circle.
- **Chennai (Velachery & Adyar River Basin)**:
  - *Hotspots*: Velachery Main Road, Madipakkam Lake Link, 100 Feet Bypass Corridor, Adyar River Estuary.

### 5. 🚗 Flood-Safe Alternative Routing Engine
- Real-time routing utility interfacing with navigation networks:
  - Dynamically flags flooded street segments ($>20\text{ cm}$ water depth) as **Blocked / Critical Inundation**.
  - Automatically calculates and renders **Flood-Safe Alternative Corridors** across elevated micro-topography contours (e.g., Western Express Flyover, Connaught Outer Ridge, 100 Feet Bypass).
  - External link button for one-click turn-by-turn navigation in **Google Maps**.

### 6. 📍 Browser GPS & Nearest Flood Relief Hubs
- Automatic GPS geolocation detection (`navigator.geolocation`) upon opening the application with live radar beacon (`📍 YOU ARE HERE`).
- Real-time querying of nearest **Emergency Shelters 🏠**, **Hospitals 🏥**, **Police Stations 👮**, and **Fire & Rescue Stations 🚒** via OpenStreetMap Overpass with verified regional fallback.
- True distance calculation via Haversine formula and instant click-to-call actions.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | [Next.js 16.3](https://nextjs.org/) (App Router, Turbopack) |
| **Language & Typing** | [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode) |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) |
| **Interactive GIS & Mapping** | [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/) |
| **Styling & UI** | [Tailwind CSS](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/) |
| **Hydraulic & ML Engine** | Physics-Informed ML Surrogate Model, Graph-based 1D Hydraulic Solver |
| **Geospatial Data** | GeoJSON, OpenStreetMap Overpass API, IMD Doppler Weather Radar Specs |

---

## 📂 Project Structure

```
Urban-Flood-Nowcasting-System-Frontend/
├── public/
│   └── logo.png                       # Official HYDRA 2.0 multi-element logo & favicon
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with metadata and favicon
│   │   ├── page.tsx                   # Main dashboard layout
│   │   └── globals.css                # Global styles and Leaflet map overrides
│   ├── components/
│   │   ├── map/
│   │   │   ├── FloodMap.tsx           # Dynamic client-only Leaflet wrapper
│   │   │   ├── MapClient.tsx          # Leaflet map container, coupled layers & routes
│   │   │   ├── UserLocationMarker.tsx # Pulsing GPS radar beacon marker
│   │   │   ├── EmergencyMarkers.tsx   # Shelters, hospitals, police, and fire markers
│   │   │   └── EvacuationRouteLayer.tsx # Active route polyline to destination
│   │   └── ui/
│   │       ├── HeaderBranding.tsx     # HYDRA 2.0 branding card with logo
│   │       ├── MetroRadarBar.tsx      # Metro switcher, Doppler radar slider & 0-3h horizon
│   │       ├── LocationSafetyCard.tsx # Location-aware live flood risk assessment
│   │       ├── EmergencyServicesPanel.tsx # Nearby flood relief & shelter list
│   │       ├── RouteInspector.tsx     # Map layers toggles & alternative navigation
│   │       ├── InspectorModal.tsx     # Quick street/drain inspection card
│   │       ├── MLHydraulicInspector.tsx # Full coupled DEM, surcharge & ML attribution modal
│   │       └── WeatherPill.tsx        # Live Doppler radar conditions & weather alert
│   ├── data/
│   │   ├── metroFloodData.ts          # High-res DEM, drainage nodes, pipes & routes for metros
│   │   └── mockEmergencyServices.ts   # Verified emergency shelter & medical dataset
│   ├── hooks/
│   │   └── useUserLocation.ts         # Hands-free GPS detection & context synchronization
│   ├── store/
│   │   └── useFloodStore.ts           # Central Zustand store for ML nowcast & GIS layers
│   ├── types/
│   │   └── index.ts                   # Strict TypeScript definitions for DEM, Graph & Nowcasts
│   └── utils/
│       ├── hydraulicMLModel.ts        # Physics-informed ML inundation surrogate model
│       ├── drainageGraph.ts           # Directed graph model for stormwater pipe networks
│       ├── emergencyServices.ts       # OpenStreetMap Overpass fetcher & fallback
│       └── geoDistance.ts             # Haversine distance and travel time calculator
├── package.json
└── README.md
```

---

## 🏁 Getting Started

### Prerequisites
- **Node.js**: v18.18.0 or higher (v20+ recommended)
- **npm**: v9+ (or `yarn` / `pnpm` / `bun`)

### 1. Clone the Repository
```bash
git clone https://github.com/Rohul786/HYDRA-2.0.git
cd HYDRA-2.0
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🧪 Model Verification & Linting

Run automated code health and typing checks:
```bash
# Verify strict TypeScript typing and ESLint
npm run lint

# Build optimized production bundle with Turbopack
npm run build
```

---

## 🤝 Contributing

Contributions to improve hydrological physics, ingest real municipal GIS drain datasets, or calibrate ML surrogate models for more Indian cities are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/delhi-barapullah-expansion`)
3. Commit your changes (`git commit -m 'feat: add Barapullah drain sub-catchment'`)
4. Push to the branch (`git push origin feature/delhi-barapullah-expansion`)
5. Open a Pull Request

---

<p align="center">
  Built with ❤️ for <strong>Smart India Hackathon</strong> &amp; Urban Flood Resilience in Indian Metros.
</p>
