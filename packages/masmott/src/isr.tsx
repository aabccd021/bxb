import { NextPage } from 'next';
import { useRouter } from 'next/router';
// eslint-disable-next-line no-use-before-define
import React, { useEffect, useState } from 'react';
import { SWRConfig } from 'swr';
import { Doc, DocData, FirebaseOptions, ISRPage, ISRPageProps, ViewPath } from './types';
import { useDoc } from './use-doc';

function PageWithSnapshot<VDD extends DocData>({
  options,
  Page,
  id,
  viewPath: [collection, view],
  useLocalData,
}: {
  readonly options: FirebaseOptions;
  readonly Page: ISRPage<VDD>;
  readonly id: string;
  readonly viewPath: ViewPath;
  readonly useLocalData: boolean;
}): JSX.Element {
  const viewDoc = useDoc<Doc.Type<VDD>>(options, [collection, id], {
    view,
    revalidateOnMount: !useLocalData,
  });
  return <Page snapshot={{ doc: viewDoc, id }} />;
}

function PageWithId<DD extends DocData>({
  options,
  Page,
  viewPath,
}: {
  readonly options: FirebaseOptions;
  readonly Page: ISRPage<DD>;
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

export function makeISRPage<DD extends DocData>(
  options: FirebaseOptions,
  viewPath: ViewPath,
  Page: ISRPage<DD>
): NextPage<ISRPageProps> {
  const StaticPage: NextPage<ISRPageProps> = ({ fallback }) => (
    <SWRConfig value={{ fallback }}>
      <PageWithId options={options} Page={Page} viewPath={viewPath} />
    </SWRConfig>
  );
  return StaticPage;
}
