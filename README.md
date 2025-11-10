# Current.ly

A modern React application for Current.ly - an AI-powered chatbot that aggregates trustworthy global and local news, summarizes stories in plain language, and explains how they connect to politics, policies, and civic life.

## Features

- **AI Chatbot**: Interactive chatbot powered by Perplexity AI for real-time news assistance
- **Personalized Feed**: Option to focus on topics like environment, tech, or global politics
- **Accessible Language Mode**: Simplified summaries with keyword definitions
- **Global Coverage by Country**: Explore how different nations report on the same issue
- **Adjustable Reading Difficulty**: Users can pick their desired reading level
- **Bias Transparency Meter**: Visual gauge indicating how partisan a story might be based on its sources

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **CSS Modules** - Component-scoped styling
- **ESLint** - Code quality and linting

## Getting Started

### Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your Perplexity API key:
   ```
   VITE_PERPLEXITY_API_KEY=your_perplexity_api_key_here
   ```
   - Get your API key from: https://www.perplexity.ai/settings/account

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── Navbar/         # Navigation component
│   ├── Hero/           # Hero section
│   ├── About/          # About section
│   ├── Features/       # Features section
│   ├── Testimonials/   # Testimonials section
│   ├── Team/           # Team section
│   ├── Contact/        # Contact section
│   ├── FAQ/            # FAQ section
│   ├── Footer/         # Footer component
│   ├── BiasMeter/      # Bias meter component
│   └── ReadingLevelModal/ # Reading level modal
├── styles/             # Global styles
├── App.jsx            # Main app component
└── main.jsx           # Entry point
```

## Development

The project uses:
- **Vite** for fast HMR (Hot Module Replacement)
- **ESLint** for code quality
- **CSS Variables** for theming
- **Responsive Design** with mobile-first approach

## Mission

To make trustworthy, unbiased news understandable for everyone.

## Values

- **Clarity**: Accessible to anyone regardless of reading level or English proficiency
- **Neutrality**: Summarize from multiple sources to present a balanced factual newsfeed
- **Transparency**: Show readers where information comes from and indicate bias
- **Empathy**: Remember behind all these headlines are real people and real events

## Contact

Email: hello@currently.com

## License

Copyright © 2024 Current.ly. All rights reserved.
