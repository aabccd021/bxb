import { mapValues } from 'lodash-es';
import { ViewSpec } from 'masmott-functions';
import { NextPage } from 'next';
import { useRouter } from 'next/dist/client/router';
import { useEffect, useState } from 'react';
import { SWRConfig } from 'swr';
import { useDocSWRConfig } from '.';
import { Doc, DocData, DocKey, ISRPage, ISRPageProps, ViewPath } from './types';
import { useDoc } from './use-doc';

function PageWithSnapshot<VDD extends DocData>({
  Page,
  id,
  viewPath: [collection, view],
  viewSpec,
}: {
  readonly Page: ISRPage<VDD>;
  readonly id: string;
  readonly viewPath: ViewPath;
  readonly viewSpec: ViewSpec;
}): JSX.Element {
  const [isReady, setIsReady] = useState(false);
  const viewDoc = useDoc<Doc.Type<VDD>>([collection, id], view);
  const srcDoc = useDoc<Doc.Type>([collection, id]);
  const { mutateDoc } = useDocSWRConfig();

  useEffect(() => {
    const viewIsNotReady =
      viewDoc.state === 'loaded' && srcDoc.state === 'loaded' && !viewDoc.exists && srcDoc.exists;
    if (viewIsNotReady) {
      const materializedCounts = mapValues(viewSpec.countSpecs, () => 0);
      const materializedData = {
        ...materializedCounts,
      };
      const materializedDoc = {
        exists: true,
        data: materializedData,
      };
      const viewDocKey: DocKey = [collection, id];
      mutateDoc(viewDocKey, materializedDoc, { view });
    }
    setIsReady(true);
  }, [viewDoc, srcDoc, collection, id, mutateDoc, view, viewSpec]);

  return <>{isReady ? <Page snapshot={{ doc: viewDoc, id }} /> : <Page />}</>;
}

function PageWithId<DD extends DocData>({
  Page,
  viewPath,
  viewSpec,
}: {
  readonly Page: ISRPage<DD>;
  readonly viewPath: ViewPath;
  readonly viewSpec: ViewSpec;
}): JSX.Element {
  const router = useRouter();
  const [id, setId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (router.isReady) {
      const value = router.query['id'];
      if (typeof value === 'string' || typeof value === 'undefined') {
        setId(value);
      }
    }
  }, [router]);

  return (
    <>
      {id !== undefined ? (
        <PageWithSnapshot viewSpec={viewSpec} Page={Page} viewPath={viewPath} id={id} />
      ) : (
        <Page />
      )}
    </>
  );
}

export function withISR<DD extends DocData>(
  viewPath: ViewPath,
  viewSpec: ViewSpec,
  Page: ISRPage<DD>
): NextPage<ISRPageProps> {
  const StaticPage: NextPage<ISRPageProps> = ({ fallback }) => (
    <SWRConfig value={{ fallback }}>
      <PageWithId Page={Page} viewPath={viewPath} viewSpec={viewSpec} />
    </SWRConfig>
  );
  return StaticPage;
}
