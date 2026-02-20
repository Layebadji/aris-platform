# ARIS - Bio-Performance Excellence Platform

A luxury health performance dashboard designed exclusively for high-level executives in Dakar. ARIS provides real-time vitality tracking, cognitive performance metrics, and personalized restaurant recommendations optimized for peak performance.

## Design Philosophy: Quiet Luxury

ARIS embodies the "Hermès of Bio-Performance" aesthetic with:

- **Deep Midnight Blue** (#0A192F) background for sophistication
- **Brushed Matte Gold** (#D4AF37) accents for elegance
- Minimalist, spacious layouts with no clutter
- Serif typography (Playfair Display) for headings
- Clean sans-serif (Inter) for data readability

## Core Features

### 1. Secure Authentication Gate
- Passwordless magic link authentication via Supabase
- Exclusive access control
- Secure session management

### 2. Executive Dashboard
- **Vitality Score**: Animated circular gauge showing overall bio-performance
- **Key Metrics**:
  - Cognitive Load (mental performance)
  - Metabolic Stability (metabolic health)
  - Recovery Index (recovery quality)
- Real-time data visualization
- Personalized performance insights

### 3. Privacy & Anonymization Layer
- Row Level Security (RLS) enforced on all tables
- End-to-end data encryption
- Anonymized data processing
- Complete data isolation between users

### 4. Terroir Menu Browser
- Curated dishes from premium Dakar restaurants:
  - Le Lagon
  - Alkimia
- Performance ratings for each dish (0-100)
- Cognitive and recovery indicators
- Metabolic compatibility matching
- Advanced filtering and search

## Tech Stack

- **Framework**: Next.js 13 (App Router)
- **Styling**: Tailwind CSS with custom luxury theme
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth (Magic Links)
- **UI Components**: Shadcn/UI
- **Icons**: Lucide React
- **Typography**: Google Fonts (Inter + Playfair Display)

## Database Schema

### Tables

1. **profiles**
   - User profile information
   - Performance goals and metabolic type
   - Optional display name for privacy

2. **health_logs**
   - Vitality score tracking
   - Cognitive, metabolic, and recovery metrics
   - Timestamped measurements
   - Full RLS protection

3. **recommendations**
   - Restaurant dishes with performance ratings
   - Metabolic compatibility arrays
   - Cognitive and recovery indicators
   - Price tier classification

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Supabase account with database configured

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment variables are pre-configured in `.env`

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

### First-Time Setup

The database schema is already configured with:
- All required tables
- RLS policies for data security
- Sample restaurant recommendations

## Usage

### Authentication Flow

1. Visit the login page at `/auth/login`
2. Enter your executive email address
3. Receive a secure magic link via email
4. Click the link to authenticate
5. Redirected to the dashboard

### Dashboard Navigation

- **Dashboard**: View vitality score and key metrics
- **Terroir**: Browse performance-optimized restaurant menus
- **Profile**: Manage your performance goals (future enhancement)

## Security Features

### Row Level Security (RLS)
All database tables enforce strict RLS policies:
- Users can only access their own data
- Recommendations are read-only for authenticated users
- Profile and health data is completely isolated

### Data Privacy
- Personal health data is anonymized before processing
- No sensitive information stored beyond user_id
- All metrics stored as normalized scores (0-100)

## Mobile-First Design

ARIS is optimized for iPhone 15 Pro with:
- Responsive breakpoints for all screen sizes
- Touch-friendly interface elements
- Native app-like experience
- Smooth animations and transitions

## Color Palette

```css
--midnight-blue: #0A192F    /* Primary background */
--brushed-gold: #D4AF37     /* Accent color */
--card-bg: #151F33          /* Card backgrounds */
--border: #2A3F5F           /* Borders */
```

## Future Enhancements

- Real-time health data sync from wearables
- AI-powered meal recommendations
- Performance trend analytics
- Export health reports
- Booking integration with restaurants
- Personalized nutrition plans

## Architecture Notes

### Code Organization
- `/app` - Next.js App Router pages
- `/components` - Reusable UI components
- `/lib` - Utilities and Supabase client
- `/components/dashboard` - Dashboard-specific components

### Component Structure
- Server Components by default
- Client Components marked with 'use client'
- Modular design for easy maintenance
- Type-safe with TypeScript

## Performance Optimization

- Static page generation where possible
- Optimized images and assets
- Lazy loading for heavy components
- Efficient database queries with proper indexing

## License

Proprietary - ARIS Platform

---

**ARIS** - Where executive performance meets culinary excellence.
