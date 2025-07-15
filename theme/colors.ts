// theme/colors.ts
export const colors = {
  primary: '#6366F1',        // Modern Indigo
  primaryLight: '#818CF8',   // Light Indigo
  primaryDark: '#4F46E5',    // Dark Indigo
  secondary: '#06B6D4',      // Cyan
  secondaryLight: '#67E8F9', // Light Cyan
  accent: '#F59E0B',         // Amber
  accentLight: '#FCD34D',    // Light Amber
  success: '#10B981',        // Emerald
  successLight: '#6EE7B7',   // Light Emerald
  warning: '#F59E0B',        // Amber
  warningLight: '#FCD34D',   // Light Amber
  danger: '#EF4444',         // Red
  dangerLight: '#FCA5A5',    // Light Red
  
  text: {
    primary: '#111827',      // Gray 900
    secondary: '#374151',    // Gray 700
    tertiary: '#6B7280',     // Gray 500
    quaternary: '#9CA3AF',   // Gray 400
    white: '#FFFFFF',
    inverse: '#F9FAFB',      // Gray 50
  },

  background: {
    primary: '#FFFFFF',      // White
    secondary: '#F9FAFB',    // Gray 50
    tertiary: '#F3F4F6',     // Gray 100
    card: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.6)',
    gradient: {
      primary: ['#6366F1', '#8B5CF6'],     // Indigo to Purple
      secondary: ['#06B6D4', '#3B82F6'],   // Cyan to Blue
      success: ['#10B981', '#059669'],     // Emerald gradient
      danger: ['#EF4444', '#DC2626'],      // Red gradient
    }
  },

  border: {
    light: '#E5E7EB',        // Gray 200
    medium: '#D1D5DB',       // Gray 300
    dark: '#9CA3AF',         // Gray 400
  },

  shadow: {
    light: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.1)',
    dark: 'rgba(0, 0, 0, 0.25)',
  }
};