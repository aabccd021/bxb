/* eslint-disable functional/no-throw-statement */
/* eslint-disable functional/no-return-void */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
import { summonFor } from '@morphic-ts/batteries/lib/summoner-ESBST';
import { option, readonlyArray, readonlyRecord } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import * as fs from 'fs';
import * as path from 'path';

const { summon } = summonFor({});

const PackageJson = summon((F) =>
  F.interface({ dependencies: F.strMap(F.string()) }, 'PackageJson')
);

const providers = pipe(
  fs.readFileSync('package.json', { encoding: 'utf8' }),
  JSON.parse,
  PackageJson.type.decode,
  option.fromEither,
  option.map((p) => p.dependencies),
  option.chain(
    flow(
      readonlyRecord.keys,
      readonlyArray.filter((dep) => dep.startsWith('bxb-stack-'))
    )
  )
);

console.log(JSON.stringify(process.argv, undefined, 2));
if (process.argv[2] === 'app') {
  if (process.argv[3] === 'app' && process.argv[4] === 'nextjs') {
    if (option.isNone(provider)) {
      throw Error('No provider found');
    }
  }
}
