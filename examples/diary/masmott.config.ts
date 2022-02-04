export const masmott = {
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
