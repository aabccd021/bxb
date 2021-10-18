import { expect } from 'chai';
import { App } from 'firebase-admin/app';
import { onCountedDocCreated } from '../../src/view/count';

describe('count view', () => {
  it('on counted document created', () => {
    const app: App = { name: '', options: {} };
    const triggers = onCountedDocCreated(app, 'a', 'b', {});
    expect(triggers).to.deep.equal({});
  });
});
