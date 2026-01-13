import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create a window object for DOMPurify (needed for server-side)
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

/**
 * Sanitize a string to prevent XSS attacks
 * Removes all HTML tags and dangerous content
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return input;
  }

  // Remove all HTML tags and return plain text
  return purify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep text content but remove tags
  });
}

/**
 * Sanitize an object recursively
 * @param obj - Object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as T;
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject((obj as any)[key]);
      }
    }
    return sanitized as T;
  }

  return obj;
}

/**
 * Sanitize user input fields that may contain HTML/XSS
 * Fields to sanitize: title, description, content, name, location, etc.
 */
export function sanitizeUserInput(input: any): any {
  if (!input || typeof input !== 'object') {
    return input;
  }

  const fieldsToSanitize = [
    'title',
    'description',
    'content',
    'name',
    'location',
    'meeting_location',
    'reason',
    'message',
    'search',
  ];

  const sanitized = { ...input };

  for (const field of fieldsToSanitize) {
    if (sanitized[field] && typeof sanitized[field] === 'string') {
      sanitized[field] = sanitizeString(sanitized[field]);
    }
  }

  return sanitized;
}
