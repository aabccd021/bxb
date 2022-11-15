/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-return-void */
export const signIn = () => {
  console.log(window.location);
  const url = new URL(`${window.location.origin}/public/SignIn`);
  url.searchParams.append('redirectUrl', window.location.href);
  window.location.href = url.toString();
};
