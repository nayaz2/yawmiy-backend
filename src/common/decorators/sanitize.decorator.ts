import { Transform } from 'class-transformer';
import { sanitizeString } from '../utils/sanitize.util';

/**
 * Decorator to sanitize string input and prevent XSS attacks
 * Use this on DTO fields that accept user-generated content
 * 
 * @example
 * ```typescript
 * class CreateListingDto {
 *   @Sanitize()
 *   @IsString()
 *   title: string;
 * }
 * ```
 */
export function Sanitize() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return sanitizeString(value);
    }
    if (Array.isArray(value)) {
      return value.map((item) =>
        typeof item === 'string' ? sanitizeString(item) : item,
      );
    }
    return value;
  });
}
