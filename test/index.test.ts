/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, expect, it, vi } from 'vitest';

import { makeTriggers } from '../src';

describe.concurrent('masmott', () => {
  it('on create materialize view', () => {
    const setDoc = vi
      .fn()
      .mockImplementation(
        (_: {
          readonly table: string;
          readonly view: string;
          readonly id: string;
          readonly data: Record<string, unknown>;
        }) => {}
      );

    const triggers = makeTriggers({
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
      db: {
        setDoc,
      },
    });

    triggers.lawak.onCreate({
      id: 'fooLawak',
      data: { text: 'lawak text' },
    });

    expect(setDoc).toHaveBeenCalledOnce();
    expect(setDoc).toHaveBeenCalledWith({
      table: 'lawak',
      view: 'card',
      id: 'fooLawak',
      data: { text: 'lawak text' },
    });
  });
});
