import { expect, test } from 'vitest';

// ideal
export const Humanoid = union('type', (F: any) => ({
  Person: {
    name: F.string(),
    birthDate: F.number(),
  },
  Robot: {
    manufacturer: F.string(),
  },
}));

export type Humanoid = TypeOf<typeof Humanoid>;

test('a', () =>
  expect(Humanoid.Union.as.Robot({ manufacturer: 'a' })).toStrictEqual({
    type: 'Robot',
    manufacturer: 'a',
  }));
