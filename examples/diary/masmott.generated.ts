import { useDocCreationWithPage } from 'masmott';

import { masmott } from './masmott.config';

export type PostData = {
  readonly text: string;
  readonly title: string;
};

export type PostPageData = {
  readonly text: string;
  readonly title: string;
};

export type PostCardData = {
  readonly title: string;
};

export type PostCreationData = {
  readonly text: string;
  readonly title: string;
};

export const usePostCreation = () =>
  useDocCreationWithPage<PostData, PostCreationData>(
    masmott.firebase,
    'post',
    masmott.spec.post.view
  );
