export class ValueConverter {
  static toBoolean(value: string): boolean {
    return value === 'true' || value === '1' || value === 'yes';
  }
}
