import './About.css'

const About = () => {
  const values = [
    {
      title: 'Clarity',
      description: 'Accessible to anyone regardless of reading level or english proficiency. We simplify language without changing the facts'
    },
    {
      title: 'Neutrality',
      description: 'Summarize from multiple sources to present a balanced factual newsfeed'
    },
    {
      title: 'Transparency',
      description: 'Show readers where information comes from and indicate for bias'
    },
    {
      title: 'Empathy',
      description: 'Remember behind all these headlines are real people and real events'
    }
  ]

  return (
    <section id="about" className="about">
      <div className="container">
        <h2 className="section-title">About</h2>
        
        <div className="mission">
          <h3>Mission Statement</h3>
          <p className="mission-statement">To make trustworthy, unbiased news understandable for everyone</p>
        </div>

        <div className="problem">
          <h3>The Current Problem</h3>
          <p>
            In today's digital chaos, people don't just need more news — they need better news delivered 
            more simply. Endless scrolling and partisan feeds make it hard to separate fact from noise. 
            Current.ly changes that by proactively delivering balanced, easy-to-understand summaries to 
            every user, every day.
          </p>
          <p>
            It can be hard to digest current news stories for individuals with limited English proficiency. 
            (54% of adults read below 6th grade level).
          </p>
          <p>
            A survey by the Pew Research Center found in 37 countries (spring 2017) a median of 48% say 
            they "closely follow news about the U.S.", though this is lower than their interest in national 
            news.
          </p>
          <p>
            In a global survey of news topics: across many countries a median of 57% say they follow 
            "news about other countries" closely (versus 86% for news about their own country).
          </p>
          <p>
            A 2022 study found that "of approximately two billion people (age 18+) in the surveyed markets, 
            nearly half consume international news in the English language." It also found that English 
            proficiency plays a key role in how consumers engage with English-language international news.
          </p>
          <p>
            Despite high international readership of English-language news, the widely cited EF Education 
            First English Proficiency Index (EPI) shows that among non-native English speakers there is a 
            global decline in English proficiency.
          </p>
        </div>

        <div className="values">
          <h3>Our Values</h3>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <h4>{value.title}</h4>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default About

