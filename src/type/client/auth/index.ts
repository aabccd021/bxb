import type * as CreateUserAndSignInWithEmailAndPassword from './CreateUserAndSignInWithEmailAndPassword';
import type * as GetAuthState from './GetAuthState';
import type * as OnAuthStateChanged from './OnAuthStateChanged';
import type * as SignInWithGoogleRedirect from './SignInWithGoogleRedirect';
import type * as SignOut from './SignOut';

export type Scope = {
  readonly signInWithGoogleRedirect: SignInWithGoogleRedirect.Fn;
  readonly createUserAndSignInWithEmailAndPassword: CreateUserAndSignInWithEmailAndPassword.Fn;
  readonly onAuthStateChanged: OnAuthStateChanged.Fn;
  readonly signOut: SignOut.Fn;
  readonly getAuthState: GetAuthState.Fn;
};

export {
  CreateUserAndSignInWithEmailAndPassword,
  GetAuthState,
  OnAuthStateChanged,
  SignInWithGoogleRedirect,
  SignOut,
};
