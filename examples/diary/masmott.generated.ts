import { useDocCreation } from 'masmott';

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
  useDocCreation<PostData, PostCreationData>(masmott.firebase, 'post');
