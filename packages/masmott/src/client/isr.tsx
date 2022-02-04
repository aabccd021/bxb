/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-return-void */
/* eslint-disable functional/no-expression-statement */
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { SWRConfig } from 'swr';

import { DocData, FirebaseOptions, ISRPage, ISRPageProps } from './types';
import { useDoc } from './use-doc';

function PageWithSnapshot<DD extends DocData>({
  options,
  Page,
  id,
  collection,
  useLocalData,
}: {
  readonly Page: ISRPage<DD>;
  readonly collection: string;
  readonly id: string;
  readonly options: FirebaseOptions;
  readonly useLocalData: boolean;
}): JSX.Element {
  const viewDoc = useDoc<DD>(options, [collection, id], {
    revalidateOnMount: !useLocalData,
    view: 'page',
  });
  return <Page snapshot={{ doc: viewDoc, id }} />;
}

function PageWithId<DD extends DocData>({
  options,
  Page,
  collection,
}: {
  readonly Page: ISRPage<DD>;
  readonly collection: string;
  readonly options: FirebaseOptions;
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
        router.push(`${router.pathname.replace('[id]', '')}${queryId}`, undefined, {
          shallow: true,
        });
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
          collection={collection}
          id={id}
          useLocalData={useLocalData}
        />
      ) : (
        <Page />
      )}
    </>
  );
}

export function makeISRPage<DD extends DocData>(
  options: FirebaseOptions,
  collection: string,
  Page: ISRPage<DD>
): NextPage<ISRPageProps> {
  const StaticPage: NextPage<ISRPageProps> = ({ fallback }) => (
    <SWRConfig value={{ fallback }}>
      <PageWithId options={options} Page={Page} collection={collection} />
    </SWRConfig>
  );
  return StaticPage;
}
