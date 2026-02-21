import { stringify } from 'csv-stringify/sync';

// Converts DTO arrays to RFC4180-compatible CSV output.
export function toCsv(records: Record<string, unknown>[]): string {
  return stringify(records, {
    header: true
  });
}
