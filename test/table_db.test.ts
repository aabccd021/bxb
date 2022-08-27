import * as O from 'fp-ts/Option';
import { describe, expect, it } from 'vitest';

import { createTableDB } from '../src/table_db';

describe.concurrent('Table DB', () => {
  it('can set doc and get doc', async () => {
    const createNoTriggerTableDB = createTableDB({});
    const db = createNoTriggerTableDB();
    const key = { table: 'sakurazaka', id: 'kira' };

    const setDoc = db.setDoc({ key, data: { birthYear: 2002 } });
    await setDoc();

    const getDoc = db.getDoc(key);
    const result = await getDoc();

    expect(result).toStrictEqual(O.of({ birthYear: 2002 }));
  });
});
