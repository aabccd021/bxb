/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-return-void */
export const signIn = (impl: () => void) =>
  process.env['NODE_ENV'] === 'production'
    ? impl
    : () => {
        const url = new URL(`${window.location.origin}/__masmott__/signIn`);
        url.searchParams.append('redirectUrl', window.location.href);
        window.location.href = url.toString();
      };
