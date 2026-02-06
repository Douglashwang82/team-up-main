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

  // Backgrounds (溫暖背景)
  // base: "#fef2de",
  base: "#fef2de",
  cardbase: "#f4eae1",

  // Legacy (for compatibility)
  tertiary: "#FADDC3",
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
    warmTech: ["#F97316", "#FB923C"],      // 橙色漸層
    coolAccent: ["#3B82F6", "#0EA5E9"],    // 藍色漸層
    sunset: ["#F97316", "#EC4899"],        // 日落漸層
    ocean: ["#06B6D4", "#3B82F6"],         // 海洋漸層
    // Fitness App Inspired - Warm Coral/Pink
    warmCoral: ["#4f0c20ff", "#8B1538", "#E85D75", "#FF9A8A"], // Deep burgundy -> coral -> light pink
    coralGlow: ["#FF6B6B", "#FFA07A", "#FFB6C1"], // Bright coral tones
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
      primary: "#F97316", // Retain Brand Orange
      glow: "#fdba74",    // Orange Glow
      cyan: "#22d3ee",    // Cyber Cyan
      purple: "#a855f7",  // Cyber Purple
      rose: "#fb7185",    // Cyber Rose
      coral: "#FF6B6B",   // Coral accent
      peach: "#FFA07A",   // Peach accent
    },
    glass: {
      border: "rgba(255, 255, 255, 0.15)",
      borderHighlight: "rgba(255, 255, 255, 0.3)",
      surface: "rgba(20, 20, 25, 0.6)",
      warmSurface: "rgba(255, 107, 107, 0.15)", // Warm coral tint
    }
  }
};
