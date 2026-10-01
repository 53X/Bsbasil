import { describe, expect, it } from 'vitest';
import { toE164 } from './phone';

describe('toE164', () => {
  it('treats a 10-digit number as an Indian mobile', () => {
    expect(toE164('77009 05962')).toBe('+917700905962');
  });

  it('keeps a number that already includes the country code', () => {
    expect(toE164('+1 415 555 2671')).toBe('+14155552671');
  });

  it('rejects a number that is too short', () => {
    expect(toE164('12345')).toBeNull();
  });
});
