# Nymph v2 - Bug Tracker

A modern, responsive bug tracking application with beautiful animated backgrounds and intuitive design.

## ✨ Features

- **Animated Background**: Flowing gradient waves with smooth color transitions
- **Dual Navigation**: Top navigation that transforms to side navigation on scroll
- **Dashboard**: Real-time statistics, activity feed, and system status widgets
- **Bug Reports**: Comprehensive bug reporting with validation
- **Feature Requests**: Feature request forms with importance and desirability tracking
- **Data Management**: Local storage with export/import capabilities
- **Settings**: PIN-protected settings with data table and controls
- **Responsive Design**: Adapts to any screen size with 4-column grid system

## 🚀 Quick Start

1. **Open the application**
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
v2/
├── index.html          # Main HTML structure
├── styles.css          # All CSS styling and animations
├── app.js             # JavaScript functionality
├── config.js          # Configuration settings
└── README.md          # This file
```

## 🎨 Design System

- **Grid System**: 50px base units with 25px gaps
- **Typography**: Apple-inspired font hierarchy
- **Colors**: Dynamic gradient background with glass morphism cards
- **Animations**: Smooth 0.8s transitions with cubic-bezier easing

## 🔧 Usage

### Dashboard
- View real-time statistics for bugs and features
- Check recent activity feed
- Monitor system status

### Bug Reports
- Fill out comprehensive bug report forms
- Set priority levels (Low, Normal, High, Critical)
- Include error codes and messages

### Feature Requests
- Request new features with detailed descriptions
- Rate feature importance and desirability
- Track priority levels

### Settings
- **PIN**: `1700` (for accessing settings)
- Export data as JSON
- Clear all data
- View complete data table

## 💾 Data Storage

- All data stored locally in browser localStorage
- No backend required
- Export/import functionality for data backup
- PIN protection for sensitive operations

## 🎯 Browser Support

- Modern browsers with CSS Grid support
- Backdrop-filter support for glass morphism effects
- ES6+ JavaScript features

---

**Built with ❤️ and modern web technologies**