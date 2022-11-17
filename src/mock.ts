import { Unsubscribe } from './type';
/* eslint-disable functional/no-let */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-return-void */
export const signInWithRedirect = () => {
  const url = new URL(`${window.location.origin}/__masmott__/signInWithRedirect`);
  url.searchParams.append('redirectUrl', window.location.href);
  window.location.href = url.toString();
};

type Callback = (user?: string) => void;

let onAuthStateChangedCallback: Callback | undefined;

export const onAuthStateChanged = (callback: Callback): Unsubscribe => {
  const user = localStorage.getItem('auth') ?? undefined;
  callback(user);
  onAuthStateChangedCallback = callback;
  return () => {
    onAuthStateChangedCallback = undefined;
  };
};

export const signOut = () => {
  onAuthStateChangedCallback?.(undefined);
  localStorage.removeItem('auth');
};
