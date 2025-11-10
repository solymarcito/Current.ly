import { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import About from './components/About/About'
import Features from './components/Features/Features'
import Testimonials from './components/Testimonials/Testimonials'
import Team from './components/Team/Team'
import Contact from './components/Contact/Contact'
import FAQ from './components/FAQ/FAQ'
import Footer from './components/Footer/Footer'
import ReadingLevelModal from './components/ReadingLevelModal/ReadingLevelModal'
import AccessibleLanguageModal from './components/AccessibleLanguageModal/AccessibleLanguageModal'
import Chatbot from './components/Chatbot/Chatbot'
import './App.css'

function App() {
  const [isReadingLevelModalOpen, setIsReadingLevelModalOpen] = useState(false)
  const [isAccessibleLanguageModalOpen, setIsAccessibleLanguageModalOpen] = useState(false)
  const [readingLevel, setReadingLevel] = useState('middle')

  const handleOpenReadingLevelModal = () => setIsReadingLevelModalOpen(true)
  const handleCloseReadingLevelModal = () => setIsReadingLevelModalOpen(false)
  const handleOpenAccessibleLanguageModal = () => setIsAccessibleLanguageModalOpen(true)
  const handleCloseAccessibleLanguageModal = () => setIsAccessibleLanguageModalOpen(false)
  const handleSetReadingLevel = (level) => {
    setReadingLevel(level)
    setIsReadingLevelModalOpen(false)
  }

  return (
    <div className="App">
      <Navbar />
      <Hero onAdjustReadingLevel={handleOpenReadingLevelModal} />
      <About />
      <Features 
        onAdjustReadingLevel={handleOpenReadingLevelModal}
        onOpenAccessibleLanguage={handleOpenAccessibleLanguageModal}
      />
      <Testimonials />
      <Team />
      <Contact />
      <FAQ />
      <Footer />
      {isReadingLevelModalOpen && (
        <ReadingLevelModal 
          onClose={handleCloseReadingLevelModal}
          onSelectLevel={handleSetReadingLevel}
          currentLevel={readingLevel}
        />
      )}
      {isAccessibleLanguageModalOpen && (
        <AccessibleLanguageModal 
          onClose={handleCloseAccessibleLanguageModal}
        />
      )}
      <Chatbot />
    </div>
  )
}

export default App

