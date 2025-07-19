# ☕ TEA-TIME
**Anonymous Social Network for College Students**

TEA-TIME is a modern, production-ready social networking app that merges the structured layout of Facebook/LinkedIn with the fun, anonymous vibe of a gossip & confessions platform. Built specifically for college students to share gossip, confessions, polls, challenges, and rumors within their verified campus community.

## 🚀 Features

### Core Social Features
- **Anonymous Feed** - Facebook-style scrollable feed with anonymous post cards
- **Post Categories** - Confessions, Polls, Tea/Gossip, Rumors, Challenges, General
- **Interactive Reactions** - 6 reaction types (👍😂😱😠🔥👀) with animated UI
- **Anonymous Comments** - Threaded comment system with anonymous usernames
- **Real-time Sharing** - Share posts with custom deep links

### Special Post Types
- **📊 Polls** - Interactive voting with real-time results and expiration
- **🗣️ Campus Rumor Mill** - Believe/Doubt voting with credibility scoring
- **🎯 Anonymous Challenges** - Confession/Dare/Story challenges with responses
- **☕ Tea Spilling** - Trending gossip with fire reactions

### User Experience
- **🎭 Anonymous Profiles** - Consistent anonymous usernames with generated avatars
- **🏆 Tea Ranking System** - Gamified progression (Freshman → Legend Tea Spiller)
- **🔥 Trending Content** - Algorithm-based trending posts and topics
- **🎓 College Verification** - Email-based campus verification system
- **📱 Modern UI/UX** - Soft color palette (lavender, mint, pink, navy) with beautiful gradients

### Technical Features
- **Cross-Platform** - React Native (iOS + Android + Web)
- **Real-time Backend** - Supabase with PostgreSQL
- **Type Safety** - Full TypeScript implementation
- **State Management** - Zustand with persistence
- **Authentication** - Secure college email verification
- **Media Support** - Image/video uploads with optimization
- **Push Notifications** - Engagement notifications with custom messages

## 📱 Screenshots & UI Flow

### Key Screens
1. **Feed Screen** - Main social feed with post cards and trending toggle
2. **Create Post** - Category selection, media upload, poll/challenge creation
3. **Profile Dashboard** - Anonymous profile with tea points and rankings
4. **Trending** - Hot content leaderboard
5. **Rumor Mill** - Campus rumors with credibility voting
6. **Notifications** - Engagement alerts with humorous messages

## 🛠️ Tech Stack

### Frontend
- **React Native 0.72** - Cross-platform mobile development
- **TypeScript** - Type safety and developer experience
- **React Navigation 6** - Screen navigation and routing
- **Zustand** - Lightweight state management
- **React Hook Form** - Form handling and validation
- **Expo** - Development tooling and web support

### Backend & Database
- **Supabase** - Backend-as-a-service with real-time features
- **PostgreSQL** - Relational database with advanced features
- **Row Level Security** - Database-level security policies
- **Real-time Subscriptions** - Live updates for feeds and reactions
- **Edge Functions** - Serverless functions for complex logic

### UI & Design
- **Custom Design System** - Comprehensive theme with spacing, typography, colors
- **Linear Gradients** - Beautiful gradient backgrounds and buttons
- **Animated Components** - Smooth animations with React Native Animated
- **Vector Icons** - Emoji-based iconography for fun UX
- **Image Handling** - Optimized media upload and display

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- React Native development environment ([setup guide](https://reactnative.dev/docs/environment-setup))
- Supabase account ([signup](https://supabase.com))
- iOS Simulator / Android Emulator or physical device

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/tea-time-app.git
cd tea-time-app
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up the database**
- Create a new Supabase project
- Run the SQL schema from `database/schema.sql` in your Supabase SQL editor
- Configure Row Level Security policies
- Add sample college data

5. **Run the application**

For iOS:
```bash
npx react-native run-ios
```

For Android:
```bash
npx react-native run-android
```

For Web:
```bash
npx expo start --web
```

## 🗄️ Database Schema

The app uses a comprehensive PostgreSQL schema with the following key tables:

### Core Tables
- **`colleges`** - University/college information and verification
- **`users`** - Anonymous user profiles with tea rankings
- **`posts`** - Main content with categories and metadata
- **`reactions`** - User reactions to posts and comments
- **`comments`** - Threaded comment system

### Special Content Tables
- **`polls`** + **`poll_options`** + **`poll_votes`** - Interactive polls
- **`rumors`** + **`rumor_votes`** - Campus rumor mill with credibility
- **`challenges`** + **`challenge_responses`** - Anonymous challenges
- **`notifications`** - User engagement notifications
- **`trending_topics`** - Trending hashtags and topics

### Key Features
- **UUID primary keys** for security
- **Automatic timestamps** for all records
- **Trigger functions** for maintaining counts
- **Indexes** for optimal query performance
- **Views** for complex analytics

## 🎨 Design System

### Color Palette
```typescript
// Primary - Lavender
primary: '#8B5CF6' // Main brand color

// Secondary - Mint Green  
secondary: '#14B8A6' // Accent color

// Tea Colors
tea: {
  hot: '#F59E0B',      // Trending content
  trending: '#EF4444',  // Hot posts
  featured: '#8B5CF6',  // Featured content
  spicy: '#FF6B6B'      // Rumors
}

// Reactions
reactions: {
  like: '#10B981',    // 👍
  laugh: '#F59E0B',   // 😂
  shocked: '#6366F1', // 😱
  angry: '#EF4444',   // 😠
  fire: '#FF4500',    // 🔥
  eyes: '#8B5CF6'     // 👀
}
```

### Typography
- **Font Family**: System fonts for optimal performance
- **Scale**: 12px to 48px with consistent line heights
- **Weights**: Regular (400) to Extra Bold (800)

### Layout System
- **Spacing Scale**: 4px base unit (4, 8, 12, 16, 20, 24...)
- **Border Radius**: 4px to 32px with consistent scaling
- **Shadows**: 5 levels from subtle to prominent
- **Breakpoints**: Responsive design for different screen sizes

## 🔧 Development

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI elements (Button, Avatar, etc.)
│   └── feed/            # Feed-specific components
├── screens/             # Screen components
├── services/            # Backend services and API calls
├── store/              # State management (Zustand)
├── constants/          # Theme, colors, and constants
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── utils/              # Utility functions

database/
└── schema.sql          # Complete database schema

assets/
└── images/             # App images and logos
```

### Key Components
- **`PostCard`** - Main feed post component with reactions
- **`ReactionBar`** - Animated reaction selector
- **`PollComponent`** - Interactive poll with voting
- **`RumorComponent`** - Rumor voting with credibility
- **`ChallengeComponent`** - Challenge responses
- **`Avatar`** - Anonymous avatar generator

### Development Scripts
```bash
# Start development server
npm start

# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm test

# Build for production
npm run build:web      # Web build
npm run build:android  # Android APK
npm run build:ios      # iOS build
```

## 🔐 Security & Privacy

### Anonymous Design
- **No real names** - Only anonymous usernames visible
- **Consistent avatars** - Generated from seed for recognition
- **No direct messaging** - Public-only interactions
- **College verification** - Email verification without exposing identity

### Data Protection
- **Row Level Security** - Database-level access control
- **Encrypted connections** - HTTPS/WSS for all communications
- **Anonymous analytics** - No personally identifiable information
- **Content moderation** - Reporting and review system

## 🚀 Deployment

### Mobile App Stores
1. **iOS App Store**
   - Use Expo Application Services (EAS)
   - Configure app signing and provisioning
   - Submit for review with app metadata

2. **Google Play Store**
   - Build signed APK with EAS
   - Configure Play Console listing
   - Submit for review

### Web Deployment
1. **Vercel/Netlify**
   - Build web version with `expo build:web`
   - Deploy static files to hosting platform
   - Configure environment variables

### Backend Infrastructure
- **Supabase** - Managed backend with automatic scaling
- **CDN** - Image and media delivery
- **Monitoring** - Error tracking and performance monitoring

## 📊 Analytics & Growth

### Key Metrics
- **Daily Active Users** per college
- **Post Engagement** (reactions, comments, shares)
- **Content Categories** popularity
- **Tea Ranking** progression
- **Trending Topics** analysis

### Growth Features
- **Campus onboarding** - Easy college verification
- **Viral content** - Share outside app with previews
- **Gamification** - Tea points and ranking system
- **Push notifications** - Re-engagement campaigns

## 🤝 Contributing

### Guidelines
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards
- **TypeScript** for all new code
- **ESLint** and **Prettier** for formatting
- **Meaningful commits** with conventional commit format
- **Component documentation** with prop types
- **Test coverage** for critical functionality

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Native** community for excellent tooling
- **Supabase** for backend infrastructure
- **Expo** for development experience
- **College students** for inspiration and feedback

---

**Built with ☕ for the next generation of college social networking**

For questions or support, please open an issue or contact the development team. 

