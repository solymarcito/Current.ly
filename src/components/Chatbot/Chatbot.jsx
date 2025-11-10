import { useState, useRef, useEffect } from 'react'
import './Chatbot.css'

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Current.ly, your AI news assistant. I can help you understand current events, summarize news stories, and explain how they connect to politics and policies. What would you like to know?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputValue
    setInputValue('')
    setIsLoading(true)

    try {
      // Format messages for Perplexity API
      const apiMessages = messages
        .filter(msg => msg.sender !== 'bot' || msg.id !== 1) // Exclude initial greeting
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))
      
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

      // Call Perplexity API
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar', // Use 'sonar pro' for better quality, 'sonar reasoning' for complex analysis, or 'sonar deep research' for comprehensive reports
          messages: [
            {
              role: 'system',
              content: 'You are Current.ly, an AI news assistant that helps users understand current events, summarizes news stories in plain language, and explains how they connect to politics, policies, and civic life. Provide clear, unbiased, and accessible explanations.'
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
      const botResponse = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error calling Perplexity API:', error)
      const errorMessage = {
        id: messages.length + 2,
        text: `Sorry, I encountered an error: ${error.message}. Please make sure your API key is configured correctly.`,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Chat Button */}
      <button 
        className={`chatbot-button ${isOpen ? 'open' : ''}`}
        onClick={handleToggle}
        aria-label="Open chatbot"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
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
          </div>
          
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                <div className="message-content">
                  <p>{message.text}</p>
                </div>
              </div>
            ))}
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
          </form>
        </div>
      )}
    </>
  )
}

export default Chatbot

