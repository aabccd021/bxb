import { summonFor } from '@morphic-ts/batteries/lib/summoner-ESBST';
import type { AType } from '@morphic-ts/summoners/lib';
import type * as t from 'io-ts';
import validDataUrl from 'valid-data-url';

type DataUrlBrand = {
  readonly DataUrl: unique symbol;
};

const { summon } = summonFor({});

export const DataUrl = summon((F) =>
  F.refined(F.string(), (s): s is t.Branded<string, DataUrlBrand> => validDataUrl(s), 'DataURL')
);

export type DataUrl = AType<typeof DataUrl>;
