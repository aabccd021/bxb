/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-return-void */
/* eslint-disable functional/no-expression-statement */
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { SWRConfig } from 'swr';

import { FirebaseOptions, ISRPage, ISRPageProps, ViewPath } from './types';
import { useDoc } from './use-doc';

function PageWithSnapshot({
  options,
  Page,
  id,
  viewPath: [collection, view],
  useLocalData,
}: {
  readonly Page: ISRPage;
  readonly id: string;
  readonly options: FirebaseOptions;
  readonly useLocalData: boolean;
  readonly viewPath: ViewPath;
}): JSX.Element {
  const viewDoc = useDoc(options, [collection, id], {
    revalidateOnMount: !useLocalData,
    view,
  });
  return <Page snapshot={{ doc: viewDoc, id }} />;
}

function PageWithId({
  options,
  Page,
  viewPath,
}: {
  readonly Page: ISRPage;
  readonly options: FirebaseOptions;
  readonly viewPath: ViewPath;
}): JSX.Element {
  const router = useRouter();
  const [id, setId] = useState<string | undefined>(undefined);
  const [useLocalData, setUseLocalData] = useState(true);

  useEffect(() => {
    if (router.isReady) {
      const queryId = router.query['id'];
      if (typeof queryId === 'string') {
        setId(queryId);
        if (router.query['useLocalData'] === undefined) {
          setUseLocalData(false);
          return;
        }
        router.push(
          `${router.pathname.replace('[id]', '')}${queryId}`,
          undefined,
          {
            shallow: true,
          }
        );
      }
    }
  }, [router]);

  return (
    <>
      <p>useLocalData: {JSON.stringify(useLocalData)}</p>
      {id !== undefined ? (
        <PageWithSnapshot
          options={options}
          Page={Page}
          viewPath={viewPath}
          id={id}
          useLocalData={useLocalData}
        />
      ) : (
        <Page />
      )}
    </>
  );
}

export function makeISRPage(
  options: FirebaseOptions,
  viewPath: ViewPath,
  Page: ISRPage
): NextPage<ISRPageProps> {
  const StaticPage: NextPage<ISRPageProps> = ({ fallback }) => (
    <SWRConfig value={{ fallback }}>
      <PageWithId options={options} Page={Page} viewPath={viewPath} />
    </SWRConfig>
  );
  return StaticPage;
}
