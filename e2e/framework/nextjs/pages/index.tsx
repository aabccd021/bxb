import { either, option, taskEither} from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';
import { Option } from 'fp-ts/lib/Option';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';

import { masmott } from '../masmott';

const mapToAuthStatus = option.match(
  () => 'not signed in',
  (s) => `email : ${s}`
);

const readAsDataUrl = (file: File): TaskEither<string, string| ArrayBuffer| null> => taskEither.tryCatch(() => {
  return new Promise((resolve, reject) => {
    var fr = new FileReader();  
    fr.onload = () => {
      resolve(fr.result)
    };
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}, JSON.stringify)

const useAuthState = () => {
  const [authState, setAuthState] = useState<Option<string>>(option.none);
  useEffect(
    () => masmott.auth.onAuthStateChanged((newAuthState) => () => setAuthState(newAuthState))(),
    [setAuthState]
  );
  return authState;
};

const useHome = () => {
  const authState = useAuthState();
  const authStateStr = useMemo(() => mapToAuthStatus(authState), [authState]);
  return {
    authStateStr,
  };
};

const uploadAndDownload =  (c: ChangeEvent<HTMLInputElement>) =>       
  pipe(
    option.fromNullable(c.target.files?.[0]), 
    taskEither.fromOption(() => 'file not selected'), 
    taskEither.chainW(readAsDataUrl), 
    taskEither.chainEitherKW(either.fromPredicate((dataUrl): dataUrl is string => typeof dataUrl === 'string', () => 'dataUrl is not a string')),
    taskEither.chainW((dataUrl) => masmott.storage.uploadDataUrl({key: 'aabccd021', dataUrl})),
    taskEither.chainW(() => masmott.storage.getDownloadUrl({key: 'aabccd021'})),
  )


export default function Home() {
  const [downloadUrl, setDownloadUrl] = useState<string>();
  const { authStateStr } = useHome();
  useEffect(() => {
    pipe(
    masmott.storage.getDownloadUrl({key: 'aabccd021'}),
    taskEither.chainIOK((downloadUrl) => () => setDownloadUrl(downloadUrl))
    )()
  },[])
  return (
    <div>
      <button onClick={masmott.auth.signInWithGoogleRedirect}>Sign In With Redirect</button>
      <button onClick={masmott.auth.signOut}>Sign Out</button>
      <p id="auth-status">{authStateStr}</p>
      {downloadUrl !== undefined ? <img src={downloadUrl}/> : <div>non</div>}
      <input type='file' onChange={(c) => pipe(
        uploadAndDownload(c),
        taskEither.chainIOK((downloadUrl) => () => setDownloadUrl(downloadUrl))
      )()}/>
    </div>
  );
}
