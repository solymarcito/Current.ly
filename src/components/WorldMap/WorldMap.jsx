import { WorldMap as SVGWorldMap } from "react-svg-worldmap"
import './WorldMap.css'

const WorldMap = ({ onCountryClick, selectedCountry }) => {
  // Sample country data with scores (0-100)
  const countryData = {
    // North America
    'CA': 79, // Canada
    'US': 58, // United States
    'MX': 55, // Mexico
    // South America
    'VE': 50, // Venezuela
    'CO': 43, // Colombia
    'PE': 42, // Peru
    'BR': 54, // Brazil
    'CL': 36, // Chile
    'AR': 38, // Argentina
    // Europe
    'NL': 82, // Netherlands
    'DE': 77, // Germany
    'SE': 78, // Sweden
    'GB': 64, // United Kingdom
    'FR': 54, // France
    'ES': 48, // Spain
    'PL': 43, // Poland
    'HU': 49, // Hungary
    'RU': 68, // Russia
    'TR': 73, // Turkey
    'IT': 46, // Italy
    'GR': 25, // Greece
    // Africa
    'TN': 52, // Tunisia
    'SN': 75, // Senegal
    'GH': 70, // Ghana
    'NG': 68, // Nigeria
    'KE': 75, // Kenya
    'TZ': 89, // Tanzania
    'ZA': 69, // South Africa
    // Asia
    'IN': 72, // India
    'LB': 62, // Lebanon
    'IL': 50, // Israel
    'JO': 47, // Jordan
    'JP': 55, // Japan
    'KR': 26, // South Korea
    'VN': 78, // Vietnam
    'PH': 83, // Philippines
    'ID': 85, // Indonesia
    'CN': 55, // China
    // Oceania
    'AU': 60 // Australia
  }

  const getColor = (score) => {
    if (score >= 70) return '#10b981' // Dark green
    if (score >= 50) return '#84cc16' // Light green
    if (score >= 30) return '#eab308' // Yellow
    return '#f3f4f6' // Light grey
  }

  // Convert country data to format expected by react-svg-worldmap
  const data = Object.entries(countryData).map(([countryCode, score]) => ({
    country: countryCode,
    value: score,
  }))

  // Map ISO codes to country names for click handling
  const isoToCountryName = {
    'CA': 'Canada',
    'US': 'United States',
    'MX': 'Mexico',
    'VE': 'Venezuela',
    'CO': 'Colombia',
    'PE': 'Peru',
    'BR': 'Brazil',
    'CL': 'Chile',
    'AR': 'Argentina',
    'NL': 'Netherlands',
    'DE': 'Germany',
    'SE': 'Sweden',
    'GB': 'United Kingdom',
    'FR': 'France',
    'ES': 'Spain',
    'PL': 'Poland',
    'HU': 'Hungary',
    'RU': 'Russia',
    'TR': 'Turkey',
    'IT': 'Italy',
    'GR': 'Greece',
    'TN': 'Tunisia',
    'SN': 'Senegal',
    'GH': 'Ghana',
    'NG': 'Nigeria',
    'KE': 'Kenya',
    'TZ': 'Tanzania',
    'ZA': 'South Africa',
    'IN': 'India',
    'LB': 'Lebanon',
    'IL': 'Israel',
    'JO': 'Jordan',
    'JP': 'Japan',
    'KR': 'South Korea',
    'VN': 'Vietnam',
    'PH': 'Philippines',
    'ID': 'Indonesia',
    'CN': 'China',
    'AU': 'Australia'
  }

  const handleCountryClick = (event, countryCode, countryName) => {
    const name = isoToCountryName[countryCode] || countryName
    if (name && onCountryClick) {
      onCountryClick(name)
    }
  }

  // Create style function for the map - react-svg-worldmap uses styleFunction
  const styleFunction = ({ countryValue, country, color }) => {
    const score = countryValue || 0
    const fillColor = getColor(score)
    const isSelected = isoToCountryName[country] === selectedCountry
    
    return {
      fill: fillColor,
      stroke: isSelected ? '#2563eb' : '#ffffff',
      strokeWidth: isSelected ? 2 : 0.5,
      fillOpacity: 0.9,
      cursor: 'pointer',
    }
  }

  return (
    <div className="world-map-container">
      <div className="world-map">
        <div style={{ width: '100%', overflow: 'visible' }}>
          <SVGWorldMap
            styleFunction={styleFunction}
            valueSuffix="%"
            size="responsive"
            data={data}
            onClickFunction={handleCountryClick}
            tooltipBgColor="#1e293b"
            tooltipTextColor="#ffffff"
            frameColor="#ffffff"
            borderColor="#ffffff"
            backgroundColor="#e0f2fe"
          />
        </div>
        
        {/* Legend */}
        <div className="map-legend">
          <div className="legend-title">Coverage Score</div>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#10b981' }}></div>
              <span>70-100%</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#84cc16' }}></div>
              <span>50-69%</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#eab308' }}></div>
              <span>30-49%</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#f3f4f6' }}></div>
              <span>0-29%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorldMap
