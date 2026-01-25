import { describe, it, expect } from 'vitest';
import { serializeScript } from './ssr-helper';

describe('serializeScript', () => {
    it('should serialize function to IIFE', () => {
        expect(new Function("return " + serializeScript((v: string) => v, 'test'))()).toBe('test');
    });
});