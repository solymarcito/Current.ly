import { useEffect } from 'react'
import './AccessibleLanguageModal.css'

const AccessibleLanguageModal = ({ onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content accessible-language-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          &times;
        </button>
        <h2>Accessible Language Mode</h2>
        <div className="accessible-language-content">
          <p className="intro-text">
            Accessible Language Mode provides simplified summaries with keyword definitions to make news more understandable for everyone, regardless of reading level or English proficiency.
          </p>
          
          <div className="features-list">
            <div className="feature-item">
              <h3>Simplified Summaries</h3>
              <p>Complex news stories are broken down into clear, easy-to-understand language without changing the facts.</p>
            </div>
            
            <div className="feature-item">
              <h3>Keyword Definitions</h3>
              <p>Important terms and concepts are explained in simple language, helping you understand the full context of the story.</p>
            </div>
            
            <div className="feature-item">
              <h3>Plain Language</h3>
              <p>We use everyday words and short sentences to make complex topics accessible to everyone.</p>
            </div>
          </div>

          <div className="example-section">
            <h3>Example</h3>
            <div className="example-box">
              <p><strong>Original:</strong> "The legislature passed a bipartisan bill addressing fiscal policy."</p>
              <p><strong>Accessible:</strong> "Lawmakers from both parties agreed on a new law about government money. <em>Legislature</em> means the group of people who make laws. <em>Bipartisan</em> means both political parties worked together. <em>Fiscal policy</em> means how the government manages money."</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccessibleLanguageModal

