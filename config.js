/* 
=======================================================
NYMPH BUG TRACKER - CONFIGURATION
=======================================================
Centralized configuration for all magic numbers and settings
*/

const NYMPH_CONFIG = {
    // Grid System
    GRID: {
        BASE_UNIT: 50,              // Base unit in pixels (1 grid unit)
        GAP: 25,                    // Gap between widgets in pixels
        MAX_WIDTH: 16,              // Maximum grid width in units
        WIDGET_SIZES: {
            SMALL: { width: 200, height: 200 },      // 4×4
            MINI: { width: 200, height: 100 },       // 4×2  
            LARGE_8x16: { width: 400, height: 800 }, // 8×16
            LARGE_8x8: { width: 400, height: 400 },  // 8×8
            ACTION: { height: 50 }                   // Action button height
        }
    },

    // Animation Settings
    ANIMATIONS: {
        METEORS: {
            INTERVAL: 2000,           // Meteor creation interval in ms
            SPAWN_CHANCE: 0.3,        // 30% chance per interval
            DURATION_MIN: 3000,       // Minimum meteor fall duration
            DURATION_MAX: 7000,       // Maximum meteor fall duration
            CLEANUP_DELAY: 7000       // Time before meteor removal
        },
        STARS: {
            COUNT: 200,               // Number of stars to create
            SIZES: {
                SMALL_CHANCE: 0.6,    // 60% chance for small stars
                MEDIUM_CHANCE: 0.9,   // 30% chance for medium stars (60-90%)
                // Remaining 10% are large stars
            },
            TWINKLE: {
                MIN_DELAY: 0,         // Minimum animation delay
                MAX_DELAY: 3000,      // Maximum animation delay
                MIN_DURATION: 2000,   // Minimum twinkle duration
                MAX_DURATION: 6000    // Maximum twinkle duration
            }
        },
        GALAXIES: {
            COUNT: 8,                 // Number of galaxies to create
            TYPES: ['spiral', 'elliptical', 'irregular'],
            SIZE: {
                MIN: 100,             // Minimum galaxy size
                MAX: 300,             // Maximum galaxy size (100 + 200)
                HEIGHT_FACTOR: {
                    MIN: 0.6,          // Minimum height ratio
                    MAX: 1.0           // Maximum height ratio (0.6 + 0.4)
                }
            },
            PULSE_DELAY_MAX: 20000    // Maximum animation delay
        },
        SOLAR_SYSTEM: {
            PULSE_DURATION: 4000,     // Solar pulse animation duration
            ROTATE_DURATION: 25000,   // Solar rotation duration
            FLARE_DURATION: 8000,     // Solar flare duration
            PLANETS: {
                COUNT: 5,
                ROTATE_SPEEDS: [15000, 18000, 22000, 25000, 30000] // Planet rotation speeds
            }
        },
        TRANSITIONS: {
            DEFAULT: 300,             // Default transition duration in ms
            SMOOTH: 400,              // Smooth transition duration
            NAVIGATION: 300           // Navigation transition duration
        }
    },

    // Typography Defaults
    TYPOGRAPHY: {
        DEFAULTS: {
            TITLE: { size: 56, weight: 300 },
            SUBTITLE: { size: 28, weight: 350 },
            CARD_TITLE: { size: 24, weight: 300 },
            CARD_SUBTITLE: { size: 15, weight: 400 },
            BUTTON_TITLE: { size: 16, weight: 500 },
            WIDGET_NUMBER: { size: 48, weight: 200 }
        },
        RANGES: {
            TITLE_SIZE: { min: 10, max: 100 },
            SUBTITLE_SIZE: { min: 10, max: 60 },
            CARD_TITLE_SIZE: { min: 10, max: 40 },
            CARD_SUBTITLE_SIZE: { min: 10, max: 30 },
            BUTTON_SIZE: { min: 10, max: 30 },
            WEIGHT: { min: 100, max: 900, step: 50 }
        }
    },

    // Navigation Settings
    NAVIGATION: {
        SCROLL_THRESHOLD: 100,      // Pixels to scroll before switching nav
        TOP_NAV_OFFSET: 40,         // Top navigation offset from top
        SIDE_NAV_OFFSET: 40         // Side navigation offset from right
    },

    // Color System
    COLORS: {
        PRIMARY: '#00ff88',
        PRIMARY_DARK: '#00cc6a',
        ACCENT: '#ffeb3b',
        ACCENT_DARK: '#ffc107',
        STATUS: {
            SUCCESS: '#27ae60',
            WARNING: '#ffeb3b',
            ERROR: '#e74c3c',
            INFO: '#2196f3'
        }
    },

    // Data Management
    DATA: {
        STORAGE_KEY: 'bugTrackerData',
        TYPOGRAPHY_KEY: 'typographySettings',
        DEFAULT_ENTRIES: []
    },

    // Page Configuration
    PAGES: {
        DASHBOARD: {
            id: 'dashboard-section',
            title: 'Bug Tracker',
            subtitle: 'Good Morning Zia!'
        },
        BUG_REPORT: {
            id: 'bug-section',
            title: 'Report Bug',
            subtitle: 'Submit new bug reports and issues'
        },
        FEATURE_REQUEST: {
            id: 'feature-section',
            title: 'Feature Request',
            subtitle: 'Request new features and improvements'
        },
        SETTINGS: {
            id: 'settings-section',
            title: 'Settings',
            subtitle: 'Customize font sizes and weights'
        }
    },

    // Widget Content
    SAMPLE_DATA: {
        ACTIVITY_ENTRIES: [
            {
                avatar: 'B',
                name: 'Login form validation',
                description: 'Bug Report',
                time: '2h'
            },
            {
                avatar: 'F',
                name: 'Dark mode toggle',
                description: 'Feature Request',
                time: '1d'
            },
            {
                avatar: '✓',
                name: 'Password reset',
                description: 'Bug Fixed',
                time: '3d'
            }
        ],
        SYSTEM_STATUS: {
            database: { label: 'Database', value: 85 },
            storage: { label: 'Storage', value: 42 },
            memory: { label: 'Memory', value: 67 }
        }
    },

    // Form Configuration
    FORMS: {
        BUG_REPORT: {
            SEVERITIES: ['Low', 'Medium', 'High', 'Critical'],
            DEFAULT_SEVERITY: 'Medium'
        },
        FEATURE_REQUEST: {
            PRIORITIES: ['Low', 'Medium', 'High'],
            DEFAULT_PRIORITY: 'Medium'
        }
    },

    // Debug Settings
    DEBUG: {
        ENABLED: false,             // Enable debug logging
        LOG_LEVEL: 'info',          // Log level: 'debug', 'info', 'warn', 'error'
        SHOW_GRID_OVERLAY: false,   // Show grid overlay for development
        PERFORMANCE_MONITORING: false // Monitor animation performance
    }
};

// Freeze the configuration to prevent accidental modifications
Object.freeze(NYMPH_CONFIG);

// Export for use in other modules (if using ES6 modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NYMPH_CONFIG;
}