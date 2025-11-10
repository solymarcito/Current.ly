import './Contact.css'

const Contact = () => {
  return (
    <section id="contact" className="contact">
      <div className="container">
        <h2 className="section-title">Contact Us</h2>
        <div className="contact-content">
          <div className="contact-info">
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:hello@currently.com">hello@currently.com</a>
            </p>
            <div className="social-links">
              <a href="https://www.linkedin.com/company/current-ly" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                LinkedIn
              </a>
              <a href="#" className="social-link" aria-label="X (Twitter)">
                X (Twitter)
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact

