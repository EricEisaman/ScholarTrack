import { describe, it, expect } from 'vitest';

describe('Simple Test', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle basic math', () => {
    expect(2 * 3).toBe(6);
    expect(10 - 5).toBe(5);
    expect(15 / 3).toBe(5);
  });

  it('should handle strings', () => {
    expect('Hello' + ' ' + 'World').toBe('Hello World');
    expect('Test'.length).toBe(4);
  });

  it('should handle arrays', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arr.length).toBe(5);
    expect(arr[0]).toBe(1);
    expect(arr[arr.length - 1]).toBe(5);
  });

  it('should handle objects', () => {
    const obj = { name: 'Test', value: 42 };
    expect(obj.name).toBe('Test');
    expect(obj.value).toBe(42);
    expect(Object.keys(obj)).toHaveLength(2);
  });

  it('should handle async operations', async () => {
    const result = await Promise.resolve('async result');
    expect(result).toBe('async result');
  });

  it('should handle promises', () => {
    return Promise.resolve('promise result').then(result => {
      expect(result).toBe('promise result');
    });
  });
});
