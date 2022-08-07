import { describe, expect, it } from 'vitest';

import { helloWorld } from '../src';

describe.concurrent('masmott', () => {
  it('can hello world', () => {
    expect(helloWorld()).equals('hello world');
  });
});
