import { summonFor } from '@morphic-ts/batteries/lib/summoner-ESBST';
import { expect, test } from 'vitest';

import { makeTagged } from '../src/union';

const { summon } = summonFor({});

export const Humanoid = makeTagged(summon)('type')({
  Person: summon((F) =>
    F.interface(
      {
        type: F.stringLiteral('Person'),
        name: F.string(),
        birthDate: F.number(),
      },
      'Person'
    )
  ),
  Robot: summon((F) =>
    F.interface(
      {
        type: F.stringLiteral('Robot'),
        manufacturer: F.string(),
      },
      'Robot'
    )
  ),
});

test('a', () =>
  expect(Humanoid.Union.as.Robot({ manufacturer: 'a' })).toStrictEqual({
    type: 'Robot',
    manufacturer: 'a',
  }));
