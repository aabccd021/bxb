import * as E from 'fp-ts/Either';
import { describe, expect, it } from 'vitest';

import { AppViews, makeTriggers } from '../src';
import { createMockDB } from './util';

describe.concurrent('masmott', () => {
  describe.concurrent('self field', () => {
    const views: AppViews = {
      lawak: {
        card: {
          fields: {
            text: {
              relation: 'self',
            },
          },
        },
      },
    };

    describe.concurrent('onCreate', () => {
      it('returns success messages', async () => {
        const db = createMockDB();
        const triggers = makeTriggers({ db, views });
        const onLawakCreateTrigger = triggers.lawak.onCreate({
          id: 'fooLawak',
          data: { text: 'lawak text' },
        });

        const triggerResult = await onLawakCreateTrigger();

        expect(triggerResult).toStrictEqual({ card: E.right('setDoc success') });
      });

      it('creates materialized view', async () => {
        const db = createMockDB();
        const triggers = makeTriggers({ db, views });
        const trigger = triggers.lawak.onCreate({
          id: 'fooLawak',
          data: { text: 'lawak text' },
        });

        await trigger();

        const getViewDoc = db.getDoc({ table: 'lawak', view: 'card', id: 'fooLawak' });
        const result = await getViewDoc();
        expect(result).toStrictEqual(
          E.right({
            data: { text: 'lawak text' },
            context: 'doc found',
          })
        );
      });
    });
  });
});
