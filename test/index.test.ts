import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { describe, expect, it } from 'vitest';

import { makeTriggers } from '../src';

type TestDB = {
  readonly SetDocRight: string;
  readonly SetDocLeft: string;
};

describe.concurrent('masmott', () => {
  it('on create materialize view', async () => {
    const triggers = makeTriggers<TestDB>({
      db: {
        setDoc: (_) => TE.of('write result'),
      },
      views: {
        lawak: {
          card: {
            fields: {
              text: {
                relation: 'self',
              },
            },
          },
        },
      },
    });

    const result = triggers.lawak.onCreate({
      id: 'fooLawak',
      data: { text: 'lawak text' },
    });

    expect(await result.card()).toStrictEqual(E.right('write result'));
  });
});
