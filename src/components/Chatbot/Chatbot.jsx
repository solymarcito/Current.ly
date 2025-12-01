import { useState, useRef, useEffect } from 'react'
import BiasMeter from '../BiasMeter/BiasMeter'
import GlobalCoverage from '../GlobalCoverage/GlobalCoverage'
import './Chatbot.css'

const Chatbot = ({ readingLevel, onAdjustReadingLevel, onRelatedNewsUpdate }) => {
  const [mode, setMode] = useState('digest') // 'digest' or 'article'
  
  const topics = [
    { value: '', label: 'Select a topic...' },
    { value: 'economics', label: 'Economics' },
    { value: 'weather', label: 'Weather' },
    { value: 'politics', label: 'Politics' },
    { value: 'technology', label: 'Technology' },
    { value: 'health', label: 'Health' },
    { value: 'sports', label: 'Sports' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'science', label: 'Science' },
    { value: 'business', label: 'Business' },
    { value: 'international', label: 'International News' }
  ]

  const readingLevelLabels = {
    'elementary': 'Elementary (Grade 1-3)',
    'middle': 'Middle School (Grade 4-6)',
    'high': 'High School (Grade 7-9)',
    'adult': 'Adult (Grade 10+)'
  }

  const [selectedTopic, setSelectedTopic] = useState('')
  const [articleUrl, setArticleUrl] = useState('')
  const [currentArticleBias, setCurrentArticleBias] = useState(null) // Store bias for current article
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Current.ly, your AI news assistant. Choose a mode above to get started!",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const urlInputRef = useRef(null)


  // Function to parse articles from text response
  const parseArticlesFromText = (text) => {
    const articles = []
    
    // First, try to parse structured format (Title:, URL:, Summary:, Source:)
    // Handle variations: with/without newlines, different spacing
    const structuredPatterns = [
      // Pattern 1: Strict format with newlines
      /Title:\s*([^\n]+)\nURL:\s*(https?:\/\/[^\s\n]+)\nSummary:\s*([^\n]+(?:\n[^\n]+)*?)\nSource:\s*([^\n]+)/gi,
      // Pattern 2: With spaces instead of newlines
      /Title:\s*([^\n]+?)\s+URL:\s*(https?:\/\/[^\s\n]+)\s+Summary:\s*([^\n]+?)\s+Source:\s*([^\n]+)/gi,
      // Pattern 3: More flexible - allow any whitespace
      /Title:\s*([^\n]+?)(?:\s+|\n)URL:\s*(https?:\/\/[^\s\n]+)(?:\s+|\n)Summary:\s*([^\n]+(?:\n[^\n]+)*?)(?:\s+|\n)Source:\s*([^\n]+)/gi
    ]
    
    for (const structuredPattern of structuredPatterns) {
      let structuredMatch
      while ((structuredMatch = structuredPattern.exec(text)) !== null) {
        const title = structuredMatch[1].trim()
        let url = structuredMatch[2].trim()
        const summary = structuredMatch[3].trim()
        const source = structuredMatch[4].trim()
        
        // Skip if title or summary contains "Title:" or "URL:" (bad parsing)
        if (title.includes('Title:') || title.includes('URL:') || 
            summary.includes('Title:') || summary.includes('URL:')) {
          continue
        }
        
        // Clean up URL
        url = url.replace(/[.,;!?]+$/, '')
        
        // Validate URL
        let validUrl = null
        try {
          const urlObj = new URL(url)
          if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
            validUrl = url
          }
        } catch (e) {
          validUrl = null
        }
        
        // Only add if we have title, summary (at least 20 chars), and valid URL
        if (title && title.length >= 10 && 
            summary && summary.length >= 20 && 
            validUrl) {
          articles.push({
            title: title,
            summary: summary,
            source: source || 'News Source',
            url: validUrl,
            image: null
          })
        }
      }
    }
    
    // If we found structured articles, return them (filter duplicates by URL)
    if (articles.length > 0) {
      const uniqueArticles = []
      const seenUrls = new Set()
      for (const article of articles) {
        if (article.url && !seenUrls.has(article.url)) {
          seenUrls.add(article.url)
          uniqueArticles.push(article)
        }
      }
      return uniqueArticles.slice(0, 3)
    }
    
    // Otherwise, try to parse unstructured format
    // Extract all URLs first
    const allUrls = []
    const urlPattern = /(https?:\/\/[^\s\)]+)/gi
    let urlMatch
    while ((urlMatch = urlPattern.exec(text)) !== null) {
      let url = urlMatch[1].replace(/[.,;!?]+$/, '')
      try {
        const urlObj = new URL(url)
        if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
          allUrls.push(url)
        }
      } catch (e) {
        // Invalid URL, skip
      }
    }
    
    // Split by common patterns that indicate new articles
    let parts = text.split(/(?:Another|A third|A second)\s+(?:recent\s+)?(?:article|story|news|report)\s+/i)
    
    // If that didn't work, try splitting by "One" at the start
    if (parts.length === 1) {
      parts = text.split(/One\s+(?:recent\s+)?(?:article|story|news|report)\s+/i)
    }
    
    // If still no splits, try by sentences that mention sources
    if (parts.length === 1) {
      parts = text.split(/(?=from\s+[A-Z][a-zA-Z\s]+?\s+(?:discusses|highlights|reports|covers))/i)
    }
    
    // If still no splits, try splitting by "Article" or "A recent"
    if (parts.length === 1) {
      parts = text.split(/(?=A\s+recent|Article|Story|News)/i)
    }
    
    // If still no splits, split by URLs
    if (parts.length === 1 && allUrls.length > 0) {
      parts = text.split(new RegExp(`(${allUrls.map(u => u.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'i'))
    }
    
    parts.forEach((part, index) => {
      if (!part.trim()) return
      
      // Extract URL from this part - try multiple patterns
      let url = null
      
      // Try structured patterns first
      const urlPatterns = [
        /URL:\s*(https?:\/\/[^\s\n\)]+)/i,
        /\[URL:\s*(https?:\/\/[^\s\]]+)\]/i,
        /(https?:\/\/[^\s\)]+)/i
      ]
      
      for (const pattern of urlPatterns) {
        const match = part.match(pattern)
        if (match) {
          url = match[1] || match[0]
          url = url.replace(/[.,;!?]+$/, '')
          if (url.startsWith('http')) {
            break
          }
        }
      }
      
      // If no URL found in this part, try to use URLs from the allUrls array
      if (!url && allUrls[index]) {
        url = allUrls[index]
      }
      
      // Extract source name
      const sourcePatterns = [
        /(?:from|in|by|via)\s+([A-Z][a-zA-Z\s]+?)(?:\s+(?:discusses|highlights|reports|covers|including|such as)|\.|,|$)/i,
        /([A-Z][a-zA-Z\s]+?)\s+(?:discusses|highlights|reports|covers)/i,
        /Source:\s*([A-Z][a-zA-Z\s]+?)(?:\.|,|$)/i
      ]
      
      let source = null
      for (const pattern of sourcePatterns) {
        const match = part.match(pattern)
        if (match) {
          source = match[1].trim()
          // Clean up common words
          source = source.replace(/\s+(discusses|highlights|reports|covers|including|such as)$/i, '').trim()
          if (source.length > 50) source = null // Probably not a source name
          if (source) break
        }
      }
      
      // Extract title/headline - look for text before URL or dash
      let title = part.split(/\[URL:|-\s*\[URL:/i)[0].trim()
      if (!title || title.length < 10) {
        title = part.split(/\./)[0].trim()
      }
      
      // Clean up title
      title = title.replace(/^(?:One|Another|A third|A|An)\s+(?:recent\s+)?(?:article|story|news|report)\s+(?:from|in|on|about|discusses|highlights|reports|covers)\s+/i, '')
      title = title.replace(/\s+(?:discusses|highlights|reports|covers|including|such as).*$/i, '')
      title = title.replace(/^(?:from|in|by|via)\s+[A-Z][a-zA-Z\s]+?\s+/i, '')
      title = title.replace(/\s*-\s*$/, '') // Remove trailing dash
      
      // Capitalize first letter
      if (title) {
        title = title.charAt(0).toUpperCase() + title.slice(1)
        if (title.length > 120) {
          title = title.substring(0, 120) + '...'
        }
      }
      
      // Get summary (rest of the text, remove URL and source mentions)
      let summary = part
      if (url) {
        summary = summary.replace(/\[URL:\s*[^\]]+\]/gi, '')
      }
      if (source) {
        summary = summary.replace(new RegExp(`(?:from|in|by|via|Source:)\\s+${source}`, 'gi'), '')
      }
      summary = summary.replace(/^(?:One|Another|A third|A|An)\s+(?:recent\s+)?(?:article|story|news|report)\s+(?:discusses|highlights|reports|covers)\s+/i, '')
      summary = summary.replace(/^[^.]*\.\s*/, '') // Remove first sentence if it's the title
      summary = summary.trim()
      
      // Limit summary length
      if (summary.length > 300) {
        summary = summary.substring(0, 300) + '...'
      }
      
      // Skip if title or summary contains parsing artifacts
      if (title && (title.includes('Title:') || title.includes('URL:') || 
                    title.includes('Summary:') || title.includes('Source:'))) {
        return // Skip this article
      }
      
      if (summary && (summary.includes('Title:') || summary.includes('URL:'))) {
        return // Skip this article
      }
      
      // Only add if we have proper title (at least 10 chars) and summary (at least 20 chars)
      if (title && title.length >= 10 && summary && summary.length >= 20) {
        // Validate URL
        let validUrl = null
        if (url) {
          try {
            // Validate it's a proper URL
            const urlObj = new URL(url)
            if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
              validUrl = url
            }
          } catch (e) {
            // Invalid URL, set to null
            validUrl = null
          }
        }
        
        // Only add if we have a valid URL (required for clickable cards)
        if (validUrl) {
          articles.push({
            title: title,
            summary: summary,
            source: source || 'News Source',
            url: validUrl,
            image: null // Will be fetched or generated later if needed
          })
        }
      }
    })
    
    // If we didn't parse well, try a simpler approach - extract all URLs and create articles
    if (articles.length === 0) {
      // Find all URLs in the text
      const urlPattern = /(https?:\/\/[^\s\)]+)/gi
      const foundUrls = []
      let urlMatch
      while ((urlMatch = urlPattern.exec(text)) !== null) {
        let url = urlMatch[1].replace(/[.,;!?]+$/, '')
        try {
          const urlObj = new URL(url)
          if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
            foundUrls.push(url)
          }
        } catch (e) {
          // Invalid URL, skip
        }
      }
      
      // If we found URLs, try to extract articles around them
      if (foundUrls.length > 0) {
        foundUrls.forEach((url, index) => {
          // Find the context around this URL (a few sentences before and after)
          const urlIndex = text.indexOf(url)
          if (urlIndex !== -1) {
            const start = Math.max(0, urlIndex - 200)
            const end = Math.min(text.length, urlIndex + url.length + 300)
            const context = text.substring(start, end)
            
            // Try to extract title (first sentence or text before URL)
            let title = context.split(url)[0].trim()
            title = title.split(/\.\s+/).pop() || title
            title = title.replace(/^(?:One|Another|A|An)\s+(?:recent\s+)?(?:article|story|news|report)\s+(?:from|in|on|about|discusses|highlights|reports|covers)\s+/i, '')
            title = title.replace(/\s+(?:discusses|highlights|reports|covers).*$/i, '')
            if (title.length > 120) title = title.substring(0, 120) + '...'
            if (!title || title.length < 10) {
              title = `Related News ${index + 1}`
            }
            
            // Extract summary (text after URL, remove source mentions)
            let summary = context.split(url)[1] || context
            summary = summary.replace(/Source:\s*[^\n]+/i, '')
            summary = summary.replace(/from\s+[A-Z][a-zA-Z\s]+/i, '')
            summary = summary.trim()
            if (summary.length > 300) summary = summary.substring(0, 300) + '...'
            
            // Try to extract source
            const sourceMatch = context.match(/Source:\s*([^\n\.]+)/i) || 
                               context.match(/(?:from|in|by|via)\s+([A-Z][a-zA-Z\s]+?)(?:\s+(?:discusses|highlights|reports|covers)|\.|,|$)/i)
            const source = sourceMatch ? sourceMatch[1].trim() : 'News Source'
            
            // Only add if we have proper title and summary, and no parsing artifacts
            if (title && title.length >= 10 && 
                summary && summary.length >= 20 &&
                !title.includes('Title:') && !title.includes('URL:') &&
                !summary.includes('Title:') && !summary.includes('URL:')) {
              articles.push({
                title: title,
                summary: summary,
                source: source,
                url: url,
                image: null
              })
            }
          }
        })
      }
    }
    
    // Filter out articles with parsing artifacts and ensure minimum quality
    const cleanArticles = articles.filter(article => {
      // Must have title and summary
      if (!article.title || article.title.length < 10) return false
      if (!article.summary || article.summary.length < 20) return false
      
      // Must have valid URL (required for clickable cards)
      if (!article.url) return false
      
      // No parsing artifacts
      if (article.title.includes('Title:') || article.title.includes('URL:') ||
          article.summary.includes('Title:') || article.summary.includes('URL:')) {
        return false
      }
      
      return true
    })
    
    // Remove duplicates by URL
    const uniqueArticles = []
    const seenUrls = new Set()
    for (const article of cleanArticles) {
      if (article.url && !seenUrls.has(article.url)) {
        seenUrls.add(article.url)
        uniqueArticles.push(article)
      }
    }
    
    return uniqueArticles.slice(0, 3) // Limit to 3 articles
  }

  // Function to get article image from URL
  const getArticleImage = async (url) => {
    if (!url) return null
    
    try {
      // Try to get Open Graph image via a proxy or direct fetch
      // For now, we'll use a placeholder service or try to extract from URL
      // You can enhance this with services like linkpreview.net, embed.ly, etc.
      
      // Simple approach: try to construct image URL from common patterns
      // Many news sites have predictable image URLs
      const domain = new URL(url).hostname.replace('www.', '')
      
      // Return null for now - can be enhanced with actual image API
      // The NewsFeed component will handle missing images gracefully
      return null
    } catch (error) {
      console.log('Error getting article image:', error)
      return null
    }
  }

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      // Scroll only the messages container, not the entire page
      const messagesContainer = messagesEndRef.current.closest('.chatbot-messages')
      if (messagesContainer) {
        messagesContainer.scrollTo({
          top: messagesContainer.scrollHeight,
          behavior: 'smooth'
        })
      } else {
        // Fallback to scrollIntoView but with block: 'nearest' to prevent page scroll
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (mode === 'digest' && inputRef.current) {
      inputRef.current.focus()
      setCurrentArticleBias(null) // Clear bias when switching to digest mode
    } else if (mode === 'article' && urlInputRef.current) {
      urlInputRef.current.focus()
    }
  }, [mode])

  // Function to check if a topic/question is international/global
  const isInternationalTopic = (topic, question) => {
    const internationalKeywords = ['international', 'global', 'world', 'country', 'countries', 'nation', 'nations', 'foreign', 'overseas', 'abroad']
    const lowerTopic = topic?.toLowerCase() || ''
    const lowerQuestion = question?.toLowerCase() || ''
    
    // Check if topic is "international"
    if (lowerTopic === 'international' || lowerTopic === 'international news') {
      return true
    }
    
    // Check if question contains international keywords
    return internationalKeywords.some(keyword => 
      lowerQuestion.includes(keyword)
    )
  }

  const handleQuickQuestion = async () => {
    if (!selectedTopic || isLoading) return
    
    const topicLabel = topics.find(t => t.value === selectedTopic)?.label.toLowerCase()
    const readingLevelLabel = readingLevelLabels[readingLevel]?.toLowerCase()
    const question = `What's new in ${topicLabel}? Please explain this at a ${readingLevelLabel} reading level.`
    
    // Check if this is an international topic
    const showGlobalCoverage = isInternationalTopic(selectedTopic, question)
    
    // Create a synthetic event and call handleSendMessage
    const syntheticEvent = {
      preventDefault: () => {}
    }
    await handleSendMessage(syntheticEvent, question, false, showGlobalCoverage)
    setInputValue('')
  }

  // Function to get bias information from RapidAPI
  const getBiasFromAPI = async (url) => {
    try {
      const apiKey = import.meta.env.VITE_RAPIDAPI_KEY
      if (!apiKey) {
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
          // Search for the domain in the data
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

  const handleArticleBreakdown = async () => {
    if (!articleUrl.trim() || isLoading) return
    
    const readingLevelLabel = readingLevelLabels[readingLevel]?.toLowerCase()
    
    // Get bias information from API
    const biasInfo = await getBiasFromAPI(articleUrl)
    
    // Store bias info for display
    if (biasInfo) {
      setCurrentArticleBias({
        biasText: biasInfo.bias,
        biasValue: biasTextToValue(biasInfo.bias),
        reliability: biasInfo.reliability,
        source: biasInfo.source
      })
    } else {
      setCurrentArticleBias(null)
    }
    
    let question = `Read the full article at this URL: ${articleUrl}. After reading the complete article, summarize the main story and key details. Explain everything at a ${readingLevelLabel} reading level. Make sure to accurately report what the article says.`
    
    // Don't include bias in the prompt - we'll show it visually instead
    // if (biasInfo) {
    //   question += ` Additionally, include information about the article's bias level. Based on the source, this publication has a bias rating of: ${biasInfo.bias}. ${biasInfo.reliability ? `Reliability rating: ${biasInfo.reliability}.` : ''} Please mention this bias information naturally in your summary.`
    // }
    
    // Check if article topic is international
    const showGlobalCoverage = isInternationalTopic(null, question)
    
    // Create a synthetic event and call handleSendMessage with article mode flag
    const syntheticEvent = {
      preventDefault: () => {}
    }
    await handleSendMessage(syntheticEvent, question, true, showGlobalCoverage)
    setArticleUrl('')
  }

  const handleSendMessage = async (e, customInput = null, isArticleMode = false, showGlobalCoverage = false) => {
    if (e && e.preventDefault) {
      e.preventDefault()
    }
    
    const messageToSend = customInput || inputValue
    if (!messageToSend.trim() || isLoading) return

    const userMessage = {
      id: messages.length + 1,
      text: messageToSend,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = messageToSend
    if (!customInput) {
      setInputValue('')
    }
    setIsLoading(true)

    try {
      // Format messages for Perplexity API - must alternate between user and assistant
      // For simplicity, we'll only send the last conversation turn (last user + assistant pair)
      // plus the current user message
      const apiMessages = []
      
      // Get all messages except the initial greeting
      const relevantMessages = messages
        .filter(msg => msg.sender !== 'bot' || msg.id !== 1) // Exclude initial greeting
      
      // Find the last user message and its corresponding assistant response
      let lastUserIndex = -1
      for (let i = relevantMessages.length - 1; i >= 0; i--) {
        if (relevantMessages[i].sender === 'user') {
          lastUserIndex = i
          break
        }
      }
      
      // If we found a previous user message, include the conversation from that point
      if (lastUserIndex >= 0) {
        // Add the last user message
        apiMessages.push({
          role: 'user',
          content: relevantMessages[lastUserIndex].text
        })
        
        // Add any assistant response that follows (should be the next message)
        if (lastUserIndex + 1 < relevantMessages.length) {
          const assistantMsg = relevantMessages[lastUserIndex + 1]
          if (assistantMsg.sender === 'bot') {
            apiMessages.push({
              role: 'assistant',
              content: assistantMsg.text
            })
          }
        }
      }
      
      // Add current user message
      apiMessages.push({
        role: 'user',
        content: currentInput
      })

      // Get API key from environment variable
      const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY
      
      if (!apiKey) {
        throw new Error('Perplexity API key not found. Please set VITE_PERPLEXITY_API_KEY in your .env file.')
      }

      // Build system prompt with reading level context
      const readingLevelContext = {
        'elementary': 'Use the simplest language possible, with short sentences and basic vocabulary suitable for grades 1-3.',
        'middle': 'Use clear, straightforward language with moderate complexity suitable for grades 4-6.',
        'high': 'Use standard news language suitable for grades 7-9.',
        'adult': 'Use full complexity and original source language suitable for grade 10 and above.'
      }

      let systemPrompt = `You are Current.ly, an AI news assistant that helps users understand current events, summarizes news stories in plain language, and explains how they connect to politics, policies, and civic life. Provide clear, unbiased, and accessible explanations. ${readingLevelContext[readingLevel] || readingLevelContext['middle']}`

      // Add specific instructions for article mode
      if (isArticleMode) {
        systemPrompt += `\n\nCRITICAL: When a user provides a URL to an article, you MUST:
1. FIRST, try to access and read the FULL article content directly from that specific URL
2. If you successfully access the URL, summarize ONLY what is actually written in that specific article - do not use information from other sources
3. If you CANNOT access the URL directly, simply provide information from other trusted news sources about the same story
4. ABSOLUTELY FORBIDDEN: Never say "I'm not able to access", "I cannot access", "I'm unable to access", "I cannot read", "I'm not able to read", or any variation of these phrases
5. ABSOLUTELY FORBIDDEN: Never mention that you're using alternative sources, other sources, or that you couldn't access the URL
6. Do NOT make up information or summarize a different article
7. Accurately report the main story, key facts, and details
8. Write naturally as if you read the article directly - NEVER mention access issues, URL problems, or source transparency
9. Start your response directly with the summary - do not include any disclaimers or explanations about access`
      }

      systemPrompt += `\n\nIMPORTANT FORMATTING RULES:
- Keep responses concise and to the point (aim for 2-4 short paragraphs maximum)
- Do NOT use markdown formatting like **bold** or *italic*
- Do NOT use numbered lists (1., 2., 3., etc.)
- Do NOT use bullet points with dashes or asterisks
- Do NOT include citation numbers or reference markers like [1], [2], [3], etc.
- Write in plain, flowing paragraphs
- Use simple, natural language without formatting symbols or citations`

      // Use sonar pro for article breakdown as it has better URL access capabilities
      const model = isArticleMode ? 'sonar-pro' : 'sonar'

      // Call Perplexity API
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            ...apiMessages
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `API error: ${response.status}`)
      }

      const data = await response.json()
      let botResponse = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
      
      // Remove citation numbers like [1], [2], [3], etc.
      botResponse = botResponse.replace(/\[\d+\]/g, '')
      
      // Remove markdown bold formatting (**text**)
      botResponse = botResponse.replace(/\*\*([^*]+)\*\*/g, '$1')
      
      // Remove markdown italic formatting (*text* or _text_)
      botResponse = botResponse.replace(/\*([^*]+)\*/g, '$1')
      botResponse = botResponse.replace(/_([^_]+)_/g, '$1')
      
      // Remove any mentions of not being able to access URLs or articles
      if (isArticleMode) {
        // Remove common phrases about not being able to access
        botResponse = botResponse.replace(/I'?m\s+not\s+able\s+to\s+access[^.]*\./gi, '')
        botResponse = botResponse.replace(/I\s+cannot\s+access[^.]*\./gi, '')
        botResponse = botResponse.replace(/I'?m\s+unable\s+to\s+access[^.]*\./gi, '')
        botResponse = botResponse.replace(/I\s+cannot\s+read[^.]*\./gi, '')
        botResponse = botResponse.replace(/I'?m\s+not\s+able\s+to\s+read[^.]*\./gi, '')
        botResponse = botResponse.replace(/However,\s+I\s+can\s+tell\s+you[^.]*\./gi, '')
        botResponse = botResponse.replace(/However,\s+based\s+on[^.]*\./gi, '')
        botResponse = botResponse.replace(/based\s+on\s+news\s+reports[^.]*\./gi, '')
        botResponse = botResponse.replace(/from\s+other\s+trusted\s+news\s+sources[^.]*\./gi, '')
        botResponse = botResponse.replace(/using\s+alternative\s+sources[^.]*\./gi, '')
        botResponse = botResponse.replace(/from\s+the\s+URL\s+you\s+provided[^.]*\./gi, '')
        botResponse = botResponse.replace(/directly\s+from\s+that\s+URL[^.]*\./gi, '')
        
        // Remove sentences that start with "However" if they're about access issues
        botResponse = botResponse.replace(/However,\s+I\s+can[^.]*\./gi, '')
        
        // Clean up any double spaces or awkward spacing
        botResponse = botResponse.replace(/\s+/g, ' ').trim()
      }

      // No need to detect bias words or show bias meter - bias info is included in the response
      let finalResponse = botResponse

      // Check if this should show global coverage (if not already set, check the question)
      const shouldShowGlobalCoverage = showGlobalCoverage || isInternationalTopic(selectedTopic, currentInput)
      
      // Store the original question/topic for global coverage
      const originalQuestion = customInput || currentInput
      
      const botMessage = {
        id: messages.length + 2,
        text: finalResponse,
        sender: 'bot',
        timestamp: new Date(),
        isArticleResponse: isArticleMode, // Flag to identify article breakdown responses
        showGlobalCoverage: shouldShowGlobalCoverage, // Flag to show global coverage map
        originalQuestion: originalQuestion, // Store original question for global coverage
        topic: selectedTopic // Store selected topic for global coverage
      }
      
      setMessages(prev => [...prev, botMessage])
      
      // Set loading to false BEFORE fetching similar articles so the typing indicator disappears
      setIsLoading(false)

      // After the main response, fetch similar news articles (in background, no loading indicator)
      if (isArticleMode || currentInput.toLowerCase().includes("what's new") || currentInput.toLowerCase().includes("tell me about")) {
        // Extract topic/keywords from the user's question
        let searchQuery = ''
        if (isArticleMode) {
          // For articles, use the article topic
          searchQuery = `Find 2-3 similar or related news articles about the same topic as: ${currentInput}. Provide brief summaries of each article.`
        } else {
          // For topics, find related news
          const topicMatch = currentInput.match(/what's new in (.+?)\?/i)
          if (topicMatch) {
            searchQuery = `Find 2-3 recent news articles related to ${topicMatch[1]}. Provide brief summaries of each article.`
          } else {
            searchQuery = `Find 2-3 recent news articles related to: ${currentInput}. Provide brief summaries of each article.`
          }
        }

        // Fetch similar articles
        try {
          const readingLevelContext = {
            'elementary': 'Use the simplest language possible, with short sentences and basic vocabulary suitable for grades 1-3.',
            'middle': 'Use clear, straightforward language with moderate complexity suitable for grades 4-6.',
            'high': 'Use standard news language suitable for grades 7-9.',
            'adult': 'Use full complexity and original source language suitable for grade 10 and above.'
          }

          const similarArticlesPrompt = `You are Current.ly, an AI news assistant. ${readingLevelContext[readingLevel] || readingLevelContext['middle']}

Find 2-3 recent news articles that are similar or related to the topic the user just asked about. 

CRITICAL REQUIREMENTS - You MUST follow this exact format for EACH article:

For each article, provide:
1. The article title/headline
2. The COMPLETE, WORKING URL (must start with http:// or https://)
3. A 2-3 sentence summary at ${readingLevelLabels[readingLevel]?.toLowerCase()} reading level
4. The publication/source name

EXACT FORMAT TO USE (repeat for each article):
Title: [Article Title]
URL: [Full URL starting with http:// or https://]
Summary: [2-3 sentences explaining the article]
Source: [Publication Name]

Example:
Title: Tech Industry Sees Major Growth in 2025
URL: https://www.technews.com/articles/2025/tech-growth
Summary: The technology industry has experienced significant expansion this year. Companies are investing heavily in new innovations. This growth is expected to continue into next year.
Source: TechNews

IMPORTANT: 
- You MUST include a real, working URL for each article
- URLs must be complete and clickable (start with http:// or https://)
- Do NOT use placeholder URLs or "example.com"
- If you cannot find a real article URL, do NOT include that article
- Write in plain text, no markdown, no bullet points, no numbers`

          const similarResponse = await fetch('https://api.perplexity.ai/chat/completions', {
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
                  content: similarArticlesPrompt
                },
                {
                  role: 'user',
                  content: searchQuery
                }
              ],
              temperature: 0.7,
              max_tokens: 500,
            }),
          })

          if (similarResponse.ok) {
            const similarData = await similarResponse.json()
            let similarArticles = similarData.choices[0]?.message?.content || ''
            
            // Clean up the response
            similarArticles = similarArticles.replace(/\[\d+\]/g, '')
            similarArticles = similarArticles.replace(/\*\*([^*]+)\*\*/g, '$1')
            similarArticles = similarArticles.replace(/\*([^*]+)\*/g, '$1')
            similarArticles = similarArticles.replace(/_([^_]+)_/g, '$1')

            if (similarArticles.trim()) {
              // Debug: log the raw response
              console.log('Similar articles response:', similarArticles)
              
              // Parse articles from the response
              let parsedArticles = parseArticlesFromText(similarArticles)
              
              // Debug: log parsed articles
              console.log('Parsed articles:', parsedArticles)
              
              // Try to fetch images for articles with URLs
              parsedArticles = await Promise.all(parsedArticles.map(async (article) => {
                if (article.url) {
                  try {
                    // Use a service to get article metadata/thumbnail
                    // For now, we'll try to extract from Open Graph or use a placeholder
                    // You could use services like linkpreview.net, embed.ly, or similar
                    const imageUrl = await getArticleImage(article.url)
                    return { ...article, image: imageUrl }
                  } catch (error) {
                    console.log('Error fetching article image:', error)
                    return article
                  }
                }
                return article
              }))
              
              // Update the news feed component (this will append to existing articles)
              if (onRelatedNewsUpdate && parsedArticles.length > 0) {
                onRelatedNewsUpdate(parsedArticles)
                
                // Add a simple message pointing users to the feed
                setMessages(prev => {
                  const updated = [...prev]
                  const lastMessage = updated[updated.length - 1]
                  if (lastMessage && lastMessage.sender === 'bot') {
                    // Append a simple message about the feed
                    lastMessage.text += '\n\nCheck out below for related news in your feed!'
                  } else {
                    // Fallback: add as new message if last wasn't bot
                    updated.push({
                      id: messages.length + 3,
                      text: 'Check out below for related news in your feed!',
                      sender: 'bot',
                      timestamp: new Date()
                    })
                  }
                  return updated
                })
              }
            }
          }
        } catch (error) {
          console.error('Error fetching similar articles:', error)
          // Don't show error to user, just silently fail
        }
      }
    } catch (error) {
      console.error('Error calling Perplexity API:', error)
      const errorMessage = {
        id: messages.length + 2,
        text: `Sorry, I encountered an error: ${error.message}. Please make sure your API key is configured correctly.`,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      setIsLoading(false)
    }
  }

  return (
    <section id="chatbot" className="chatbot-section">
      <div className="container">
        <div className="chatbot-section-header">
          <h2 className="section-title">Try Current.ly AI</h2>
          <p className="chatbot-section-description">
            Ask me about current events, get news summaries, and understand how stories connect to politics and policies.
          </p>
        </div>
        
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <div className="chatbot-avatar">
                <span>C</span>
              </div>
              <div className="chatbot-header-text">
                <h3>Current.ly AI</h3>
                <p>Your news assistant</p>
              </div>
            </div>
            <div className="chatbot-mode-selector">
              <button
                type="button"
                className={`mode-btn ${mode === 'digest' ? 'active' : ''}`}
                onClick={() => setMode('digest')}
              >
                Digest
              </button>
              <button
                type="button"
                className={`mode-btn ${mode === 'article' ? 'active' : ''}`}
                onClick={() => setMode('article')}
              >
                Article Breakdown
              </button>
            </div>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((message, index) => {
              // Check if this is an article breakdown response and we have bias data
              const showBiasMeter = message.sender === 'bot' && 
                                    message.isArticleResponse && 
                                    currentArticleBias
              
              // Check if this message should show global coverage
              const showGlobalMap = message.sender === 'bot' && message.showGlobalCoverage
              
              return (
                <div 
                  key={message.id} 
                  className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
                >
                  <div className="message-content">
                    <p>{message.text}</p>
                    {showBiasMeter && (
                      <div className="chatbot-article-bias">
                        <div className="chatbot-bias-label">Source Bias:</div>
                        <BiasMeter 
                          value={currentArticleBias.biasValue}
                          country="article"
                        />
                        <div className="chatbot-bias-info">
                          <span className="bias-rating">{currentArticleBias.biasText}</span>
                          {currentArticleBias.reliability && (
                            <span className="bias-reliability">Reliability: {currentArticleBias.reliability}</span>
                          )}
                        </div>
                      </div>
                    )}
                    {showGlobalMap && (
                      <div className="chatbot-global-coverage">
                        <GlobalCoverage 
                          topic={message.topic || selectedTopic}
                          question={message.originalQuestion || message.text}
                          readingLevel={readingLevel}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            {isLoading && (
              <div className="message bot-message">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-form" onSubmit={handleSendMessage}>
            {mode === 'digest' ? (
              <>
                <div className="chatbot-selectors">
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="chatbot-topic-select"
                    disabled={isLoading}
                  >
                    {topics.map((topic) => (
                      <option key={topic.value} value={topic.value}>
                        {topic.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={onAdjustReadingLevel}
                    className="chatbot-reading-level-btn"
                    disabled={isLoading}
                  >
                    {readingLevelLabels[readingLevel]} ▼
                  </button>
                </div>
                <div className="chatbot-input-row">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask me about current events..."
                    className="chatbot-input"
                    disabled={isLoading}
                  />
                  <button 
                    type="submit" 
                    className="chatbot-send-button"
                    disabled={!inputValue.trim() || isLoading}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </div>
                {selectedTopic && (
                  <button
                    type="button"
                    onClick={handleQuickQuestion}
                    className="chatbot-quick-question-btn"
                    disabled={isLoading}
                  >
                    What's new in {topics.find(t => t.value === selectedTopic)?.label}?
                  </button>
                )}
              </>
            ) : (
              <>
                <div className="chatbot-selectors">
                  <input
                    ref={urlInputRef}
                    type="url"
                    value={articleUrl}
                    onChange={(e) => setArticleUrl(e.target.value)}
                    placeholder="Paste article URL here..."
                    className="chatbot-url-input"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={onAdjustReadingLevel}
                    className="chatbot-reading-level-btn"
                    disabled={isLoading}
                  >
                    {readingLevelLabels[readingLevel]} ▼
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleArticleBreakdown}
                  className="chatbot-article-btn"
                  disabled={!articleUrl.trim() || isLoading}
                >
                  Tell me about this article at {readingLevelLabels[readingLevel]?.toLowerCase()} level
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}

export default Chatbot

