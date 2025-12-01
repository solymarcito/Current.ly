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

  // Map countries to their expected news domain patterns (for validation)
  const countryNewsDomains = {
    'United States': ['cnn.com', 'bbc.com', 'reuters.com', 'nytimes.com', 'washingtonpost.com', 'wsj.com', 'usatoday.com', 'abcnews.go.com', 'nbcnews.com', 'cbsnews.com', 'foxnews.com', 'ap.org'],
    'United Kingdom': ['bbc.co.uk', 'theguardian.com', 'thetimes.co.uk', 'telegraph.co.uk', 'independent.co.uk', 'dailymail.co.uk', 'sky.com', 'itv.com'],
    'Canada': ['cbc.ca', 'theglobeandmail.com', 'ctvnews.ca', 'nationalpost.com', 'cbcnews.ca'],
    'Germany': ['spiegel.de', 'dw.com', 'ard.de', 'zdf.de', 'sueddeutsche.de', 'faz.net', 'welt.de'],
    'France': ['lemonde.fr', 'france24.com', 'lefigaro.fr', 'liberation.fr', 'franceinfo.fr'],
    'Spain': ['elpais.com', 'elmundo.es', 'abc.es', 'rtve.es', 'lavanguardia.com'],
    'Italy': ['repubblica.it', 'corriere.it', 'ansa.it', 'ilsole24ore.com'],
    'Japan': ['nhk.or.jp', 'japantimes.co.jp', 'asahi.com', 'mainichi.jp', 'yomiuri.co.jp'],
    'China': ['xinhuanet.com', 'chinadaily.com.cn', 'scmp.com', 'people.com.cn'],
    'India': ['timesofindia.com', 'hindustantimes.com', 'thehindu.com', 'indiatimes.com', 'ndtv.com'],
    'Australia': ['abc.net.au', 'smh.com.au', 'theaustralian.com.au', 'news.com.au'],
    'Brazil': ['folha.uol.com.br', 'oglobo.globo.com', 'estadao.com.br', 'g1.globo.com'],
    'Mexico': ['eluniversal.com.mx', 'reforma.com', 'jornada.com.mx', 'milenio.com'],
    'Russia': ['rt.com', 'tass.com', 'interfax.ru', 'ria.ru', 'kommersant.ru', 'gazeta.ru'],
    'South Africa': ['news24.com', 'mg.co.za', 'businesslive.co.za'],
    'Nigeria': ['premiumtimesng.com', 'vanguardngr.com', 'thisdaylive.com', 'punchng.com'],
    'Kenya': ['nation.co.ke', 'standardmedia.co.ke', 'businessdailyafrica.com'],
    'Netherlands': ['nos.nl', 'telegraaf.nl', 'volkskrant.nl', 'nrc.nl'],
    'Sweden': ['svt.se', 'dn.se', 'aftonbladet.se', 'expressen.se'],
    'Poland': ['wyborcza.pl', 'rp.pl', 'tvn24.pl', 'onet.pl'],
    'Turkey': ['hurriyet.com.tr', 'sabah.com.tr', 'aa.com.tr', 'sozcu.com.tr'],
    'Israel': ['haaretz.com', 'jpost.com', 'ynet.co.il', 'timesofisrael.com'],
    'South Korea': ['yna.co.kr', 'koreatimes.co.kr', 'chosun.com', 'joongang.co.kr'],
    'Vietnam': ['vnexpress.net', 'tuoitre.vn', 'thanhnien.vn'],
    'Philippines': ['inquirer.net', 'abs-cbn.com', 'gmanetwork.com'],
    'Indonesia': ['kompas.com', 'detik.com', 'tempo.co'],
    'Argentina': ['clarin.com', 'lanacion.com.ar', 'infobae.com'],
    'Chile': ['emol.com', 'latercera.com', 'cnnchile.com'],
    'Colombia': ['eltiempo.com', 'semana.com', 'elespectador.com'],
    'Peru': ['elcomercio.pe', 'larepublica.pe', 'rpp.pe'],
    'Venezuela': ['elnacional.com', 'ultimasnoticias.com.ve'],
    'Greece': ['kathimerini.gr', 'tanea.gr', 'tovima.gr'],
    'Hungary': ['magyarnemzet.hu', 'index.hu', 'hvg.hu'],
    'Lebanon': ['dailystar.com.lb', 'lorientlejour.com', 'annahar.com'],
    'Jordan': ['jordantimes.com', 'alghad.com', 'ammonnews.net'],
    'Tunisia': ['tap.info.tn', 'lapresse.tn'],
    'Senegal': ['lesoleil.sn', 'sudonline.sn'],
    'Ghana': ['graphic.com.gh', 'ghanaiantimes.com.gh', 'myjoyonline.com'],
    'Tanzania': ['thecitizen.co.tz', 'dailynews.co.tz']
  }

  // Check if a URL belongs to a country's news sources
  const isUrlFromCountry = (url, country) => {
    if (!url || !country) return true // If no country specified, allow it (fallback)
    
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.toLowerCase().replace('www.', '')
      const expectedDomains = countryNewsDomains[country] || []
      
      // If we don't have domain mappings for this country, allow the URL (fallback)
      if (expectedDomains.length === 0) {
        return true
      }
      
      // Check if the hostname matches any expected domain for this country
      const matches = expectedDomains.some(domain => {
        const domainClean = domain.toLowerCase().replace('www.', '')
        return hostname === domainClean || hostname.endsWith('.' + domainClean)
      })
      
      // If it matches, return true
      if (matches) return true
      
      // If it doesn't match, check if it's from a known OTHER country's domain (reject those)
      // This prevents cross-country contamination
      const otherCountryDomains = Object.values(countryNewsDomains).flat()
      const isFromOtherCountry = otherCountryDomains.some(domain => {
        const domainClean = domain.toLowerCase().replace('www.', '')
        return hostname === domainClean || hostname.endsWith('.' + domainClean)
      })
      
      // If it's from another known country, reject it
      if (isFromOtherCountry) return false
      
      // If we can't determine, allow it (might be a valid source we don't have in our list)
      return true
    } catch (e) {
      return false
    }
  }

  // Validate URL format and filter out obviously fake URLs
  const isValidUrl = (url) => {
    if (!url) return false
    
    try {
      const urlObj = new URL(url)
      // Check if it's a valid HTTP/HTTPS URL
      if (!['http:', 'https:'].includes(urlObj.protocol)) return false
      
      // Filter out common fake URL patterns
      const fakePatterns = [
        /example\.com/i,
        /placeholder/i,
        /test\.com/i,
        /localhost/i,
        /\.\.\./i, // URLs with multiple dots in domain
      ]
      
      if (fakePatterns.some(pattern => pattern.test(url))) return false
      
      // Must have a valid domain
      if (!urlObj.hostname || urlObj.hostname.length < 4) return false
      
      // Reject URLs that are just homepages or category pages (must have a path with content)
      // Homepage patterns to reject
      const homepagePatterns = [
        /^https?:\/\/[^\/]+\/?$/, // Just domain with no path or just /
        /^https?:\/\/[^\/]+\/index\.(html|php|aspx?)$/i, // Index pages
        /^https?:\/\/[^\/]+\/home/i, // Home pages
        /^https?:\/\/[^\/]+\/category/i, // Category pages
        /^https?:\/\/[^\/]+\/section/i, // Section pages
        /^https?:\/\/[^\/]+\/tag/i, // Tag pages
      ]
      
      if (homepagePatterns.some(pattern => pattern.test(url))) return false
      
      // URL should have a meaningful path (at least some characters after domain)
      const path = urlObj.pathname
      if (!path || path.length < 3 || path === '/') return false
      
      return true
    } catch (e) {
      return false
    }
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

      // Build the search query - make it more specific to the country
      let searchQuery = topic || question || 'current news'
      const countryContext = countryNewsSources[country] || `news sources from ${country}`
      
      // If no specific topic/question, make the search query country-specific
      if (!topic && !question) {
        searchQuery = `current news from ${country}`
      }
      
      const readingLevelContext = {
        'elementary': 'Use the simplest language possible, with short sentences and basic vocabulary suitable for grades 1-3.',
        'middle': 'Use clear, straightforward language with moderate complexity suitable for grades 4-6.',
        'high': 'Use standard news language suitable for grades 7-9.',
        'adult': 'Use full complexity and original source language suitable for grade 10 and above.'
      }

      // Get specific news sources for this country
      const specificSources = countryNewsSources[country] || `news sources from ${country}`
      const expectedDomains = countryNewsDomains[country] || []
      const domainList = expectedDomains.length > 0 ? expectedDomains.join(', ') : 'local news websites'

      const prompt = `You are Current.ly, an AI news assistant. ${readingLevelContext[readingLevel] || readingLevelContext['middle']}

CRITICAL: Find 2-3 recent REAL news headlines and articles FROM ${specificSources} about: ${searchQuery}

ABSOLUTELY MANDATORY REQUIREMENTS:
- The articles MUST be from news sources BASED IN ${country} ONLY
- Acceptable sources include: ${domainList}
- Do NOT include articles from The Times of India, BBC, CNN, Reuters, or any other country's news sources
- If you cannot find articles from ${country} news sources, return fewer articles or none - DO NOT use other countries' sources
- The publication/source name MUST be a ${country} news organization (e.g., ${expectedDomains.slice(0, 3).join(', ')})
- ALL summaries and descriptions MUST be written in ENGLISH, regardless of the source language
- CRITICAL URL REQUIREMENT: ONLY include URLs that are in your search citations/sources AND are from ${country} news websites
- Do NOT write URLs in the text - the system will extract URLs from your citations automatically
- If you do not have a citation URL from a ${country} news source for an article, do NOT include that article
- URLs MUST be direct links to the specific article/headline (not homepage, not category pages)
- Do NOT make up, guess, or construct URLs - only use URLs from your actual search results/citations
- VERIFY that each URL is from a ${country} news website before including it

For each article, provide:
1. The headline/title (must be real and recent, from a ${country} news source ONLY)
2. A brief 1-2 sentence summary IN ENGLISH (translate if necessary)
3. The publication/source name (must be a ${country} news organization - verify this!)
4. DO NOT include a URL line - URLs will be extracted from your citations

Format:
Headline: [Article Headline]
Summary: [1-2 sentence summary IN ENGLISH]
Source: [${country} Publication Name - MUST be from ${country}]

Write in plain text, no markdown, no bullet points. ONLY include articles from ${country} news sources. DO NOT include articles from other countries' media like The Times of India, BBC, CNN, etc. ALL summaries must be in ENGLISH. DO NOT include URL lines - URLs come from citations.`

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
              content: `You are a helpful assistant that finds and summarizes news articles from specific countries. CRITICAL REQUIREMENTS: 1) When asked for news from a country, you MUST only return articles from news sources BASED IN that country. 2) ALL summaries must be written in ENGLISH, regardless of source language. 3) URLs must be direct links to the specific article (not homepage or category pages). 4) Only provide URLs you have verified exist and link directly to the article. Never make up or guess URLs.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000,
          return_citations: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      let headlinesText = data.choices[0]?.message?.content || ''
      
      // Extract citations if available (Perplexity provides real URLs here - these are more reliable)
      // Citations might be in different formats depending on the API version
      let citationUrls = []
      
      // Check for citations in the response (most reliable source)
      // Don't filter by country here - we'll do that when matching to headlines
      if (data.citations && Array.isArray(data.citations)) {
        citationUrls = data.citations.map(citation => {
          if (typeof citation === 'string') return citation
          return citation.url || citation.link || citation
        }).filter(Boolean)
          .filter(url => isValidUrl(url)) // Only keep valid URLs
      }
      
      // Also check for citations in the response metadata
      if (data.response_metadata?.citations) {
        const metadataCitations = data.response_metadata.citations
          .map(c => c.url || c)
          .filter(Boolean)
          .filter(url => isValidUrl(url)) // Only keep valid URLs
        citationUrls = [...citationUrls, ...metadataCitations]
      }
      
      // Also check for citations in the choices (some API versions put them here)
      if (data.choices?.[0]?.citations) {
        const choiceCitations = data.choices[0].citations
          .map(c => c.url || c.link || c)
          .filter(Boolean)
          .filter(url => isValidUrl(url))
        citationUrls = [...citationUrls, ...choiceCitations]
      }
      
      // Remove duplicates
      citationUrls = [...new Set(citationUrls)]
      
      // Clean up the response
      headlinesText = headlinesText.replace(/\[\d+\]/g, '')
      headlinesText = headlinesText.replace(/\*\*([^*]+)\*\*/g, '$1')
      headlinesText = headlinesText.replace(/\*([^*]+)\*/g, '$1')
      
      // Parse headlines from the response
      const headlines = parseHeadlines(headlinesText, citationUrls, country)
      
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

  const parseHeadlines = (text, citationUrls = [], country = null) => {
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
      let url = null
      
      // PRIORITIZE citations over URLs in text (citations are more reliable)
      // Try to match citation URLs to headlines based on source or order
      // IMPORTANT: Only use citations that are from this country's news sources
      if (citationUrls.length > 0) {
        // First, try to use citation URL at the same index (already filtered by country)
        if (citationUrls[i] && isValidUrl(citationUrls[i]) && isUrlFromCountry(citationUrls[i], country)) {
          url = citationUrls[i]
        } else {
          // Try to find a citation URL that matches the source domain
          if (source) {
            const sourceLower = source.toLowerCase()
            const matchingCitation = citationUrls.find(citationUrl => {
              if (!isUrlFromCountry(citationUrl, country)) return false
              try {
                const citationDomain = new URL(citationUrl).hostname.toLowerCase()
                return citationDomain.includes(sourceLower) || sourceLower.includes(citationDomain.replace('www.', ''))
              } catch {
                return false
              }
            })
            if (matchingCitation && isValidUrl(matchingCitation) && isUrlFromCountry(matchingCitation, country)) {
              url = matchingCitation
            }
          }
        }
      }
      
      // Fallback: use URL from text if no citation found (but validate it's from the country)
      if (!url && urlsMatches[i]) {
        const textUrl = urlsMatches[i]?.[1]?.trim()
        if (textUrl && isValidUrl(textUrl) && isUrlFromCountry(textUrl, country)) {
          url = textUrl
        }
      }
      
      // Final validation - only include if it's valid
      // Check country match, but be more lenient - if URL is valid and we can't determine it's from wrong country, allow it
      if (url && !isValidUrl(url)) {
        url = null // Remove invalid URLs
      } else if (url && country && !isUrlFromCountry(url, country)) {
        // Only reject if we're certain it's from the wrong country
        console.log(`Rejecting URL ${url} for country ${country} - doesn't match expected domains`)
        url = null
      }
      
      // Debug: log if we have a valid URL
      if (url) {
        console.log(`✅ Valid URL for ${country}: ${url}`)
      } else if (headline && summary) {
        console.log(`⚠️ No URL for headline: ${headline}`)
      }

      if (headline && summary) {
        headlines.push({
          headline,
          summary,
          source: source || 'News Source',
          url: url || null // Only include valid URLs
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
    
    // Prevent duplicate clicks on the same country
    if (selectedCountry === country && isLoadingHeadlines) {
      console.log('🌍 Already loading headlines for this country, ignoring duplicate click')
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
            <div className="headlines-disclaimer" style={{ 
              marginBottom: '15px', 
              padding: '12px', 
              background: '#fef3c7', 
              borderLeft: '3px solid #f59e0b',
              borderRadius: '4px',
              fontSize: '0.875rem',
              color: '#92400e'
            }}>
              <strong>Note:</strong> Not all links are guaranteed to work. If a link doesn't work, try copying and pasting the headline title into the news outlet's search function.
            </div>
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

