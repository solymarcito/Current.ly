import './Testimonials.css'

const Testimonials = () => {
  const testimonials = [
    "I finally understand what's happening in politics without getting overwhelmed.",
    "Current.ly helped me prepare for local elections by explaining issues clearly.",
    "I love that I can read about global events and see how they connect to what's happening in my own country.",
    "As a non-native English speaker, the summaries make complex topics so much easier to follow."
  ]

  return (
    <section id="testimonials" className="testimonials">
      <div className="container">
        <h2 className="section-title">What People Are Saying</h2>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <p className="testimonial-text">"{testimonial}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials

