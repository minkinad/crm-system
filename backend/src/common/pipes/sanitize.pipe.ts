import { Injectable, PipeTransform } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';

// Sanitizes string inputs to reduce XSS payload persistence risk.
@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: unknown): unknown {
    return this.deepSanitize(value);
  }

  private deepSanitize(value: unknown): unknown {
    if (typeof value === 'string') {
      return sanitizeHtml(value, {
        allowedTags: [],
        allowedAttributes: {}
      });
    }

    if (Array.isArray(value)) {
      return value.map((entry) => this.deepSanitize(entry));
    }

    if (value && typeof value === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, entry] of Object.entries(value)) {
        result[key] = this.deepSanitize(entry);
      }
      return result;
    }

    return value;
  }
}
