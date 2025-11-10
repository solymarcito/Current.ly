import './Logo.css'

const Logo = ({ size = 'medium' }) => {
  return (
    <div className={`logo logo-${size}`}>
      <svg viewBox="0 0 100 100" className="logo-svg">
        {/* Letter C - bold, stylized */}
        <path
          d="M 50 15 C 25 15, 15 25, 15 50 C 15 75, 25 85, 50 85"
          stroke="currentColor"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Clock face inside C */}
        <g transform="translate(50, 50)">
          {/* Clock center dot */}
          <circle cx="0" cy="0" r="2.5" fill="currentColor" />
          
          {/* Clock hands - thin, black */}
          {/* Short hand pointing to 1 o'clock (upper right) - 30 degrees from vertical */}
          <line
            x1="0"
            y1="0"
            x2="10"
            y2="-17.32"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          
          {/* Long hand pointing to 4 o'clock (lower right) - 120 degrees from vertical */}
          <line
            x1="0"
            y1="0"
            x2="17.32"
            y2="10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      </svg>
      <span className="logo-text">Current.ly</span>
    </div>
  )
}

export default Logo

