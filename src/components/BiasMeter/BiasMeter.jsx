import { useState, useEffect } from 'react'
import GaugeComponent from 'react-gauge-component'
import './BiasMeter.css'

const BiasMeter = ({ value = 50, country = null }) => {
  const [biasValue, setBiasValue] = useState(value)

  useEffect(() => {
    // Update bias value when value prop changes (from country selection)
    setBiasValue(value)
  }, [value])

  // Only animate if no country is selected (demo mode)
  useEffect(() => {
    if (!country) {
      const interval = setInterval(() => {
        setBiasValue(Math.random() * 100) // Random value between 0 and 100
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [country])

  // Determine which section the value falls into based on the gauge limits
  const getSection = () => {
    if (biasValue < 15) return 'unfair-left'
    if (biasValue < 37) return 'mostly-fair-left'
    if (biasValue < 58) return 'fair'
    if (biasValue < 75) return 'mostly-fair-right'
    return 'unfair-right'
  }

  const section = getSection()

  return (
    <div className="bias-meter">
      <div className="gauge-wrapper">
        <GaugeComponent
          id="bias-meter-gauge"
          type="semicircle"
          arc={{
            gradient: true,
            width: 0.15,
            padding: 0,
            subArcs: [
              {
                limit: 15,
                color: '#EA4228',
                showTick: false
              },
              {
                limit: 37,
                color: '#F5CD19',
                showTick: false
              },
              {
                limit: 58,
                color: '#5BE12C',
                showTick: false
              },
              {
                limit: 75,
                color: '#F5CD19',
                showTick: false
              },
              { color: '#EA4228' }
            ]
          }}
          value={biasValue}
          minValue={0}
          maxValue={100}
          pointer={{ type: "arrow", elastic: true }}
          labels={{
            valueLabel: {
              hide: true
            },
            tickLabels: {
              hide: true,
              hideMinMax: true
            }
          }}
        />
        
        {/* Labels positioned around the arc */}
        <div className="gauge-labels-overlay">
          <span className={`label label-left ${section === 'unfair-left' ? 'active' : ''}`}>
            <span className="label-line">Unfair</span>
            <span className="label-line">Left Leaning</span>
          </span>
          <span className={`label label-mid-left ${section === 'mostly-fair-left' ? 'active' : ''}`}>
            <span className="label-line">Mostly Fair</span>
            <span className="label-line">Left</span>
          </span>
          <span className={`label label-center ${section === 'fair' ? 'active' : ''}`}>
            Fair
          </span>
          <span className={`label label-mid-right ${section === 'mostly-fair-right' ? 'active' : ''}`}>
            <span className="label-line">Mostly Fair</span>
            <span className="label-line">Right</span>
          </span>
          <span className={`label label-right ${section === 'unfair-right' ? 'active' : ''}`}>
            <span className="label-line">Unfair</span>
            <span className="label-line">Right Leaning</span>
          </span>
        </div>
      </div>
    </div>
  )
}

export default BiasMeter
