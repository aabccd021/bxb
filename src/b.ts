import { summonFor } from '@morphic-ts/batteries/lib/summoner-ESBST';

import { makeTagged, TypeOf } from './union';

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

export type Humanoid = TypeOf<typeof Humanoid>;
