import { useState } from 'react'
import WorldMap from '../WorldMap/WorldMap'
import './GlobalCoverage.css'

const GlobalCoverage = () => {
  const [selectedCountry, setSelectedCountry] = useState(null)

  const handleCountryClick = (country) => {
    setSelectedCountry(country)
  }

  return (
    <div className="global-coverage">
      <div className="coverage-header">
        <h3>Select a country to see how they report on the same issue</h3>
        {selectedCountry && (
          <p className="selected-country">
            Viewing perspective from: <strong>{selectedCountry}</strong>
          </p>
        )}
      </div>
      
      <div className="coverage-content">
        <div className="map-section">
          <WorldMap onCountryClick={handleCountryClick} selectedCountry={selectedCountry} />
        </div>
      </div>
    </div>
  )
}

export default GlobalCoverage

