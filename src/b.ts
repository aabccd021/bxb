import { summonFor } from '@morphic-ts/batteries/lib/summoner-ESBST';

import { makeTagged, TypeOf } from './union';
// Necessary to Specify the config environment (see Config Environment)
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

export const x = Humanoid.Union.of.Robot({ manufacturer: '' });
export const b = Humanoid.Person.eq;
export const c = Humanoid.Robot.eq;

export type PersonH = Humanoid['Person'];
export type RobotH = Humanoid['Robot'];
export type UnionH = Humanoid['Union'];

export const r: Humanoid['Union'] = {
  type: 'Robot',
  manufacturer: 'k',
};

export const g: Humanoid['Robot'] = {
  type: 'Robot',
  manufacturer: 'k',
};

export const h: Humanoid['Person'] = {
  type: 'Person',
  name: 'k',
  birthDate: 10,
};
