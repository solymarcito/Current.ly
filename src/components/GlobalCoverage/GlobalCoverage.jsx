import { useState, useEffect } from 'react'
import WorldMap from '../WorldMap/WorldMap'
import './GlobalCoverage.css'

const GlobalCoverage = ({ topic, question, readingLevel = 'middle' }) => {
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [countryHeadlines, setCountryHeadlines] = useState(null)
  const [isLoadingHeadlines, setIsLoadingHeadlines] = useState(false)
  const [error, setError] = useState(null)
  const [countriesWithCoverage, setCountriesWithCoverage] = useState(new Set()) // Track countries that have coverage

  // List of available countries for the clickable list
  const availableCountries = [
    'United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'Spain', 'Italy',
    'Japan', 'China', 'India', 'Australia', 'Brazil', 'Mexico', 'Russia',
    'South Africa', 'Nigeria', 'Kenya', 'Netherlands', 'Sweden', 'Poland',
    'Turkey', 'Israel', 'South Korea', 'Vietnam', 'Philippines', 'Indonesia',
    'Argentina', 'Chile', 'Colombia', 'Peru'
  ]

  // Map country names to common news sources in those countries
  const countryNewsSources = {
    'United States': 'US news sources like CNN, BBC America, Reuters US',
    'United Kingdom': 'UK news sources like BBC, The Guardian, The Times',
    'Canada': 'Canadian news sources like CBC, The Globe and Mail, CTV News',
    'Germany': 'German news sources like Der Spiegel, Deutsche Welle, ARD',
    'France': 'French news sources like Le Monde, France 24, Le Figaro',
    'Spain': 'Spanish news sources like El País, El Mundo, ABC',
    'Italy': 'Italian news sources like La Repubblica, Corriere della Sera, ANSA',
    'Japan': 'Japanese news sources like NHK, The Japan Times, Asahi Shimbun',
    'China': 'Chinese news sources like Xinhua, China Daily, South China Morning Post',
    'India': 'Indian news sources like The Times of India, Hindustan Times, The Hindu',
    'Australia': 'Australian news sources like ABC News Australia, The Sydney Morning Herald, The Australian',
    'Brazil': 'Brazilian news sources like Folha de S.Paulo, O Globo, Estadão',
    'Mexico': 'Mexican news sources like El Universal, Reforma, La Jornada',
    'Russia': 'Russian news sources like RT, TASS, Interfax',
    'South Africa': 'South African news sources like News24, Mail & Guardian, Business Day',
    'Nigeria': 'Nigerian news sources like Premium Times, Vanguard, ThisDay',
    'Kenya': 'Kenyan news sources like Daily Nation, The Standard, Business Daily',
    'Netherlands': 'Dutch news sources like NOS, De Telegraaf, Volkskrant',
    'Sweden': 'Swedish news sources like SVT, Dagens Nyheter, Aftonbladet',
    'Poland': 'Polish news sources like Gazeta Wyborcza, Rzeczpospolita, TVN24',
    'Turkey': 'Turkish news sources like Hürriyet, Sabah, Anadolu Agency',
    'Israel': 'Israeli news sources like Haaretz, The Jerusalem Post, Ynet',
    'South Korea': 'South Korean news sources like Yonhap, The Korea Times, Chosun Ilbo',
    'Vietnam': 'Vietnamese news sources like VnExpress, Tuổi Trẻ, Thanh Niên',
    'Philippines': 'Philippine news sources like Philippine Daily Inquirer, ABS-CBN, GMA News',
    'Indonesia': 'Indonesian news sources like Kompas, Detik, Tempo',
    'Argentina': 'Argentine news sources like Clarín, La Nación, Infobae',
    'Chile': 'Chilean news sources like El Mercurio, La Tercera, CNN Chile',
    'Colombia': 'Colombian news sources like El Tiempo, Semana, El Espectador',
    'Peru': 'Peruvian news sources like El Comercio, La República, RPP',
    'Venezuela': 'Venezuelan news sources like El Nacional, Últimas Noticias',
    'Greece': 'Greek news sources like Kathimerini, Ta Nea, To Vima',
    'Hungary': 'Hungarian news sources like Magyar Nemzet, Index, HVG',
    'Lebanon': 'Lebanese news sources like The Daily Star, L\'Orient-Le Jour, An-Nahar',
    'Jordan': 'Jordanian news sources like The Jordan Times, Al Ghad, Ammon News',
    'Tunisia': 'Tunisian news sources like Tunis Afrique Presse, La Presse',
    'Senegal': 'Senegalese news sources like Le Soleil, Sud Quotidien',
    'Ghana': 'Ghanaian news sources like Daily Graphic, Ghanaian Times, MyJoyOnline',
    'Tanzania': 'Tanzanian news sources like The Citizen, Daily News Tanzania'
  }

  const fetchCountryHeadlines = async (country) => {
    console.log('📰 fetchCountryHeadlines called for:', country)
    setIsLoadingHeadlines(true)
    setError(null)
    
    try {
      console.log('📰 Starting API call for:', country)
      const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY
      if (!apiKey) {
        throw new Error('API key not configured')
      }

      // Build the search query
      const searchQuery = topic || question || 'current international news'
      const countryContext = countryNewsSources[country] || `news sources from ${country}`
      
      const readingLevelContext = {
        'elementary': 'Use the simplest language possible, with short sentences and basic vocabulary suitable for grades 1-3.',
        'middle': 'Use clear, straightforward language with moderate complexity suitable for grades 4-6.',
        'high': 'Use standard news language suitable for grades 7-9.',
        'adult': 'Use full complexity and original source language suitable for grade 10 and above.'
      }

      const prompt = `You are Current.ly, an AI news assistant. ${readingLevelContext[readingLevel] || readingLevelContext['middle']}

Find 2-3 recent news headlines and articles from ${countryContext} about: ${searchQuery}

For each article, provide:
1. The headline/title
2. A brief 1-2 sentence summary
3. The publication/source name
4. If available, a URL to the article

Format:
Headline: [Article Headline]
Summary: [1-2 sentence summary]
Source: [Publication Name]
URL: [Article URL if available]

Write in plain text, no markdown, no bullet points. Focus on how ${country} media reports on this topic.`

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that finds and summarizes news articles from different countries.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      let headlinesText = data.choices[0]?.message?.content || ''
      
      // Clean up the response
      headlinesText = headlinesText.replace(/\[\d+\]/g, '')
      headlinesText = headlinesText.replace(/\*\*([^*]+)\*\*/g, '$1')
      headlinesText = headlinesText.replace(/\*([^*]+)\*/g, '$1')
      
      // Parse headlines from the response
      const headlines = parseHeadlines(headlinesText)
      
      setCountryHeadlines({
        country,
        headlines,
        rawText: headlinesText
      })
      
      // Mark this country as having coverage
      if (headlines.length > 0) {
        setCountriesWithCoverage(prev => new Set([...prev, country]))
      }
    } catch (err) {
      console.error('Error fetching country headlines:', err)
      setError(`Unable to fetch headlines from ${country}. Please try again.`)
    } finally {
      setIsLoadingHeadlines(false)
    }
  }

  const parseHeadlines = (text) => {
    const headlines = []
    const headlinePattern = /Headline:\s*(.+?)(?=\n|Summary:|$)/gi
    const summaryPattern = /Summary:\s*(.+?)(?=\n|Source:|Headline:|$)/gi
    const sourcePattern = /Source:\s*(.+?)(?=\n|URL:|Headline:|$)/gi
    const urlPattern = /URL:\s*(https?:\/\/[^\s\n]+)/gi

    const headlinesMatches = [...text.matchAll(headlinePattern)]
    const summariesMatches = [...text.matchAll(summaryPattern)]
    const sourcesMatches = [...text.matchAll(sourcePattern)]
    const urlsMatches = [...text.matchAll(urlPattern)]

    for (let i = 0; i < Math.max(headlinesMatches.length, summariesMatches.length); i++) {
      const headline = headlinesMatches[i]?.[1]?.trim()
      const summary = summariesMatches[i]?.[1]?.trim()
      const source = sourcesMatches[i]?.[1]?.trim()
      const url = urlsMatches[i]?.[1]?.trim()

      if (headline && summary) {
        headlines.push({
          headline,
          summary,
          source: source || 'News Source',
          url: url || null
        })
      }
    }

    // If structured parsing didn't work, try to extract from paragraphs
    if (headlines.length === 0) {
      const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 20)
      paragraphs.slice(0, 3).forEach((para, index) => {
        const lines = para.split('\n').filter(l => l.trim())
        if (lines.length >= 2) {
          headlines.push({
            headline: lines[0].replace(/^(Headline|Title):\s*/i, '').trim(),
            summary: lines.slice(1).join(' ').replace(/^(Summary|Description):\s*/i, '').trim(),
            source: 'News Source',
            url: null
          })
        }
      })
    }

    return headlines.slice(0, 3) // Limit to 3 headlines
  }

  const handleCountryClick = (country) => {
    console.log('🌍 GlobalCoverage: handleCountryClick called with:', country)
    console.log('🌍 Current state:', { selectedCountry, isLoadingHeadlines, hasHeadlines: !!countryHeadlines })
    
    if (!country) {
      console.error('❌ No country provided to handleCountryClick')
      return
    }
    
    console.log('🌍 Setting selected country to:', country)
    setSelectedCountry(country)
    setCountryHeadlines(null) // Clear previous headlines
    setError(null) // Clear any previous errors
    setIsLoadingHeadlines(true) // Set loading immediately
    console.log('🌍 Starting to fetch headlines for:', country)
    fetchCountryHeadlines(country)
  }

  return (
    <div className="global-coverage">
      <div className="coverage-content">
        {selectedCountry && (
          <div className="coverage-header">
            <p className="selected-country">
              Viewing headlines from: <strong>{selectedCountry}</strong>
            </p>
          </div>
        )}
        <div className="map-section">
          <div style={{ marginBottom: '15px', padding: '15px', background: '#f0f9ff', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '1rem', color: '#1e40af', fontWeight: '600' }}>
              {selectedCountry ? `Viewing headlines from ${selectedCountry}` : 'Click a country on the map to see their headlines'}
            </p>
            {!selectedCountry && (
              <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Each country's news sources may cover this story differently
              </p>
            )}
          </div>
          
          {/* Visual Map - for display only */}
          <div style={{ marginBottom: '20px' }}>
            <WorldMap 
              onCountryClick={handleCountryClick} 
              selectedCountry={selectedCountry}
              countriesWithCoverage={countriesWithCoverage}
            />
          </div>

          {/* Clickable Country List - Hidden but kept as fallback */}
          <div className="country-selector" style={{ display: 'none' }}>
            <h4 style={{ marginBottom: '15px', fontSize: '1.1rem', textAlign: 'center', color: 'var(--text-color)' }}>
              Select a Country:
            </h4>
            <div className="country-buttons-grid">
              {availableCountries.map((country) => {
                const hasCoverage = countriesWithCoverage.has(country)
                const isSelected = selectedCountry === country
                
                return (
                  <button
                    key={country}
                    onClick={() => handleCountryClick(country)}
                    className={`country-button ${isSelected ? 'selected' : ''} ${hasCoverage ? 'has-coverage' : ''}`}
                    disabled={isLoadingHeadlines}
                  >
                    {country}
                    {hasCoverage && <span className="coverage-badge">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        
        {isLoadingHeadlines && (
          <div className="headlines-loading">
            <p>Loading headlines from {selectedCountry}...</p>
          </div>
        )}
        
        {error && (
          <div className="headlines-error">
            <p>{error}</p>
          </div>
        )}
        
        {countryHeadlines && countryHeadlines.headlines.length > 0 && (
          <div className="country-headlines">
            <h4>Headlines from {countryHeadlines.country}:</h4>
            <div className="headlines-list">
              {countryHeadlines.headlines.map((item, index) => (
                <div key={index} className="headline-item">
                  {item.url ? (
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="headline-link"
                    >
                      <h5>{item.headline}</h5>
                    </a>
                  ) : (
                    <h5>{item.headline}</h5>
                  )}
                  <p className="headline-summary">{item.summary}</p>
                  <p className="headline-source">Source: {item.source}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GlobalCoverage

