import Logo from '../Logo/Logo'
import './Hero.css'

const Hero = () => {
  return (
    <section id="home" className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="logo-placeholder">
            <Logo size="large" />
          </div>
          <h1 className="hero-title">Trustworthy News, Simplified</h1>
          <p className="hero-description">
            Currently is an AI powered chatbot that aggregates trustworthy global and local news, 
            summarizes stories in plain language, and explains how they connect to politics, 
            policies, and civic life. The simplified format also makes it easier to translate 
            news into other languages, ensuring accessibility for a wider audience. We want to 
            remove bias and complexity from today's media environment. Current.ly will provide 
            neutral, easy to read summaries of top stories, keeping users informed and not overwhelmed.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Hero

