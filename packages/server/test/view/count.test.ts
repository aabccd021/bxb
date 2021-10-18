import { App } from 'firebase-admin/app';
import { mocked } from 'ts-jest/utils';
import { onCountedDocCreated } from '../../src/view/count';
import { onCreateTrigger } from '../../src/wrapper/firebase-functions';

const mockedOnCreateTrigger = mocked(onCreateTrigger, true);

describe('count view', () => {
  it('on counted document created', () => {
    const app: App = { name: '', options: {} };
    const countSpec = {
      articleCount: {
        groupBy: 'ownerUserId',
        countedCollectionName: 'article',
      },
    };
    onCountedDocCreated(app, 'user', 'detail', countSpec);
    expect(mockedOnCreateTrigger).toHaveBeenCalledTimes(1);
  });
});
