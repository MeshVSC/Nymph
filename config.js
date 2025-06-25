/* 
=======================================================
NYMPH v2 - CONFIGURATION
=======================================================
Clean, minimal configuration
*/

const NYMPH = {
    // Core Settings
    APP_NAME: 'Nymph',
    PIN: '1700',
    STORAGE_KEY: 'nymphBugTracker',
    
    // Supabase Configuration
    SUPABASE: {
        URL: 'https://supbaincqxpxklccstqa.supabase.co',
        ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1cGJhaW5jcXhweGtsY2NzdHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4ODY1NDcsImV4cCI6MjA2NjQ2MjU0N30.HWt_8OSURp0b-j-jVyXUlI66fRxt3Cr1JAyMI9WAkEw'
    },
    
    // Grid System - Responsive & Proportional
    GRID: {
        BASE_UNIT: 50,        // 1 grid unit = 50px (used everywhere)
        GAP: 25,              // 0.5 base unit
        WIDGET_4x4: 200,      // 4 units × 50px = 200px
        WIDGET_8x4: 400,      // 8 units × 50px = 400px  
        WIDGET_8x8: 400       // 8×8 widget size
    },
    
    // Colors
    COLORS: {
        PRIMARY: '#00ff88',
        ACCENT: '#ffeb3b', 
        ERROR: '#e74c3c',
        SUCCESS: '#27ae60',
        WARNING: '#f39c12'
    },
    
    // Form Fields
    FORMS: {
        BUG: ['featureName', 'expectedBehavior', 'actualBehavior', 'errorCode', 'errorMessage'],
        FEATURE: ['featureName', 'expectedBehavior', 'featureImportance', 'desirability']
    },
    
    // Validation Rules
    VALIDATION: {
        REQUIRED: {
            BUG: ['featureName', 'expectedBehavior', 'actualBehavior'],
            FEATURE: ['featureName', 'expectedBehavior', 'featureImportance', 'desirability']
        },
        MIN_LENGTH: 3
    },
    
    // Status Options
    STATUS: ['Open', 'In Progress', 'Resolved', 'Closed'],
    PRIORITIES: ['Low', 'Normal', 'High', 'Critical']
};

// Freeze config
Object.freeze(NYMPH);