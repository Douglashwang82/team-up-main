import { DefaultTheme as NavDefaultTheme, DarkTheme as NavDarkTheme } from '@react-navigation/native';

export const Colors = {
  // Primary - Warm orange (活力橙)
  primary: "#F97316",

  // Secondary - Tech blue for contrast (科技藍對比色)
  secondary: "#0EA5E9",

  // Accent colors for tech elements (科技感強調色)
  accent: {
    blue: "#3B82F6",      // 科技藍
    teal: "#14B8A6",      // 青綠
    purple: "#8B5CF6",    // 霓虹紫
  },

  // Legacy (for compatibility)
  base: "#FAFAF9", // matches gray.50
  cardbase: "#F5F5F4", // matches gray.100
  tertiary: "#E7E5E4", // matches gray.200
  confirm: "#F97316",

  // Grays (warm tinted for cohesion)
  gray: {
    50: "#FAFAF9",
    100: "#F5F5F4",
    200: "#E7E5E4",
    300: "#D6D3D1",
    400: "#A8A29E",
    500: "#78716C",
    600: "#57534E",
    700: "#44403C",
    800: "#292524",
    900: "#1C1917",
  },

  // Status colors
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    500: "#22c55e",
    700: "#15803d",
  },
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    500: "#ef4444",
    700: "#b91c1c",
  },
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    500: "#f59e0b",
    700: "#b45309",
  },

  // Base
  white: "#ffffff",
  black: "#000000",

  // Gradient presets for tech effects (科技漸層)
  gradients: {
    warmTech: ["#F97316", "#FB923C"],
    coolAccent: ["#3B82F6", "#0EA5E9"],
    sunset: ["#F97316", "#EC4899"],
    ocean: ["#06B6D4", "#3B82F6"],
    warmCoral: ["#4f0c20ff", "#8B1538", "#E85D75", "#FF9A8A"],
    coralGlow: ["#FF6B6B", "#FFA07A", "#FFB6C1"],
  },

  // 2026 Modern Style Palette
  modern: {
    background: "#0f0f13", // Deep Carbon
    surface: "#18181b",    // Lighter Carbon
    text: {
      primary: "#FFFFFF",
      secondary: "rgba(255, 255, 255, 0.7)",
      tertiary: "rgba(255, 255, 255, 0.5)",
    },
    accent: {
      primary: "#F97316",
      glow: "#fdba74",
      cyan: "#22d3ee",
      purple: "#a855f7",
      rose: "#fb7185",
      coral: "#FF6B6B",
      peach: "#FFA07A",
    },
    glass: {
      border: "rgba(255, 255, 255, 0.15)",
      borderHighlight: "rgba(255, 255, 255, 0.3)",
      surface: "rgba(20, 20, 25, 0.6)",
      warmSurface: "rgba(255, 107, 107, 0.15)",
    }
  }
};

// Global App Themes strictly conforming to React Navigation + Custom Extensions
export const LightTheme = {
  ...NavDefaultTheme,
  colors: {
    ...NavDefaultTheme.colors,
    primary: Colors.primary,
    background: "#F3F4F6", // Crisp light gray background
    card: "#FFFFFF",       // Solid white cards/surfaces
    text: "#111827",       // Near black text
    textSecondary: "#6B7280", // Muted gray text
    border: "rgba(0,0,0,0.06)", // Soft light borders
    notification: Colors.error[500],

    // Custom UI Tokens
    icon: "#6B7280",
    pillBg: "rgba(0,0,0,0.04)",
    glassSurface: "rgba(255,255,255,0.9)",
    skeleton: "#E5E7EB",
    inputBg: "#F9FAFB",
    inputBorder: "rgba(0,0,0,0.1)",
  },
};

export const DarkTheme = {
  ...NavDarkTheme,
  colors: {
    ...NavDarkTheme.colors,
    primary: Colors.primary,
    background: "#0f0f13", // Deep Carbon app background
    card: "#18181b",       // Lighter carbon for cards/modals
    text: "#FFFFFF",       // Pure white text
    textSecondary: "#A0AAB5", // Muted light text
    border: "rgba(255,255,255,0.1)", // Crisp soft white borders
    notification: Colors.error[500],

    // Custom UI Tokens
    icon: "#A0AAB5",
    pillBg: "rgba(255,255,255,0.05)",
    glassSurface: "rgba(40,40,45,0.8)",
    skeleton: "#2A2A2E",
    inputBg: "rgba(255,255,255,0.04)",
    inputBorder: "rgba(255,255,255,0.1)",
  },
};
