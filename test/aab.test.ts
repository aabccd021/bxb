import { summonFor } from '@morphic-ts/batteries/lib/summoner-ESBST';
import { expect, test } from 'vitest';

import { makeTagged } from '../src/union';

const { summon } = summonFor({});

// ideal
export const Humanoid = makeTagged(summon)('type')({
  Person: (F: any) => ({
    name: F.string(),
    birthDate: F.number(),
  }),
  Robot: (F: any) => ({
    manufacturer: F.string(),
  }),
});

test('a', () =>
  expect(Humanoid.Union.as.Robot({ manufacturer: 'a' })).toStrictEqual({
    type: 'Robot',
    manufacturer: 'a',
  }));
