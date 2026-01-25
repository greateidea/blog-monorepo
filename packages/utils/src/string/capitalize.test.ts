import { describe, it, expect } from 'vitest';
import { capitalize } from './capitalize';

describe('capitalize', () => {
    it('should capitalize the first letter', () => {
        expect(capitalize('hello')).toBe('Hello');
    });
});