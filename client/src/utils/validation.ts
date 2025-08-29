import type { ValidationResult, NameValidationOptions } from '../types'

/**
 * Validates a custom type name against specified rules
 */
export const validateCustomTypeName = (
  name: string,
  options: NameValidationOptions = {},
  existingNames: string[] = []
): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  }

  // Merge with default options
  const validationOptions = {
    minLength: 2,
    maxLength: 50,
    allowSpecialChars: false,
    allowNumbers: true,
    reservedNames: [
      'IN CLASS',
      'RESTROOM',
      'OFFICE',
      'COUNSELOR',
      'LIBRARY',
      'TEACHER VISIT',
      'PHONE OUT IN CLASS',
      'BAD LANGUAGE',
      'OUT OF ASSIGNED SEAT',
      'HORSE PLAY'
    ],
    caseSensitive: false,
    ...options
  }

  // Trim whitespace
  const trimmedName = name.trim()

  // Check if empty
  if (!trimmedName) {
    result.isValid = false
    result.errors.push('Name cannot be empty')
    return result
  }

  // Check minimum length
  if (trimmedName.length < validationOptions.minLength) {
    result.isValid = false
    result.errors.push(`Name must be at least ${validationOptions.minLength} characters long`)
  }

  // Check maximum length
  if (trimmedName.length > validationOptions.maxLength) {
    result.isValid = false
    result.errors.push(`Name cannot exceed ${validationOptions.maxLength} characters`)
  }

  // Check for special characters
  if (!validationOptions.allowSpecialChars) {
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
    if (specialCharRegex.test(trimmedName)) {
      result.isValid = false
      result.errors.push('Name cannot contain special characters')
    }
  }

  // Check for numbers
  if (!validationOptions.allowNumbers) {
    const numberRegex = /\d/
    if (numberRegex.test(trimmedName)) {
      result.isValid = false
      result.errors.push('Name cannot contain numbers')
    }
  }

  // Check for reserved names
  const comparisonName = validationOptions.caseSensitive ? trimmedName : trimmedName.toUpperCase()
  const reservedNames = validationOptions.caseSensitive 
    ? validationOptions.reservedNames 
    : validationOptions.reservedNames.map(n => n.toUpperCase())

  if (reservedNames.includes(comparisonName)) {
    result.isValid = false
    result.errors.push('Name is reserved and cannot be used')
  }

  // Check for duplicate names
  const existingNamesToCheck = validationOptions.caseSensitive 
    ? existingNames 
    : existingNames.map(n => n.toUpperCase())

  if (existingNamesToCheck.includes(comparisonName)) {
    result.isValid = false
    result.errors.push('Name already exists')
  }

  // Check for leading/trailing spaces
  if (trimmedName !== name) {
    result.warnings.push('Leading and trailing spaces will be automatically removed')
  }

  // Check for multiple spaces
  if (/\s{2,}/.test(trimmedName)) {
    result.warnings.push('Multiple consecutive spaces will be normalized to single spaces')
  }

  // Check for common issues
  if (trimmedName.toLowerCase() === 'default' || trimmedName.toLowerCase() === 'none') {
    result.warnings.push('Consider using a more descriptive name')
  }

  return result
}

/**
 * Validates a color value (hex, rgb, or named colors)
 */
export const validateColor = (color: string): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  }

  // Check if empty
  if (!color || color.trim() === '') {
    result.isValid = false
    result.errors.push('Color cannot be empty')
    return result
  }

  const trimmedColor = color.trim()

  // Check for valid hex color
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  if (hexRegex.test(trimmedColor)) {
    return result // Valid hex color
  }

  // Check for valid rgb/rgba color
  const rgbRegex = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/
  if (rgbRegex.test(trimmedColor)) {
    return result // Valid rgb color
  }

  // Check for valid named colors (basic CSS colors)
  const namedColors = [
    'black', 'silver', 'gray', 'white', 'maroon', 'red', 'purple', 'fuchsia',
    'green', 'lime', 'olive', 'yellow', 'navy', 'blue', 'teal', 'aqua',
    'orange', 'pink', 'brown', 'violet', 'indigo', 'coral', 'gold', 'khaki',
    'lavender', 'magenta', 'plum', 'salmon', 'tan', 'turquoise'
  ]

  if (namedColors.includes(trimmedColor.toLowerCase())) {
    return result // Valid named color
  }

  // If none of the above, it's invalid
  result.isValid = false
  result.errors.push('Invalid color format. Use hex (#RRGGBB), rgb(r,g,b), or a valid CSS color name')
  
  return result
}

/**
 * Normalizes a name by removing extra spaces and applying consistent formatting
 */
export const normalizeName = (name: string, options: NameValidationOptions = {}): string => {
  const validationOptions = {
    caseSensitive: false,
    ...options
  }

  let normalized = name.trim()
  
  // Replace multiple spaces with single space
  normalized = normalized.replace(/\s+/g, ' ')
  
  // Apply case formatting
  if (!validationOptions.caseSensitive) {
    // Title case for better readability
    normalized = normalized.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }
  
  return normalized
}

/**
 * Validates a complete custom status type
 */
export const validateCustomStatusType = (
  name: string,
  color: string,
  existingNames: string[] = []
): ValidationResult => {
  const nameValidation = validateCustomTypeName(name, undefined, existingNames)
  const colorValidation = validateColor(color)

  return {
    isValid: nameValidation.isValid && colorValidation.isValid,
    errors: [...nameValidation.errors, ...colorValidation.errors],
    warnings: [...nameValidation.warnings, ...colorValidation.warnings]
  }
}

/**
 * Validates a complete custom teacher event type
 */
export const validateCustomTeacherEventType = (
  name: string,
  existingNames: string[] = []
): ValidationResult => {
  return validateCustomTypeName(name, undefined, existingNames)
}

/**
 * Sanitizes input to prevent XSS and other injection attacks
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

/**
 * Validates that a name follows proper naming conventions
 */
export const validateNamingConvention = (name: string): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  }

  // Check for proper capitalization
  if (name !== name.trim()) {
    result.warnings.push('Name should not have leading or trailing spaces')
  }

  // Check for proper word separation
  if (name.includes('_') || name.includes('-')) {
    result.warnings.push('Consider using spaces instead of underscores or hyphens for better readability')
  }

  // Check for all caps
  if (name === name.toUpperCase() && name.length > 3) {
    result.warnings.push('Consider using title case instead of all caps for better readability')
  }

  // Check for all lowercase
  if (name === name.toLowerCase() && name.length > 3) {
    result.warnings.push('Consider using title case for better readability')
  }

  return result
}
