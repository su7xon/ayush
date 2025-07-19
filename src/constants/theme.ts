export const theme = {
  colors: {
    // Primary palette - soft and modern
    primary: {
      50: '#F8F6FF',
      100: '#E9E4FF', 
      200: '#D4C6FF',
      300: '#B8A1FF',
      400: '#9B7BFF',
      500: '#8B5CF6', // Main lavender
      600: '#7C3AED',
      700: '#6D28D9',
      800: '#5B21B6',
      900: '#4C1D95',
    },
    
    // Secondary - mint green
    secondary: {
      50: '#F0FDF9',
      100: '#CCFDF7',
      200: '#99F6E4',
      300: '#5EEAD4',
      400: '#2DD4BF',
      500: '#14B8A6', // Main mint
      600: '#0D9488',
      700: '#0F766E',
      800: '#115E59',
      900: '#134E4A',
    },
    
    // Accent - soft pink
    accent: {
      50: '#FDF2F8',
      100: '#FCE7F3',
      200: '#FBCFE8',
      300: '#F9A8D4',
      400: '#F472B6',
      500: '#EC4899', // Main pink
      600: '#DB2777',
      700: '#BE185D',
      800: '#9D174D',
      900: '#831843',
    },
    
    // Deep navy for contrast
    navy: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B', // Main navy
      900: '#0F172A',
    },
    
    // Semantic colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Tea-specific colors
    tea: {
      hot: '#F59E0B',
      trending: '#EF4444',
      featured: '#8B5CF6',
      spicy: '#FF6B6B',
    },
    
    // Reaction colors
    reactions: {
      like: '#10B981',
      laugh: '#F59E0B', 
      shocked: '#6366F1',
      angry: '#EF4444',
      fire: '#FF4500',
      eyes: '#8B5CF6',
    },
    
    // Background variants
    background: {
      primary: '#FFFFFF',
      secondary: '#F8FAFC',
      tertiary: '#F1F5F9',
      card: '#FFFFFF',
      modal: 'rgba(0, 0, 0, 0.5)',
    },
    
    // Text colors
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
      tertiary: '#94A3B8',
      inverse: '#FFFFFF',
      muted: '#CBD5E1',
    },
    
    // Border colors
    border: {
      light: '#E2E8F0',
      medium: '#CBD5E1',
      dark: '#94A3B8',
    },
    
    // Overlay colors
    overlay: {
      light: 'rgba(0, 0, 0, 0.1)',
      medium: 'rgba(0, 0, 0, 0.3)',
      dark: 'rgba(0, 0, 0, 0.5)',
    },
    
    // Gradient combinations
    gradients: {
      primary: ['#8B5CF6', '#EC4899'],
      secondary: ['#14B8A6', '#3B82F6'],
      trending: ['#EF4444', '#F59E0B'],
      tea: ['#F59E0B', '#EC4899'],
      background: ['#F8F6FF', '#F0FDF9'],
    },
  },
  
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      semiBold: 'System',
      bold: 'System',
    },
    
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
    },
    
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
      loose: 1.8,
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },
  
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
    32: 128,
  },
  
  borderRadius: {
    none: 0,
    sm: 4,
    base: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    base: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 12,
    },
  },
  
  animation: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
  
  layout: {
    breakpoints: {
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200,
    },
    
    container: {
      padding: 16,
      maxWidth: 1200,
    },
    
    header: {
      height: 60,
    },
    
    tabBar: {
      height: 80,
    },
  },
  
  // Component-specific styling
  components: {
    button: {
      height: {
        sm: 36,
        md: 44,
        lg: 52,
      },
      borderRadius: 12,
      fontSize: {
        sm: 14,
        md: 16,
        lg: 18,
      },
    },
    
    input: {
      height: 48,
      borderRadius: 12,
      fontSize: 16,
      borderWidth: 1,
    },
    
    card: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
    },
    
    post: {
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 12,
    },
    
    modal: {
      borderRadius: 20,
      padding: 24,
    },
    
    avatar: {
      size: {
        xs: 24,
        sm: 32,
        md: 40,
        lg: 48,
        xl: 64,
        '2xl': 80,
      },
    },
    
    reaction: {
      size: 32,
      fontSize: 18,
    },
  },
};

export type Theme = typeof theme;

// Helper functions for theme usage
export const getColorWithOpacity = (color: string, opacity: number): string => {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const getReactionColor = (reactionType: string): string => {
  switch (reactionType) {
    case 'like':
      return theme.colors.reactions.like;
    case 'laugh':
      return theme.colors.reactions.laugh;
    case 'shocked':
      return theme.colors.reactions.shocked;
    case 'angry':
      return theme.colors.reactions.angry;
    case 'fire':
      return theme.colors.reactions.fire;
    case 'eyes':
      return theme.colors.reactions.eyes;
    default:
      return theme.colors.text.secondary;
  }
};

export const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'confession':
      return theme.colors.accent[500];
    case 'poll':
      return theme.colors.primary[500];
    case 'tea':
      return theme.colors.tea.hot;
    case 'rumor':
      return theme.colors.tea.spicy;
    case 'challenge':
      return theme.colors.secondary[500];
    default:
      return theme.colors.text.secondary;
  }
};

export const getTeaRankColor = (rank: string): string => {
  if (rank.includes('Freshman')) return theme.colors.navy[400];
  if (rank.includes('Sophomore')) return theme.colors.secondary[500];
  if (rank.includes('Junior')) return theme.colors.primary[500];
  if (rank.includes('Senior')) return theme.colors.accent[500];
  if (rank.includes('Legend')) return theme.colors.tea.trending;
  return theme.colors.text.secondary;
};