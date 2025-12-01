import { useState, useEffect } from 'react'
import Logo from '../Logo/Logo'
import './Navbar.css'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (e, targetId) => {
    e.preventDefault()
    setIsOpen(false)
    const element = document.getElementById(targetId)
    if (element) {
      const navbarHeight = 70 // Approximate navbar height
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - navbarHeight

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <a 
          href="#home" 
          onClick={(e) => handleNavClick(e, 'home')}
          className="nav-brand"
          style={{ textDecoration: 'none', cursor: 'pointer' }}
        >
          <Logo size="small" />
        </a>
        <ul className={`nav-menu ${isOpen ? 'open' : ''}`}>
          <li><a href="#home" onClick={(e) => handleNavClick(e, 'home')}>Home</a></li>
          <li><a href="#chatbot" onClick={(e) => handleNavClick(e, 'chatbot')}>Try AI</a></li>
          <li><a href="#about" onClick={(e) => handleNavClick(e, 'about')}>About</a></li>
          <li><a href="#features" onClick={(e) => handleNavClick(e, 'features')}>Features</a></li>
          <li><a href="#testimonials" onClick={(e) => handleNavClick(e, 'testimonials')}>Testimonials</a></li>
          <li><a href="#team" onClick={(e) => handleNavClick(e, 'team')}>Team</a></li>
          <li><a href="#contact" onClick={(e) => handleNavClick(e, 'contact')}>Contact</a></li>
          <li><a href="#faq" onClick={(e) => handleNavClick(e, 'faq')}>FAQ</a></li>
        </ul>
        <button 
          className={`nav-toggle ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  )
}

export default Navbar

