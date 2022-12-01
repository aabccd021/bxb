import * as CreateUserAndSignInWithEmailAndPassword from './CreateUserAndSignInWithEmailAndPassword';
import * as OnAuthStateChanged from './OnAuthStateChanged';
import * as SignInWithGoogleRedirect from './SignInWithGoogleRedirect';
import * as SignOut from './SignOut';
export type Scope = {
  readonly signInWithGoogleRedirect: SignInWithGoogleRedirect.Fn;
  readonly createUserAndSignInWithEmailAndPassword: CreateUserAndSignInWithEmailAndPassword.Fn;
  readonly onAuthStateChanged: OnAuthStateChanged.Fn;
  readonly signOut: SignOut.Fn;
};
export {
  CreateUserAndSignInWithEmailAndPassword,
  OnAuthStateChanged,
  SignInWithGoogleRedirect,
  SignOut,
};
