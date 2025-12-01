import { useState } from 'react'
import './FAQ.css'

const FAQ = () => {
  const [openIndices, setOpenIndices] = useState(new Set())

  const faqs = [
    {
      question: 'Do I have to pay for this?',
      answer: 'This service is available free of charge'
    },
    {
      question: 'Where can I access this service?',
      answer: 'Current.ly is accessible online and we hope to develop a mobile app in the future for easy access'
    },
    {
      question: 'How does the Bias Transparency Meter work?',
      answer: 'Each story is evaluated using a source-comparison model. The meter indicates whether an article leans more left, right, or remains neutral, helping users see where coverage may differ.'
    },
    {
      question: 'Can I access news from different countries?',
      answer: 'Yes, Current.ly curates global coverage, allowing you to explore news from multiple regions and compare how stories are reported around the world.'
    }
  ]

  const toggleFaq = (index) => {
    setOpenIndices(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  return (
    <section id="faq" className="faq">
      <div className="container">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((faq, index) => {
            const isOpen = openIndices.has(index)
            return (
              <div key={index} className="faq-item">
                <button
                  className={`faq-question ${isOpen ? 'open' : ''}`}
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <span className="faq-icon">{isOpen ? '−' : '+'}</span>
                </button>
                <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FAQ

