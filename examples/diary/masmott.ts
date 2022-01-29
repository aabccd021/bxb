import { Masmott } from 'masmott';
export const masmott: Masmott = {
  firebase: {
    projectId: 'demo-diary',
  },
  spec: {
    post: {
      data: {
        title: {
          _type: 'string',
        },
        text: {
          _type: 'string',
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
