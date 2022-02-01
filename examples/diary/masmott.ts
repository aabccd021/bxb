import { Masmott } from 'masmott';

export const masmott: Masmott = {
  firebase: {
    projectId: 'demo-diary',
  },
  spec: {
    post: {
      data: {
        title: {
          type: 'string',
        },
        text: {
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
            title: undefined,
            text: undefined,
          },
        },
      },
    },
  },
};
