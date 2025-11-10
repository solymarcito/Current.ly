import GlobalCoverage from '../GlobalCoverage/GlobalCoverage'
import BiasMeter from '../BiasMeter/BiasMeter'
import './Features.css'

const Features = ({ onAdjustReadingLevel, onOpenAccessibleLanguage }) => {
  const features = [
    {
      title: 'Personalized Feed',
      description: 'Option to focus on topics like environment, tech, or global politics.',
      buttonText: 'See More Topics',
      action: () => {}
    },
    {
      title: 'Accessible Language Mode',
      description: 'Simplified summaries with keyword definitions',
      buttonText: 'Learn More',
      action: onOpenAccessibleLanguage
    },
    {
      title: 'Adjustable Reading Difficulty',
      description: 'Users can pick their desired reading level',
      buttonText: 'Adjust Reading Level',
      action: onAdjustReadingLevel
    },
    {
      title: 'Bias Transparency Meter',
      description: 'Visual gauge indicating how partisan a story might be based on its sources.',
      isBiasMeter: true
    },
    {
      title: 'Global Coverage by Country',
      description: 'Explore how different nations report on the same issue. Compare international headlines to understand cultural and political perspectives.',
      buttonText: 'Compare Global Coverage',
      action: () => {},
      isGlobalCoverage: true
    }
  ]

  return (
    <section id="features" className="features">
      <div className="container">
        <h2 className="section-title">Features</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className={`feature-card ${feature.isGlobalCoverage ? 'feature-card-full' : ''}`}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              {feature.isGlobalCoverage ? (
                <div className="global-coverage-demo">
                  <GlobalCoverage />
                </div>
              ) : feature.isBiasMeter ? (
                <div className="bias-meter-demo">
                  <BiasMeter />
                </div>
              ) : (
                <button className="btn btn-outline" onClick={feature.action}>
                  {feature.buttonText}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features

