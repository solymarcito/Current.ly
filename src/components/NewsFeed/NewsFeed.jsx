import { useState, useEffect } from 'react'
import BiasMeter from '../BiasMeter/BiasMeter'
import './NewsFeed.css'

const NewsFeed = ({ articles, readingLevel }) => {
  const [articleBiasData, setArticleBiasData] = useState({})

  // Function to convert bias text to numeric value (0-100)
  const biasTextToValue = (biasText) => {
    if (!biasText) return 50 // Default to center
    
    const bias = biasText.toLowerCase()
    
    // Map bias labels to values
    if (bias.includes('left')) {
      if (bias.includes('extreme') || bias.includes('strong')) return 5
      if (bias.includes('unfair')) return 10
      if (bias.includes('mostly fair') || bias.includes('leans')) return 30
      return 25
    } else if (bias.includes('right')) {
      if (bias.includes('extreme') || bias.includes('strong')) return 95
      if (bias.includes('unfair')) return 90
      if (bias.includes('mostly fair') || bias.includes('leans')) return 70
      return 75
    } else if (bias.includes('center') || bias.includes('neutral') || bias.includes('fair')) {
      return 50
    }
    
    return 50 // Default to center
  }

  // Function to get bias information from RapidAPI
  const getBiasFromAPI = async (url) => {
    try {
      const apiKey = import.meta.env.VITE_RAPIDAPI_KEY
      if (!apiKey || apiKey === 'your_rapidapi_key_here') {
        console.warn('RapidAPI key not configured. Please set VITE_RAPIDAPI_KEY in your .env file.')
        return null
      }

      // Extract domain from URL
      const urlObj = new URL(url)
      const domain = urlObj.hostname.replace('www.', '')

      // Try MBFC data first (Media Bias Fact Check)
      try {
        const response = await fetch(`https://political-bias-database.p.rapidapi.com/MBFCdata`, {
          method: 'GET',
          headers: {
            'x-rapidapi-host': 'political-bias-database.p.rapidapi.com',
            'x-rapidapi-key': apiKey
          }
        })

        if (response.ok) {
          const data = await response.json()
          const source = data.find(item => 
            item.domain?.toLowerCase().includes(domain.toLowerCase()) ||
            item.name?.toLowerCase().includes(domain.toLowerCase())
          )
          if (source) {
            return {
              bias: source.bias || source.political_bias || 'Unknown',
              reliability: source.reliability || source.factual_reporting || 'Unknown',
              source: 'MBFC'
            }
          }
        }
      } catch (error) {
        console.log('MBFC API error:', error)
      }

      // Try AS data (AllSides)
      try {
        const response = await fetch(`https://political-bias-database.p.rapidapi.com/ASdata`, {
          method: 'GET',
          headers: {
            'x-rapidapi-host': 'political-bias-database.p.rapidapi.com',
            'x-rapidapi-key': apiKey
          }
        })

        if (response.ok) {
          const data = await response.json()
          const source = data.find(item => 
            item.domain?.toLowerCase().includes(domain.toLowerCase()) ||
            item.name?.toLowerCase().includes(domain.toLowerCase())
          )
          if (source) {
            return {
              bias: source.bias || source.rating || 'Unknown',
              reliability: source.reliability || 'Unknown',
              source: 'AllSides'
            }
          }
        }
      } catch (error) {
        console.log('AllSides API error:', error)
      }

      return null
    } catch (error) {
      console.error('Error fetching bias data:', error)
      return null
    }
  }

  // Fetch bias data for all articles with URLs
  useEffect(() => {
    const fetchBiasData = async () => {
      const biasData = {}
      const failedUrls = new Set() // Track URLs that failed to find bias
      
      for (const article of articles) {
        if (article.url && !articleBiasData[article.url]) {
          try {
            console.log('Fetching bias for:', article.url)
            const biasInfo = await getBiasFromAPI(article.url)
            if (biasInfo) {
              console.log('Bias info found:', biasInfo)
              biasData[article.url] = {
                biasText: biasInfo.bias,
                biasValue: biasTextToValue(biasInfo.bias),
                reliability: biasInfo.reliability
              }
            } else {
              console.log('No bias info found for:', article.url)
              // Mark as failed so we don't keep trying
              failedUrls.add(article.url)
            }
          } catch (error) {
            console.error('Error fetching bias for', article.url, ':', error)
            failedUrls.add(article.url)
          }
        }
      }
      
      // Store both successful bias data and failed URLs (to prevent retries)
      if (Object.keys(biasData).length > 0) {
        console.log('Setting bias data:', biasData)
        setArticleBiasData(prev => ({ ...prev, ...biasData }))
      }
      
      // Also store failed URLs as null to prevent showing "Loading bias..." forever
      if (failedUrls.size > 0) {
        const failedData = {}
        failedUrls.forEach(url => {
          failedData[url] = null // Mark as attempted but not found
        })
        setArticleBiasData(prev => ({ ...prev, ...failedData }))
      }
    }

    if (articles && articles.length > 0) {
      fetchBiasData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articles])

  if (!articles || articles.length === 0) {
    return null
  }

  return (
    <section id="news-feed" className="news-feed-section">
      <div className="container">
        <div className="news-feed-header">
          <h2 className="section-title">Related News</h2>
          <p className="news-feed-description">
            Discover similar stories and stay informed about related topics.
          </p>
        </div>
        <div className="news-feed-grid">
          {articles.map((article, index) => {
            // Only make clickable if we have a valid URL
            const CardWrapper = article.url && article.url !== '#' ? 'a' : 'div'
            const wrapperProps = article.url && article.url !== '#' 
              ? { 
                  href: article.url, 
                  target: '_blank', 
                  rel: 'noopener noreferrer' 
                }
              : {}
            
            return (
              <CardWrapper
                key={index}
                {...wrapperProps}
                className="news-feed-card"
              >
              {article.image && (
                <div className="news-feed-image-container">
                  <img 
                    src={article.image} 
                    alt={article.title || 'News article'}
                    className="news-feed-image"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              )}
              <div className="news-feed-content">
                {article.title && (
                  <h3 className="news-feed-title">{article.title}</h3>
                )}
                <p className="news-feed-summary">{article.summary}</p>
                <div className="news-feed-meta">
                  <div className="news-feed-source-wrapper">
                    {article.source && (
                      <p className="news-feed-source">Source: {article.source}</p>
                    )}
                  </div>
                  {article.url && articleBiasData[article.url] && (
                    <div className="news-feed-bias">
                      <BiasMeter 
                        value={articleBiasData[article.url].biasValue}
                        country="feed" // Pass a value to disable animation
                      />
                    </div>
                  )}
                </div>
                {!article.url && (
                  <p className="news-feed-no-link">Link not available</p>
                )}
              </div>
            </CardWrapper>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default NewsFeed

