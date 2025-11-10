import { useState } from 'react'
import './Team.css'

const TeamMemberCard = ({ member }) => {
  const [imageError, setImageError] = useState(false)
  const hasValidImage = member.profilePic && member.profilePic !== 'https://media.licdn.com/dms/image/placeholder'

  // Use the exact LinkedIn URL as provided
  const linkedInUrl = member.linkedInUrl || '#'

  return (
    <a 
      href={linkedInUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="team-member team-member-link"
    >
      <div className="team-avatar">
        {hasValidImage && !imageError ? (
          <img 
            src={member.profilePic} 
            alt={`${member.name} LinkedIn Profile`} 
            className="team-profile-picture"
            onError={() => setImageError(true)}
          />
        ) : (
          <span>{member.name.split(' ').map(n => n[0]).join('')}</span>
        )}
      </div>
      <h3>{member.name}</h3>
    </a>
  )
}

const Team = () => {
  const teamMembers = [
    {
      name: 'Emma Enkhbold',
      linkedInUrl: 'https://www.linkedin.com/in/emma-enkhbold/', // Update with actual LinkedIn URL
      profilePic: 'https://media.licdn.com/dms/image/placeholder' // Update with actual profile picture URL
    },
    {
      name: 'Marysol Alape Toro',
      linkedInUrl: 'https://www.linkedin.com/in/marysolalape/', // Update with actual LinkedIn URL
      profilePic: 'https://media.licdn.com/dms/image/placeholder' // Update with actual profile picture URL
    },
    {
      name: 'Brendan Schonwetter',
      linkedInUrl: 'https://www.linkedin.com/in/brendan-schonwetter-157a7b290/', // Update with actual LinkedIn URL
      profilePic: 'https://media.licdn.com/dms/image/placeholder' // Update with actual profile picture URL
    },
    {
      name: 'Deven Wagle',
      linkedInUrl: 'https://www.linkedin.com/in/deven-wagle-50bb22275/', // Update with actual LinkedIn URL
      profilePic: 'https://media.licdn.com/dms/image/placeholder' // Update with actual profile picture URL
    },
    {
      name: 'Irene Cui',
      linkedInUrl: 'https://www.linkedin.com/in/icui/', // Update with actual LinkedIn URL
      profilePic: 'https://media.licdn.com/dms/image/placeholder' // Update with actual profile picture URL
    }
  ]

  return (
    <section id="team" className="team">
      <div className="container">
        <h2 className="section-title">Our Team</h2>
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <TeamMemberCard key={index} member={member} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Team

