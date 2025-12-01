import GlobalCoverage from '../GlobalCoverage/GlobalCoverage'
import BiasMeter from '../BiasMeter/BiasMeter'
import './Features.css'

const Features = ({ onAdjustReadingLevel, onOpenAccessibleLanguage }) => {
  const features = [
    {
      title: 'Personalized Feed',
      description: 'Option to focus on topics like environment, tech, or global politics.'
    },
    {
      title: 'Adjustable Reading Difficulty',
      description: 'Users can pick their desired reading level'
    },
    {
      title: 'Global Coverage by Country',
      description: 'See how news is reported differently around the world. Click any country on the map to view headlines from their local news sources about the current topic, helping you understand diverse perspectives and cultural viewpoints.',
      isGlobalCoverage: true
    }
  ]

  const futureSteps = [
    {
      title: 'Accessible Language Mode',
      description: 'Simplified summaries with keyword definitions'
    },
    {
      title: 'Bias Transparency Meter',
      description: 'Visual gauge indicating how partisan a story might be based on its sources.',
      isBiasMeter: true
    }
  ]

  return (
    <section id="features" className="features">
      <div className="container">
        <h2 className="section-title">Features</h2>
        <ul className="features-list">
          {features.map((feature, index) => (
            <li key={index} className={`feature-item ${feature.isGlobalCoverage ? 'feature-item-full' : ''}`}>
              <div className="feature-content">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
              {feature.isGlobalCoverage ? (
                <div className="global-coverage-demo">
                  <GlobalCoverage />
                </div>
              ) : null}
            </li>
          ))}
        </ul>

        <div className="future-steps">
          <h2 className="section-title">Coming Soon</h2>
          <ul className="features-list">
            {futureSteps.map((feature, index) => (
              <li key={index} className={`feature-item ${feature.isBiasMeter ? 'feature-item-with-demo' : ''}`}>
                <div className="feature-content">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
                {feature.isBiasMeter ? (
                  <div className="bias-meter-demo">
                    <BiasMeter />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default Features

