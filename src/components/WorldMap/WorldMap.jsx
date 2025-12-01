import { useState, useEffect, useRef } from 'react'
import { WorldMap as SVGWorldMap } from "react-svg-worldmap"
import './WorldMap.css'

const WorldMap = ({ onCountryClick, selectedCountry, countriesWithCoverage = new Set() }) => {
  // Map ISO codes to country names
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

  // Reverse mapping: country name to ISO code
  const countryNameToIso = {}
  Object.entries(isoToCountryName).forEach(([iso, name]) => {
    countryNameToIso[name] = iso
  })

  // All available countries (major countries that are likely to have news coverage)
  const allCountries = Object.keys(isoToCountryName)
  
  // Color countries based on coverage status
  const getColor = (countryCode) => {
    const countryName = isoToCountryName[countryCode]
    const hasCoverage = countriesWithCoverage.has(countryName)
    const isSelected = countryName === selectedCountry
    
    if (isSelected) {
      return '#3b82f6' // Blue for selected country
    }
    
    if (hasCoverage) {
      return '#10b981' // Green for countries with coverage
    }
    
    // Color countries by region for better visual appeal
    const regionColors = {
      // North America - Blue
      'US': '#60a5fa', 'CA': '#60a5fa', 'MX': '#60a5fa',
      // South America - Green
      'BR': '#34d399', 'AR': '#34d399', 'CL': '#34d399', 'CO': '#34d399', 'PE': '#34d399', 'VE': '#34d399',
      // Europe - Purple
      'GB': '#a78bfa', 'FR': '#a78bfa', 'DE': '#a78bfa', 'ES': '#a78bfa', 'IT': '#a78bfa', 
      'NL': '#a78bfa', 'SE': '#a78bfa', 'PL': '#a78bfa', 'HU': '#a78bfa', 'GR': '#a78bfa',
      // Russia/Turkey - Red
      'RU': '#f87171', 'TR': '#f87171',
      // Asia - Orange
      'CN': '#fb923c', 'IN': '#fb923c', 'JP': '#fb923c', 'KR': '#fb923c', 'VN': '#fb923c',
      'PH': '#fb923c', 'ID': '#fb923c', 'IL': '#fb923c', 'LB': '#fb923c', 'JO': '#fb923c',
      // Africa - Yellow
      'ZA': '#fbbf24', 'NG': '#fbbf24', 'KE': '#fbbf24', 'GH': '#fbbf24', 'SN': '#fbbf24',
      'TN': '#fbbf24', 'TZ': '#fbbf24',
      // Oceania - Cyan
      'AU': '#22d3ee'
    }
    
    // Use a more vibrant default color instead of grey
    return regionColors[countryCode] || '#94a3b8' // Light blue-grey for countries not in our list
  }

  // Convert to format expected by react-svg-worldmap
  // Give all countries a value so they're visible and colored
  const data = allCountries.map((countryCode) => {
    const countryName = isoToCountryName[countryCode]
    const hasCoverage = countriesWithCoverage.has(countryName)
    const fillColor = getColor(countryCode)
    
    // Convert hex color to a numeric value for the library
    // Use a consistent value but let styleFunction handle the actual color
    return {
      country: countryCode.toLowerCase(), // Library expects lowercase
      value: hasCoverage ? 100 : 75, // Use 75 for all countries so they're visible
    }
  })


  const handleCountryClick = (event, countryCode, countryName) => {
    console.log('handleCountryClick called with:', { event, countryCode, countryName })
    
    if (!countryCode) {
      console.error('No countryCode provided')
      return
    }
    
    const mappedName = isoToCountryName[countryCode] || countryName
    console.log('Mapped to country name:', mappedName)
    console.log('onCountryClick prop exists:', !!onCountryClick)
    
    if (mappedName && onCountryClick) {
      console.log('✅ Calling onCountryClick with:', mappedName)
      try {
        onCountryClick(mappedName)
        console.log('✅ onCountryClick called successfully')
      } catch (error) {
        console.error('❌ Error calling onCountryClick:', error)
      }
    } else {
      console.warn('❌ Cannot call onCountryClick:', { 
        mappedName, 
        hasHandler: !!onCountryClick, 
        countryCode, 
        countryName 
      })
    }
  }

  // Create style function for the map - react-svg-worldmap uses styleFunction
  const styleFunction = ({ countryValue, country, color }) => {
    // Country code comes in lowercase from library, convert to uppercase for our mapping
    const countryCodeUpper = (country || '').toUpperCase()
    const fillColor = getColor(countryCodeUpper)
    const isSelected = isoToCountryName[countryCodeUpper] === selectedCountry
    const countryName = isoToCountryName[countryCodeUpper]
    const hasCoverage = countriesWithCoverage.has(countryName)
    
    // Ensure we always return a valid color - use bright colors so they're visible
    const finalColor = fillColor || '#94a3b8'
    
    // Return style object - the library should apply these
    const styleObj = {
      fill: finalColor,
      stroke: isSelected ? '#1e40af' : (hasCoverage ? '#059669' : '#ffffff'),
      strokeWidth: isSelected ? 3 : (hasCoverage ? 2 : 1.5),
      fillOpacity: isSelected ? 1 : (hasCoverage ? 0.95 : 0.9),
      cursor: 'pointer',
    }
    
    // Also set as inline style attributes that CSS can override
    return styleObj
  }

  // Extended country mapping for ALL countries on the map
  const getAllCountryColors = () => {
    // Get our known countries
    const known = {}
    Object.keys(isoToCountryName).forEach(code => {
      known[code] = getColor(code)
    })
    
    // Add colors for common countries that might appear but aren't in our list
    const extendedColors = {
      ...known,
      // Additional countries with regional colors
      'KZ': '#fb923c', // Kazakhstan - Asia
      'PK': '#fb923c', // Pakistan - Asia
      'BD': '#fb923c', // Bangladesh - Asia
      'TH': '#fb923c', // Thailand - Asia
      'MY': '#fb923c', // Malaysia - Asia
      'SG': '#fb923c', // Singapore - Asia
      'SA': '#fb923c', // Saudi Arabia - Asia
      'AE': '#fb923c', // UAE - Asia
      'IQ': '#fb923c', // Iraq - Asia
      'IR': '#fb923c', // Iran - Asia
      'AF': '#fb923c', // Afghanistan - Asia
      'EG': '#fbbf24', // Egypt - Africa
      'ET': '#fbbf24', // Ethiopia - Africa
      'MA': '#fbbf24', // Morocco - Africa
      'DZ': '#fbbf24', // Algeria - Africa
      'SD': '#fbbf24', // Sudan - Africa
      'UG': '#fbbf24', // Uganda - Africa
      'AO': '#fbbf24', // Angola - Africa
      'MZ': '#fbbf24', // Mozambique - Africa
      'MW': '#fbbf24', // Malawi - Africa
      'ZM': '#fbbf24', // Zambia - Africa
      'ZW': '#fbbf24', // Zimbabwe - Africa
      'BW': '#fbbf24', // Botswana - Africa
      'NA': '#fbbf24', // Namibia - Africa
      'CM': '#fbbf24', // Cameroon - Africa
      'CI': '#fbbf24', // Côte d'Ivoire - Africa
      'PT': '#a78bfa', // Portugal - Europe
      'BE': '#a78bfa', // Belgium - Europe
      'CH': '#a78bfa', // Switzerland - Europe
      'AT': '#a78bfa', // Austria - Europe
      'CZ': '#a78bfa', // Czech Republic - Europe
      'RO': '#a78bfa', // Romania - Europe
      'BG': '#a78bfa', // Bulgaria - Europe
      'HR': '#a78bfa', // Croatia - Europe
      'RS': '#a78bfa', // Serbia - Europe
      'UA': '#a78bfa', // Ukraine - Europe
      'NO': '#a78bfa', // Norway - Europe
      'DK': '#a78bfa', // Denmark - Europe
      'FI': '#a78bfa', // Finland - Europe
      'IE': '#a78bfa', // Ireland - Europe
      'NZ': '#22d3ee', // New Zealand - Oceania
      'FJ': '#22d3ee', // Fiji - Oceania
      'PG': '#22d3ee', // Papua New Guinea - Oceania
      'EC': '#34d399', // Ecuador - South America
      'UY': '#34d399', // Uruguay - South America
      'PY': '#34d399', // Paraguay - South America
      'BO': '#34d399', // Bolivia - South America
      'GY': '#34d399', // Guyana - South America
      'SR': '#34d399', // Suriname - South America
      'GT': '#60a5fa', // Guatemala - North America
      'HN': '#60a5fa', // Honduras - North America
      'SV': '#60a5fa', // El Salvador - North America
      'NI': '#60a5fa', // Nicaragua - North America
      'CR': '#60a5fa', // Costa Rica - North America
      'PA': '#60a5fa', // Panama - North America
      'CU': '#60a5fa', // Cuba - North America
      'DO': '#60a5fa', // Dominican Republic - North America
      'JM': '#60a5fa', // Jamaica - North America
      'HT': '#60a5fa', // Haiti - North America
    }
    
    return extendedColors
  }

  // Custom tooltip state
  const [tooltip, setTooltip] = useState({ show: false, name: '', x: 0, y: 0 })
  
  // Store country names from library's onClickFunction for all countries
  const countryNameCache = useRef({})

  // Force colors on ALL SVG paths and add custom tooltips
  useEffect(() => {
    const applyColorsAndTooltips = () => {
      const svg = document.querySelector('.world-map svg')
      if (!svg) return
      
      const paths = Array.from(svg.querySelectorAll('path'))
      const allColors = getAllCountryColors()
      
      // Create a mapping of all country codes to names (including library's built-in names)
      const allCountryNames = { ...isoToCountryName }
      
      paths.forEach((path, index) => {
        let countryCode = null
        let countryName = null
        
        // Try to get country code from our data array first
        if (index < data.length) {
          const countryData = data[index]
          countryCode = countryData.country.toUpperCase()
          countryName = isoToCountryName[countryCode]
        }
        
        // If not found, try to get from library's tooltip or path data
        if (!countryCode || !countryName) {
          // Try to extract country code from path ID (library uses format like "svg-world-map-country-es")
          const pathId = path.id || ''
          const codeMatch = pathId.match(/country-([a-z]{2})/i)
          if (codeMatch && !countryCode) {
            countryCode = codeMatch[1].toUpperCase()
            countryName = isoToCountryName[countryCode]
          }
          
          // Also try other ID patterns
          if (!countryCode) {
            const idMatch = pathId.match(/-([a-z]{2})$/i)
            if (idMatch) {
              countryCode = idMatch[1].toUpperCase()
              countryName = isoToCountryName[countryCode]
            }
          }
          
          // The library might have set a title or data attribute
          const existingTitle = path.getAttribute('title')
          const dataCountry = path.getAttribute('data-country')
          
          if (existingTitle && !countryName) {
            countryName = existingTitle
            // Try to find code by name
            Object.entries(isoToCountryName).forEach(([code, name]) => {
              if (name === existingTitle) {
                countryCode = code
              }
            })
          }
          
          if (dataCountry && !countryName) {
            countryName = dataCountry
          }
        }
        
        // Store country name in data attribute for easy access
        if (countryName) {
          path.setAttribute('data-country-name', countryName)
          allCountryNames[countryCode] = countryName
        }
        
        // Always store country code if we have it, even without name
        if (countryCode) {
          path.setAttribute('data-country-code', countryCode)
        }
        
        // Determine color - ensure ALL countries get a color, never grey/white
        let color
        
        // First try our known colors
        if (countryCode && allColors[countryCode]) {
          color = allColors[countryCode]
        } else if (countryCode) {
          // Use regional color based on country code patterns
          const code = countryCode
          
          // North America - Blue
          if (['US', 'CA', 'MX', 'GT', 'HN', 'SV', 'NI', 'CR', 'PA', 'CU', 'DO', 'JM', 'HT', 'BS', 'BB', 'TT', 'GD', 'LC', 'VC', 'AG', 'BZ', 'GL'].includes(code)) {
            color = '#60a5fa'
          } 
          // South America - Green
          else if (['BR', 'AR', 'CL', 'CO', 'PE', 'VE', 'EC', 'UY', 'PY', 'BO', 'GY', 'SR', 'GF'].includes(code)) {
            color = '#34d399'
          } 
          // Europe - Purple
          else if (['GB', 'FR', 'DE', 'ES', 'IT', 'NL', 'SE', 'PL', 'HU', 'GR', 'PT', 'BE', 'CH', 'AT', 'CZ', 'RO', 'BG', 'HR', 'RS', 'UA', 'NO', 'DK', 'FI', 'IE', 'IS', 'LU', 'MT', 'CY', 'SK', 'SI', 'EE', 'LV', 'LT', 'BY', 'MD', 'MK', 'AL', 'BA', 'ME', 'XK'].includes(code)) {
            color = '#a78bfa'
          } 
          // Asia - Orange
          else if (['CN', 'IN', 'JP', 'KR', 'VN', 'PH', 'ID', 'IL', 'LB', 'JO', 'KZ', 'PK', 'BD', 'TH', 'MY', 'SG', 'SA', 'AE', 'IQ', 'IR', 'AF', 'MM', 'LA', 'KH', 'TW', 'HK', 'MO', 'MN', 'NP', 'BT', 'LK', 'MV', 'YE', 'OM', 'QA', 'BH', 'KW', 'AM', 'AZ', 'GE', 'UZ', 'TM', 'TJ', 'KG'].includes(code)) {
            color = '#fb923c'
          } 
          // Africa - Yellow
          else if (['ZA', 'NG', 'KE', 'GH', 'SN', 'TN', 'TZ', 'EG', 'ET', 'MA', 'DZ', 'SD', 'UG', 'AO', 'MZ', 'MW', 'ZM', 'ZW', 'BW', 'NA', 'CM', 'CI', 'LR', 'SL', 'GM', 'GW', 'GN', 'ML', 'NE', 'TD', 'CF', 'CD', 'CG', 'GA', 'GQ', 'ST', 'BI', 'RW', 'DJ', 'SO', 'ER', 'LY', 'MR', 'BF', 'BJ', 'TG', 'MG', 'MU', 'SC', 'KM', 'CV'].includes(code)) {
            color = '#fbbf24'
          } 
          // Oceania - Cyan
          else if (['AU', 'NZ', 'FJ', 'PG', 'SB', 'VU', 'NC', 'PF', 'WS', 'TO', 'KI', 'TV', 'NR', 'PW', 'FM', 'MH'].includes(code)) {
            color = '#22d3ee'
          } 
          // Russia/Turkey - Red
          else if (['RU', 'TR'].includes(code)) {
            color = '#f87171'
          } 
          // Default: assign color based on geographic region using code patterns
          else {
            // Try to guess region from country code or use pleasant colors
            if (code && code.length === 2) {
              // Use a color based on the first letter to ensure variety
              const firstLetter = code[0].toUpperCase()
              const colorMap = {
                'A': '#a78bfa', 'B': '#60a5fa', 'C': '#34d399', 'D': '#fb923c',
                'E': '#fbbf24', 'F': '#22d3ee', 'G': '#a78bfa', 'H': '#60a5fa',
                'I': '#34d399', 'J': '#fb923c', 'K': '#fbbf24', 'L': '#22d3ee',
                'M': '#a78bfa', 'N': '#60a5fa', 'O': '#34d399', 'P': '#fb923c',
                'Q': '#fbbf24', 'R': '#22d3ee', 'S': '#a78bfa', 'T': '#60a5fa',
                'U': '#34d399', 'V': '#fb923c', 'W': '#fbbf24', 'X': '#22d3ee',
                'Y': '#a78bfa', 'Z': '#60a5fa'
              }
              color = colorMap[firstLetter] || '#94a3b8'
            } else {
              // Fallback: use pleasant colors, never grey
              const pleasantColors = ['#60a5fa', '#34d399', '#a78bfa', '#fb923c', '#fbbf24', '#22d3ee']
              color = pleasantColors[index % pleasantColors.length]
            }
          }
        } else {
          // No country code found - use pleasant colors, never grey
          const pleasantColors = ['#60a5fa', '#34d399', '#a78bfa', '#fb923c', '#fbbf24', '#22d3ee', '#f87171']
          color = pleasantColors[index % pleasantColors.length]
        }
        
        // Apply color
        path.setAttribute('fill', color)
        path.style.setProperty('fill', color, 'important')
        
        // Ensure stroke is visible
        path.setAttribute('stroke', '#ffffff')
        path.setAttribute('stroke-width', '1.5')
        path.style.setProperty('stroke', '#ffffff', 'important')
        
        // Add hover event listeners for custom tooltip
        // IMPORTANT: Don't use index-based matching - it's unreliable!
        // Instead, rely on the library's tooltipTextFunction which provides correct countryName
        const handleMouseEnter = (e) => {
          // Get the container element for positioning
          const container = document.getElementById('world-map-container') || 
                           svg.closest('.world-map > div') || 
                           svg.parentElement
          const containerRect = container ? container.getBoundingClientRect() : svg.getBoundingClientRect()
          
          // Calculate position relative to the container
          const x = e.clientX - containerRect.left
          const y = e.clientY - containerRect.top
          
          // Wait a tiny bit for tooltipTextFunction to populate the cache
          // Then get the name using the SAME method as the click handler
          setTimeout(() => {
            // Extract country code from path ID - same method as click handler uses
            const pathId = (path.id || '').toLowerCase()
            let countryCode = null
            
            // Try to extract country code from path ID
            const patterns = [
              /country-([a-z]{2})/i,
              /-([a-z]{2})$/i,
              /^([a-z]{2})-/i
            ]
            
            for (const pattern of patterns) {
              const match = pathId.match(pattern)
              if (match && match[1] && match[1].length === 2) {
                countryCode = match[1].toUpperCase()
                break
              }
            }
            
            // Get name from cache - this is populated by tooltipTextFunction/onClickFunction
            // Use the EXACT same lookup method as the click handler
            let name = null
            if (countryCode) {
              // First try cache (populated by library's functions)
              name = countryNameCache.current[countryCode] || 
                     countryNameCache.current[countryCode.toLowerCase()]
              
              // Then try data attribute (set by library's functions)
              if (!name || name === '' || name === 'undefined') {
                name = path.getAttribute('data-country-name')
              }
              
              // Last resort: our mapping
              if (!name || name === '' || name === 'undefined') {
                name = isoToCountryName[countryCode]
              }
            }
            
            setTooltip({
              show: true,
              name: name || 'Unknown',
              x: x,
              y: y
            })
          }, 50) // Small delay to let tooltipTextFunction run first
        }
        
        const handleMouseMove = (e) => {
          // Get the container element for positioning
          const container = document.getElementById('world-map-container') || 
                           svg.closest('.world-map > div') || 
                           svg.parentElement
          const containerRect = container ? container.getBoundingClientRect() : svg.getBoundingClientRect()
          
          // Calculate position relative to the container - FOLLOW THE MOUSE
          const x = e.clientX - containerRect.left
          const y = e.clientY - containerRect.top
          
          // Extract country code from path ID - same method as click handler
          const pathId = (path.id || '').toLowerCase()
          let countryCode = null
          
          const patterns = [
            /country-([a-z]{2})/i,
            /-([a-z]{2})$/i,
            /^([a-z]{2})-/i
          ]
          
          for (const pattern of patterns) {
            const match = pathId.match(pattern)
            if (match && match[1] && match[1].length === 2) {
              countryCode = match[1].toUpperCase()
              break
            }
          }
          
          // Get name from cache - SAME method as click handler
          let name = null
          if (countryCode) {
            // First try cache (populated by library's functions)
            name = countryNameCache.current[countryCode] || 
                   countryNameCache.current[countryCode.toLowerCase()]
            
            // Then try data attribute (set by library's functions)
            if (!name || name === '' || name === 'undefined') {
              name = path.getAttribute('data-country-name')
            }
            
            // Last resort: our mapping
            if (!name || name === '' || name === 'undefined') {
              name = isoToCountryName[countryCode]
            }
          }
          
          // Update tooltip position to follow mouse
          setTooltip({
            show: true,
            name: name || 'Unknown',
            x: x,
            y: y
          })
        }
        
        const handleMouseLeave = () => {
          setTooltip({ show: false, name: '', x: 0, y: 0 })
        }
        
        // Remove old listeners if they exist (using named functions stored on element)
        if (path._tooltipHandlers) {
          path.removeEventListener('mouseenter', path._tooltipHandlers.enter)
          path.removeEventListener('mousemove', path._tooltipHandlers.move)
          path.removeEventListener('mouseleave', path._tooltipHandlers.leave)
        }
        
        // Store handlers on element for cleanup
        path._tooltipHandlers = {
          enter: handleMouseEnter,
          move: handleMouseMove,
          leave: handleMouseLeave
        }
        
        // Add new listeners
        path.addEventListener('mouseenter', handleMouseEnter)
        path.addEventListener('mousemove', handleMouseMove)
        path.addEventListener('mouseleave', handleMouseLeave)
      })
    }
    
    // Apply colors and tooltips multiple times to ensure they stick
    const timers = [
      setTimeout(applyColorsAndTooltips, 300),
      setTimeout(applyColorsAndTooltips, 800),
      setTimeout(applyColorsAndTooltips, 1500),
      setTimeout(applyColorsAndTooltips, 2500)
    ]
    
    return () => {
      timers.forEach(timer => clearTimeout(timer))
      // Clean up event listeners
      const svg = document.querySelector('.world-map svg')
      if (svg) {
        const paths = Array.from(svg.querySelectorAll('path'))
        paths.forEach(path => {
          if (path._tooltipHandlers) {
            path.removeEventListener('mouseenter', path._tooltipHandlers.enter)
            path.removeEventListener('mousemove', path._tooltipHandlers.move)
            path.removeEventListener('mouseleave', path._tooltipHandlers.leave)
            delete path._tooltipHandlers
          }
        })
      }
    }
  }, [selectedCountry, countriesWithCoverage, data, isoToCountryName])

  // Removed direct click handler - using only library's onClickFunction to avoid duplicate clicks

  return (
    <div className="world-map-container">
      <div className="world-map">
        <div style={{ width: '100%', overflow: 'visible', position: 'relative' }} id="world-map-container">
          <SVGWorldMap
            styleFunction={styleFunction}
            size="responsive"
            data={data}
            color="#60a5fa"
            onClickFunction={({ countryName, countryCode, countryValue }) => {
              // Prevent event bubbling to avoid duplicate clicks
              if (!countryCode || !countryName) {
                return
              }
              
              // Store country name in cache for tooltip use
              // This is the SAME method we use for clicks - it's always correct!
              const code = countryCode.toUpperCase()
              const name = countryName // Use library's name - it's correct!
              
              // Store in cache with both uppercase and lowercase keys
              countryNameCache.current[code] = name
              countryNameCache.current[code.toLowerCase()] = name
              
              // Also update all paths with this country code
              const svg = document.querySelector('.world-map svg')
              if (svg) {
                const paths = svg.querySelectorAll('path')
                const codeLower = code.toLowerCase()
                paths.forEach(p => {
                  const pathId = (p.id || '').toLowerCase()
                  // Match paths that contain this country code
                  if (pathId.includes(`country-${codeLower}`) ||
                      pathId.endsWith(`-${codeLower}`) ||
                      pathId.endsWith(codeLower) ||
                      pathId === codeLower) {
                    p.setAttribute('data-country-name', name)
                    p.setAttribute('data-country-code', code)
                  }
                })
              }
              
              // Call the click handler with the correct country
              handleCountryClick(null, code, name)
            }}
            tooltipBgColor="#1e293b"
            tooltipTextColor="#ffffff"
            tooltipTextFunction={({ countryName, countryCode }) => {
              // This function is called by the library for the EXACT country being hovered
              // Store it immediately in cache - use the SAME method as onClickFunction
              if (countryCode && countryName) {
                const code = countryCode.toUpperCase()
                const name = countryName // Use library's name - it's always correct!
                
                // Store in cache immediately with both uppercase and lowercase keys
                countryNameCache.current[code] = name
                countryNameCache.current[code.toLowerCase()] = name
                
                // Find ALL paths that match this country code and update them immediately
                const svg = document.querySelector('.world-map svg')
                if (svg) {
                  const paths = svg.querySelectorAll('path')
                  const codeLower = code.toLowerCase()
                  
                  paths.forEach(p => {
                    const pathId = (p.id || '').toLowerCase()
                    // Match by country code in various ID formats - same logic as onClickFunction
                    if (pathId.includes(`country-${codeLower}`) ||
                        pathId.endsWith(`-${codeLower}`) ||
                        pathId.endsWith(codeLower) ||
                        pathId === codeLower) {
                      p.setAttribute('data-country-name', name)
                      p.setAttribute('data-country-code', code)
                    }
                  })
                }
              }
              
              // Return empty string - we use our custom tooltip
              return ''
            }}
            frameColor="#ffffff"
            borderColor="#e5e7eb"
            backgroundColor="#f0f9ff"
          />
          
          {/* Custom tooltip that follows mouse */}
          {tooltip.show && tooltip.name && tooltip.name !== 'Unknown' && (
            <div 
              className="custom-map-tooltip"
              style={{
                position: 'absolute',
                left: `${tooltip.x}px`,
                top: `${tooltip.y}px`,
                transform: 'translate(-50%, calc(-100% - 12px))',
                pointerEvents: 'none',
                zIndex: 10000,
                whiteSpace: 'nowrap'
              }}
            >
              {tooltip.name}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WorldMap
