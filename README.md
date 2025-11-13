# Nymph v2 - Bug Tracker

A modern, responsive bug tracking application with beautiful animated backgrounds, landing page app selection, and intuitive design.

## ✨ Features

### Landing Page (index.html)
- **App Selection Interface**: Beautiful landing page with 5 app cards (JstCode, Spark, StockSentry, Little Art Corner, BizSentry)
- **7-Column CSS Grid System**: Precise positioning with 200px columns and 25px gaps
- **Sequential Text Animations**: Title, subtitle, and description text animate in from different directions
- **Card Entrance Animations**: Cards zoom in from scale(0.1) with random staggered timing
- **Interactive Hover Effects**: Hovered cards zoom in (1.1x) while others randomly scale down (0.78x)
- **Glassmorphism Design**: Cards with backdrop-filter blur and transparent backgrounds

### Dashboard Application (dashboard.html)
- **Animated Background**: Flowing gradient waves with smooth color transitions
- **Dual Navigation**: Top navigation that transforms to side navigation on scroll
- **Dashboard**: Real-time statistics, activity feed, and system status widgets
- **Bug Reports**: Comprehensive bug reporting with validation
- **Feature Requests**: Feature request forms with importance and desirability tracking
- **Data Management**: Supabase cloud storage with localStorage fallback
- **Settings**: PIN-protected settings with data table and controls
- **Responsive Design**: Adapts to any screen size with 4-column grid system
- **Clickable Statistics**: All stat cards navigate to their respective pages

### Bug Reports Page (bug-reports.html)
- **Dedicated Listing**: Separate page for viewing all bug reports
- **Categorized Display**: Open bugs and resolved bugs in separate columns
- **Priority Indicators**: Visual priority indicators (🔴 Critical, 🟠 High, 🟡 Normal, 🟢 Low)
- **Navigation Integration**: Full navigation menu with scroll behavior
- **Real-time Data**: Loads data from Supabase with fallback handling

### Feature Requests Page (feature-requests.html)
- **Dedicated Listing**: Separate page for viewing all feature requests
- **Status Categorization**: Open requests and closed requests in separate columns
- **Priority Indicators**: Visual priority indicators (⭐ Critical, 🔸 High, 🔹 Normal, ◽ Low)
- **Navigation Integration**: Full navigation menu with scroll behavior
- **Real-time Data**: Loads data from Supabase with fallback handling

### ⚠️ TEMPORARY ACCESS CONTROL SIMULATION
**IMPORTANT NOTE FOR FUTURE DEVELOPERS:**
The current click behavior on the landing page is a **TEMPORARY SIMULATION** and must be removed/modified in the future:

- **StockSentry Card**: Currently the only functional card - clicking it makes other cards disappear and navigates to dashboard.html
- **Other Cards** (Spark, JstNotch, Little Art Corner, BizSentry): Show an "Access Denied" popup when clicked
- **This behavior is NOT permanent** - it's only implemented to simulate a working application while other components are being developed
- **Future Implementation**: All cards should navigate to their respective applications when those are built

## 🚀 Quick Start

1. **Open the landing page**
   ```bash
   # Simply open index.html in your browser
   open index.html
   ```

2. **Or serve locally**
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Then visit http://localhost:8000
   ```

## 📁 File Structure

```
Nymph/
├── index.html          # Landing page with app selection
├── dashboard.html      # Main dashboard application
├── bug-reports.html    # Dedicated bug reports listing page
├── feature-requests.html # Dedicated feature requests listing page
├── styles.css          # All CSS styling and animations
├── app.js             # JavaScript functionality with Supabase integration
├── config.js          # Configuration settings including Supabase config
└── README.md          # This file
```

## 🎨 Design System

### Landing Page Grid System
- **7-Column Grid**: 200px columns with 25px gaps (total spacing: 225px)
- **12-Row Grid**: 200px rows with 25px gaps
- **Text Positioning**: Precise grid-based layout with flexbox alignment
- **Card Subgrid**: 5x5 subgrid within main grid for card arrangement

### Typography
- **Title (Nymph)**: 100px, weight 300, SF Pro Display
- **Subtitle**: 28px, weight 350, SF Pro Display
- **Body Text**: 16px, weight 300, SF Pro Text (italic for descriptions)
- **Card Text**: 12px descriptions, 18px titles

### Colors & Effects
- **Dynamic Gradient Background**: Multi-color animated gradient
- **Glassmorphism Cards**: backdrop-filter blur(20px) with transparent backgrounds
- **Status Badges**: Color-coded (Live: green, Beta: blue, Alpha: yellow, Coming Soon: gray)

### Animations
- **Text Sequence**: Staggered 400ms delays with directional entrances
- **Card Entrance**: Random timing with scale(0.1) to scale(1) zoom-in
- **Hover Effects**: Scale(1.1) on hover, random scale(0.78) on others
- **Transitions**: Smooth 0.8s cubic-bezier easing

## 🔧 Usage

### Landing Page
- **App Selection**: Choose from 5 available applications
- **StockSentry**: Functional app - navigates to dashboard with transition animation
- **Other Apps**: Show access denied popup (temporary simulation)

### Dashboard Navigation
- **Statistics Cards**: Click any stat card (Total Bugs, Open, Resolved, New Features) to navigate to reports
- **Action Cards**: Use "View Bug Reports" and "View Features" buttons for direct navigation
- **Notifications**: Click notifications to jump to relevant bug/feature lists
- **Menu**: Top navigation transforms to side navigation on scroll

### Bug Reports Page
- **Dedicated View**: Separate columns for Open Bugs vs Resolved Bugs
- **Visual Priorities**: Color-coded priority indicators for easy scanning
- **Navigation**: Full menu access to return to dashboard or other sections
- **Real-time Data**: Automatically loads and displays current bug reports

### Feature Requests Page
- **Categorized Display**: Open Requests vs Closed Requests in separate columns
- **Priority System**: Visual indicators for feature priority levels
- **Cross-Navigation**: Easy navigation between bug reports and feature requests
- **Live Updates**: Real-time data loading from Supabase

### Bug Report Forms
- **Comprehensive Input**: Feature name, expected/actual behavior, error details
- **Priority Selection**: Low, Normal, High, Critical levels
- **Status Tracking**: Open, In Progress, Needs Verification, Resolved, Closed
- **File Uploads**: Attach supporting files and screenshots

### Feature Request Forms
- **Detailed Specifications**: Feature name, expected behavior, importance ratings
- **Scoring System**: Feature importance and desirability on 1-10 scale
- **Priority Management**: Integrated priority system
- **Documentation**: Rich text descriptions with file attachment support

### Settings & Data Management
- **PIN Protection**: `1700` for accessing sensitive settings
- **Cloud Sync**: Migrate localStorage data to Supabase
- **Data Export**: Download complete data sets as JSON
- **File Management**: View, download, and manage uploaded files
- **Data Security**: Clear all data with PIN confirmation

## 💾 Data Storage

### Supabase Cloud Integration
- **Primary Storage**: Supabase PostgreSQL cloud database
- **Tables**: `bug_reports` and `feature_requests` with proper schema
- **Real-time Sync**: All form submissions save directly to Supabase
- **Fallback Support**: localStorage fallback when Supabase unavailable

### Local Storage Features
- **Migration Tools**: Export/import localStorage data to/from Supabase
- **Backup System**: Export data as JSON for manual backup
- **PIN Protection**: `1700` for accessing sensitive operations
- **File Management**: Upload and manage files locally with size limits

## 🎯 Browser Support

- Modern browsers with CSS Grid support
- Backdrop-filter support for glass morphism effects
- ES6+ JavaScript features

## 🔧 Recent Improvements & Navigation

### Navigation System
- **Cross-Page Navigation**: Seamless navigation between all pages
- **Dashboard Cards**: "View Bug Reports" and "View Features" buttons navigate to dedicated pages
- **Stat Cards**: All dashboard statistics (Total Bugs, Open, Resolved, New Features) are clickable
- **Notifications**: Clickable notifications navigate to relevant bug/feature lists
- **Consistent Menus**: All pages have proper navigation with scroll behavior

### Page Structure Enhancements
- **Dedicated Pages**: Separate bug-reports.html and feature-requests.html pages
- **Proper Data Loading**: Fixed Supabase initialization and data population
- **Menu Consistency**: All pages have Dashboard, Bug Report, Features, and Settings buttons
- **Error Handling**: Graceful fallbacks when data isn't available

### UI/UX Improvements
- **Button Positioning**: Fixed submit/cancel button layout consistency across forms
- **Notification Polish**: Adjusted notification button positioning (5px from edge)
- **Loading States**: Proper loading indicators and empty state handling
- **Visual Hierarchy**: Improved spacing and positioning throughout

### Data Flow Fixes
- **Supabase Integration**: Proper CDN loading and configuration on all pages
- **Initialization**: Fixed app.js loading and data retrieval timing
- **Fallback Handling**: Graceful degradation when services unavailable
- **Cross-Page Data**: Consistent data access across bug-reports and feature-requests pages

## 🔧 Development History

### Landing Page Implementation
1. **Grid System Setup**: Created 7-column x 12-row CSS Grid with 200px units and 25px gaps
2. **Card Layout**: Positioned 5 app cards using subgrid system within main grid
3. **Text Positioning**: Implemented sequential text animations with directional entrances
4. **Card Animations**: Added random entrance timing and hover effects
5. **Access Control**: Implemented temporary simulation with StockSentry as only functional app

### Card Details
- **StockSentry**: 150x150px, positioned at grid 1/3 with 25px translateY
- **Little Art Corner**: 175x175px, positioned at grid 3/3 (largest card)
- **JstNotch**: 150x150px, positioned at grid 3/5, right-aligned
- **Spark**: 150x150px, positioned at grid 5/1 with 25px translateY
- **BizSentry**: 150x150px, positioned at grid 5/3 with 25px translateY

### Text Layout
- **Nymph Title**: Grid 2/2, bottom-aligned with 100px padding
- **Track your nymphs**: Grid 2/3, bottom-aligned with 200px padding
- **Advanced description**: Grid 2/3, top-aligned with proper typography

### Future Cleanup Required
- Remove temporary access control popup system
- Implement proper navigation to individual app pages
- Remove showAccessDenied() and closeAccessDenied() functions
- Update selectApp() function for proper multi-app navigation

---

**Built with ❤️ and modern web technologies**