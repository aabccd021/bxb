import * as admin from 'firebase-admin';

admin.initializeApp();

function sleep(milli: number): Promise<unknown> {
  return new Promise((res) => setTimeout(res, milli));
}

jest.setTimeout(10000);

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
    await admin.firestore().doc('user/kirako').update({ bio: 'masumoto desu' });
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
      // TODO: don't generate name
      clappedArticleOwner_bio: 'marinos desu',
      clappedArticleOwner_id: 'marino',
    });
  });

  it('update clap_view on user updated', async () => {
    await admin.firestore().doc('user/marino').update({ bio: 'kousaka desu' });
    await sleep(4000);

    const clapView = await admin.firestore().doc('clap_detail/hikaru_46').get();
    expect(clapView.data()).toStrictEqual({
      clappedArticleOwner_bio: 'kousaka desu',
      clappedArticleOwner_id: 'marino',
    });
  });

  it('delete clap on user deleted', async () => {
    await admin.firestore().doc('user/marino').delete();
    await sleep(4000);

    const clap = await admin.firestore().doc('clap/hikaru_46').get();
    expect(clap.exists).toStrictEqual(false);
  });
});

describe('count article', () => {
  it('initialize user article count with 0', async () => {
    await admin.firestore().doc('user/berisa').create({
      id: 'berisa',
      bio: 'berisa desu',
    });
    await sleep(4000);

    const userDetail = await admin.firestore().doc('user_detail/berisa').get();
    expect(userDetail.data()).toStrictEqual({
      articleCount: 0,
    });
  });

  it('increase count when new article created', async () => {
    await admin.firestore().doc('article/21').create({
      text: 'mugon no uchuu',
      ownerUser: 'berisa',
    });
    await sleep(4000);

    const userDetail = await admin.firestore().doc('user_detail/berisa').get();
    expect(userDetail.data()).toStrictEqual({
      articleCount: 1,
    });
  });

  it('increase count when another new article created', async () => {
    await admin.firestore().doc('article/42').create({
      text: 'nageredama',
      ownerUser: 'berisa',
    });
    await sleep(4000);

    const userDetail = await admin.firestore().doc('user_detail/berisa').get();
    expect(userDetail.data()).toStrictEqual({
      articleCount: 2,
    });
  });

  it('decrease count when an article deleted', async () => {
    await admin.firestore().doc('article/21').delete();
    await sleep(4000);

    const userDetail = await admin.firestore().doc('user_detail/berisa').get();
    expect(userDetail.data()).toStrictEqual({
      articleCount: 1,
    });
  });

  it('decrease count again when an article deleted', async () => {
    await admin.firestore().doc('article/42').delete();
    await sleep(4000);

    const userDetail = await admin.firestore().doc('user_detail/berisa').get();
    expect(userDetail.data()).toStrictEqual({
      articleCount: 0,
    });
  });
});

describe('count comment', () => {
  it('initialize article comment count with 0', async () => {
    await admin.firestore().doc('article/17').create({
      text: 'MV released mugon no uchuu',
      ownerUser: 'berisa',
    });
    await sleep(4000);

    const articleCard = await admin.firestore().doc('article_card/17').get();
    expect(articleCard.data()).toStrictEqual({
      commentCount: 0,
    });
  });

  it('increase count when new article created', async () => {
    await admin.firestore().doc('comment/123').create({
      text: 'cool',
      commentedArticle: '17',
    });
    await sleep(4000);

    const articleCard = await admin.firestore().doc('article_card/17').get();
    expect(articleCard.data()).toStrictEqual({
      commentCount: 1,
    });
  });

  it('increase count when another new article created', async () => {
    await admin.firestore().doc('comment/456').create({
      text: 'hype as fujii kaze kirari',
      commentedArticle: '17',
    });
    await sleep(4000);

    const articleCard = await admin.firestore().doc('article_card/17').get();
    expect(articleCard.data()).toStrictEqual({
      commentCount: 2,
    });
  });

  it('decrease count when an article deleted', async () => {
    await admin.firestore().doc('comment/123').delete();
    await sleep(4000);

    const articleCard = await admin.firestore().doc('article_card/17').get();
    expect(articleCard.data()).toStrictEqual({
      commentCount: 1,
    });
  });

  it('decrease count again when an article deleted', async () => {
    await admin.firestore().doc('comment/456').delete();
    await sleep(4000);

    const articleCard = await admin.firestore().doc('article_card/17').get();
    expect(articleCard.data()).toStrictEqual({
      commentCount: 0,
    });
  });
});
