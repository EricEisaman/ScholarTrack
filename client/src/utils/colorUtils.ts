/**
 * Color utility functions for accessibility and contrast calculations
 */

/**
 * Converts a hex color to RGB values
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1] || '0', 16),
    g: parseInt(result[2] || '0', 16),
    b: parseInt(result[3] || '0', 16)
  } : null;
};

/**
 * Calculates the relative luminance of a color
 * Based on WCAG 2.1 guidelines
 */
export const getRelativeLuminance = (r: number, g: number, b: number): number => {
  const rs = r / 255;
  const gs = g / 255;
  const bs = b / 255;
  
  const rsAdjusted = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
  const gsAdjusted = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
  const bsAdjusted = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);
  
  return 0.2126 * rsAdjusted + 0.7152 * gsAdjusted + 0.0722 * bsAdjusted;
};

/**
 * Calculates the contrast ratio between two colors
 * Based on WCAG 2.1 guidelines
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const lum1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Determines if a color combination meets WCAG AA standards
 * Normal text: 4.5:1, Large text: 3:1
 */
export const meetsWCAGAA = (foreground: string, background: string, isLargeText = false): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
};

/**
 * Determines if a color combination meets WCAG AAA standards
 * Normal text: 7:1, Large text: 4.5:1
 */
export const meetsWCAGAAA = (foreground: string, background: string, isLargeText = false): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
};

/**
 * Gets the best text color (black or white) for a given background color
 * Returns the color that provides the highest contrast ratio
 */
export const getBestTextColor = (backgroundColor: string): string => {
  const blackContrast = getContrastRatio('#000000', backgroundColor);
  const whiteContrast = getContrastRatio('#FFFFFF', backgroundColor);
  
  return blackContrast > whiteContrast ? '#000000' : '#FFFFFF';
};

/**
 * Gets an accessible text color for a given background color
 * Ensures WCAG AA compliance for normal text
 */
export const getAccessibleTextColor = (backgroundColor: string): string => {
  const blackContrast = getContrastRatio('#000000', backgroundColor);
  const whiteContrast = getContrastRatio('#FFFFFF', backgroundColor);
  
  // Check if black meets WCAG AA
  if (meetsWCAGAA('#000000', backgroundColor)) {
    return '#000000';
  }
  
  // Check if white meets WCAG AA
  if (meetsWCAGAA('#FFFFFF', backgroundColor)) {
    return '#FFFFFF';
  }
  
  // If neither meets AA, return the one with better contrast
  return blackContrast > whiteContrast ? '#000000' : '#FFFFFF';
};

/**
 * Gets an accessible text color for large text (18pt+ or 14pt+ bold)
 * Uses WCAG AA large text standards (3:1 ratio)
 */
export const getAccessibleLargeTextColor = (backgroundColor: string): string => {
  const blackContrast = getContrastRatio('#000000', backgroundColor);
  const whiteContrast = getContrastRatio('#FFFFFF', backgroundColor);
  
  // Check if black meets WCAG AA for large text
  if (meetsWCAGAA('#000000', backgroundColor, true)) {
    return '#000000';
  }
  
  // Check if white meets WCAG AA for large text
  if (meetsWCAGAA('#FFFFFF', backgroundColor, true)) {
    return '#FFFFFF';
  }
  
  // If neither meets AA, return the one with better contrast
  return blackContrast > whiteContrast ? '#000000' : '#FFFFFF';
};

/**
 * Validates color contrast for accessibility
 * Returns validation result with warnings for poor contrast
 */
export const validateColorContrast = (foreground: string, background: string): {
  isValid: boolean;
  contrastRatio: number;
  meetsAA: boolean;
  meetsAAA: boolean;
  warnings: string[];
} => {
  const contrastRatio = getContrastRatio(foreground, background);
  const meetsAA = meetsWCAGAA(foreground, background);
  const meetsAAA = meetsWCAGAAA(foreground, background);
  
  const warnings: string[] = [];
  
  if (!meetsAA) {
    warnings.push('Color contrast does not meet WCAG AA standards (4.5:1 for normal text)');
  }
  
  if (!meetsAAA) {
    warnings.push('Color contrast does not meet WCAG AAA standards (7:1 for normal text)');
  }
  
  if (contrastRatio < 3) {
    warnings.push('Very low contrast ratio may cause readability issues');
  }
  
  return {
    isValid: meetsAA,
    contrastRatio,
    meetsAA,
    meetsAAA,
    warnings
  };
};
