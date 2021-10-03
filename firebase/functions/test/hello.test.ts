// eslint-disable-next-line no-restricted-imports
import * as admin from 'firebase-admin';

admin.initializeApp();

function sleep(milli: number): Promise<unknown> {
  return new Promise((res) => setTimeout(res, milli));
}

describe('a', () => {
  it('b', async () => {
    await admin.firestore().doc('user/kirako').create({
      id: 'kirako',
      bio: 'dorokatsu desu',
    });
    await sleep(1000);
    const userCard = await admin.firestore().doc('user_card/kirako').get();
    expect(userCard.data()).toStrictEqual({ bio: 'dorokatsu desu' });
  });
});
