# Jal Drishti Frontend

## Overview
Frontend application for the Jal Drishti groundwater monitoring and prediction system. Built with React, TypeScript, and Vite.

## Features
- **Interactive District/Block/Village Selection**
- **Real-time Groundwater Data Visualization**
- **ML-Powered Predictions**
- **Risk Assessment Dashboard**
- **Multi-language Support**

## Architecture

### Key Components
- **RegionSidebarWithChart** - Location selection dropdowns
- **WaterLevelChart** - Interactive groundwater depth visualization
- **DashboardContext** - State management for selected regions and data
- **RegionalDataService** - API client for backend communication

### Data Flow
```
User Selection -> RegionalDataService -> FastAPI Backend -> Graph Visualization
```

## API Integration

### New Graph API System
The frontend now uses a unified graph API endpoint:

```typescript
// Single API call for complete data
const graphData = await GraphDataService.getGraphData(villageName);
```

**Response includes:**
- Historical data (2014-2023)
- Prediction data (2024-2025)
- Risk analysis
- Village metadata

### API Endpoints Used
- `/api/cleaned/districts` - All 36 districts
- `/api/cleaned/blocks/{district}` - Blocks for district
- `/api/cleaned/villages/{district}/{block}` - Villages for block
- `/api/graph-data/{village}` - Complete graph data (NEW)
- `/api/cleaned/search` - Village search

## Key Improvements

### 1. Fixed Pagination Issues
- **Before:** Limited to 1000 records
- **After:** Fetches all 3,338 records with batch processing

### 2. Unified Graph API
- **Before:** 3 parallel API calls (history, predictions, risk)
- **After:** Single optimized API call with all data

### 3. Enhanced Error Handling
- Graceful fallbacks for API failures
- User-friendly loading states
- Comprehensive error logging

### 4. Performance Optimizations
- In-memory caching (5-minute TTL)
- Batch data processing
- Reduced API overhead

## Data Visualization

### Chart Components
- **Recharts** for interactive graphs
- **Historical trend lines** (blue)
- **Prediction lines** (red)
- **Confidence intervals** for predictions
- **Risk level indicators**

### Data Format
```typescript
interface GraphDataPoint {
  year: number;
  depth: number;
  type: "historical" | "prediction";
  season: string | null;
  confidence_low?: number;
  confidence_high?: number;
}
```

## Development

### Getting Started
```bash
npm install
npm run dev
```

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### Build
```bash
npm run build
```

## Technology Stack

### Frontend Framework
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling

### UI Components
- **Radix UI** for accessible components
- **Lucide React** for icons
- **Recharts** for data visualization

### State Management
- **React Context** for global state
- **React Query** for server state
- **Custom hooks** for data fetching

### Data Services
- **RegionalDataService** - Location data
- **GraphDataService** - Chart data
- **MockDataService** - Fallback data

## Features Summary

### Location Selection
- 36 Maharashtra districts
- Dynamic block loading
- Village search functionality
- Hierarchical data structure

### Groundwater Analysis
- 10-year historical data
- ML-powered predictions
- Risk assessment levels
- Trend analysis

### User Experience
- Multi-language support (English/Marathi)
- Responsive design
- Loading states
- Error handling
- Accessibility features

## Future Enhancements

### Planned Features
- [ ] Export data functionality
- [ ] Advanced filtering options
- [ ] Comparative analysis
- [ ] Mobile app version
- [ ] Offline mode support

### Performance Improvements
- [ ] Service worker implementation
- [ ] Data compression
- [ ] Lazy loading
- [ ] Caching strategies

## Contributing

1. Follow the existing code style
2. Add TypeScript types for new components
3. Include error handling for API calls
4. Test with different screen sizes
5. Ensure accessibility compliance

## License

© 2024 Jal Drishti Project. All rights reserved.
