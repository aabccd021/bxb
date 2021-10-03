// eslint-disable-next-line no-restricted-imports
import * as admin from 'firebase-admin';

admin.initializeApp();

function sleep(milli: number): Promise<unknown> {
  return new Promise((res) => setTimeout(res, milli));
}

jest.setTimeout(10000);

describe('masmott', () => {
  describe('on single collection', () => {
    it('craete user_card when user created', async () => {
      await admin.firestore().doc('user/kirako').create({
        id: 'kirako',
        bio: 'dorokatsu desu',
      });
      await sleep(4000);

      const userCard = await admin.firestore().doc('user_card/kirako').get();
      expect(userCard.data()).toStrictEqual({ bio: 'dorokatsu desu' });
    });

    it('update user_card when user updated', async () => {
      await admin
        .firestore()
        .doc('user/kirako')
        .update({ bio: 'masumoto desu' });
      await sleep(4000);

      const userCard = await admin.firestore().doc('user_card/kirako').get();
      expect(userCard.data()).toStrictEqual({ bio: 'masumoto desu' });
    });

    it('delete user_card when user deleted', async () => {
      await admin.firestore().doc('user/kirako').delete();
      await sleep(4000);

      const userCard = await admin.firestore().doc('user_card/kirako').get();
      expect(userCard.exists).toStrictEqual(false);
    });
  });

  describe('on double chained ref', () => {
    it('materialize clap_view on clap created', async () => {
      await admin.firestore().doc('user/marino').create({
        id: 'marino',
        bio: 'marinos desu',
      });

      await admin.firestore().doc('article/46').create({
        text: 'w keyaki fest',
        ownerUser: 'marino',
      });

      await admin.firestore().doc('clap/hikaru_46').create({
        clappedArticle: '46',
      });
      await sleep(4000);

      const clapDetail = await admin
        .firestore()
        .doc('clap_detail/hikaru_46')
        .get();
      expect(clapDetail.data()).toStrictEqual({
        clappedArticle_ownerUser_bio: 'marinos desu',
        clappedArticle_ownerUser_id: 'marino',
      });
    });

    it('update clap_view on user updated', async () => {
      await admin
        .firestore()
        .doc('user/marino')
        .update({ bio: 'kousaka desu' });
      await sleep(4000);

      const clapView = await admin
        .firestore()
        .doc('clap_detail/hikaru_46')
        .get();
      expect(clapView.data()).toStrictEqual({
        clappedArticle_ownerUser_bio: 'kousaka desu',
        clappedArticle_ownerUser_id: 'marino',
      });
    });

    it('delete clap on user deleted', async () => {
      await admin.firestore().doc('user/marino').delete();
      await sleep(4000);

      const clap = await admin.firestore().doc('clap/hikaru_46').get();
      expect(clap.exists).toStrictEqual(false);
    });
  });
});
