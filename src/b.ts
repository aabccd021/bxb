import { summonFor } from '@morphic-ts/batteries/lib/summoner-ESBST';
import { AType, EType, makeTagged } from '@morphic-ts/summoners';
import { InhabitedTypes } from '@morphic-ts/summoners/lib/utils';

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

export type Z = typeof Humanoid;

export type H = typeof Humanoid;

export type Tags<X extends InhabitedTypes<any, any, any> & { readonly tag: string }> =
  AType<X>[X['tag']];

export type HTags = Tags<H>;

export type Humanoid<T extends Tags<H> = Tags<H>> = Extract<AType<H>, { readonly type: T }>;

export type HPerson = Humanoid<'Person'>;

export type HRobot = Humanoid<'Robot'>;

export type HHumanoid = Humanoid;

export type ZZ = Z['tag'];

export type Humanoid2 = EType<typeof Humanoid>;

const person = Humanoid.of.Person({ name: 'a', birthDate: 90 });

export const robot = Humanoid.as.Robot({ manufacturer: 'nvidia' });

const matchHumanoid = Humanoid.match(
  {
    Person: ({ name }) => name,
  },
  (_) => 'dunno'
);

export const personName: string = matchHumanoid(person);

// type Bicycle = {
//   readonly type: 'Bicycle';
//   readonly color: string;
// };
//
// type Motorbike = {
//   readonly type: 'Motorbike';
//   readonly seats: number;
// };
//
// type Car = {
//   readonly type: 'Car';
//   readonly kind: 'electric' | 'fuel' | 'gaz';
//   readonly power: number;
//   readonly seats: number;
// };
//
// // ADT<Car | Motorbike | Bicycle, "type">
// const Vehicle = summon('type')({
//   Car: ofType<Car>(),
//   Motorbike: ofType<Motorbike>(),
//   Bicycle: ofType<Bicycle>(),
// });
