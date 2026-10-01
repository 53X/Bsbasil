import { describe, expect, it } from 'vitest';
import { customerRestockMessage, isEmail, ownerRestockMessage } from './restock-messages';

describe('restock messages', () => {
  it('tells the shop who wants a sold-out product', () => {
    expect(ownerRestockMessage({
      email: 'parent@example.com',
      title: 'Baby Bunny Checkered Romper Set',
      selection: 'Beige, 6–12 months',
    })).toBe(
      'parent@example.com wants Baby Bunny Checkered Romper Set (Beige, 6–12 months). It is sold out right now.',
    );
  });

  it('tells the customer the product is back', () => {
    expect(customerRestockMessage({
      title: 'Baby Bunny Checkered Romper Set',
      selection: '',
      url: 'https://bsbasil.vercel.app/products/baby-bunny-checkered-romper-set',
    })).toBe(
      'Baby Bunny Checkered Romper Set is back in stock.\nhttps://bsbasil.vercel.app/products/baby-bunny-checkered-romper-set',
    );
  });

  it('accepts a normal email address', () => {
    expect(isEmail('parent@example.com')).toBe(true);
    expect(isEmail('not an email')).toBe(false);
  });
});
