import type { Masmott } from 'masmott';

export const masmott: Masmott = {
  firebase: {
    projectId: 'demo-diary',
  },
  spec: {
    post: {
      data: {
        text: {
          type: 'string',
        },
        title: {
          type: 'string',
        },
      },
      view: {
        card: {
          select: {
            title: undefined,
          },
        },
        page: {
          select: {
            text: undefined,
            title: undefined,
          },
        },
      },
    },
  },
};
