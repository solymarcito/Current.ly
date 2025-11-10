import { useEffect } from 'react'
import './ReadingLevelModal.css'

const ReadingLevelModal = ({ onClose, onSelectLevel, currentLevel }) => {
  const levels = [
    {
      id: 'elementary',
      title: 'Elementary (Grade 1-3)',
      description: 'Simplest language, short sentences'
    },
    {
      id: 'middle',
      title: 'Middle School (Grade 4-6)',
      description: 'Clear language, moderate complexity'
    },
    {
      id: 'high',
      title: 'High School (Grade 7-9)',
      description: 'Standard news language'
    },
    {
      id: 'adult',
      title: 'Adult (Grade 10+)',
      description: 'Full complexity, original sources'
    }
  ]

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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          &times;
        </button>
        <h2>Adjust Reading Level</h2>
        <div className="reading-levels">
          {levels.map((level) => (
            <button
              key={level.id}
              className={`reading-level-btn ${currentLevel === level.id ? 'active' : ''}`}
              onClick={() => onSelectLevel(level.id)}
            >
              <h4>{level.title}</h4>
              <p>{level.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ReadingLevelModal

