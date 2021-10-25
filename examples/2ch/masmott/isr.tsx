import { NextPage } from 'next';
import { useRouter } from 'next/dist/client/router';
import { useEffect, useState } from 'react';
import { SWRConfig } from 'swr';
import { Doc, DocData, ISRPage, ISRPageProps, ViewPath } from './types';
import { useDoc } from './use-doc';

function PageWithSnapshot<DD extends DocData>({
  Page,
  id,
  viewPath: [collection, view],
}: {
  readonly Page: ISRPage<DD>;
  readonly id: string;
  readonly viewPath: ViewPath;
}): JSX.Element {
  const doc = useDoc<Doc.Type<DD>>([collection, id], view);
  return <Page snapshot={{ doc, id }} />;
}

function PageWithId<DD extends DocData>({
  Page,
  viewPath,
}: {
  readonly Page: ISRPage<DD>;
  readonly viewPath: ViewPath;
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
      {id !== undefined ? <PageWithSnapshot Page={Page} viewPath={viewPath} id={id} /> : <Page />}
    </>
  );
}

export function withISR<DD extends DocData>(
  viewPath: ViewPath,
  Page: ISRPage<DD>
): NextPage<ISRPageProps> {
  const StaticPage: NextPage<ISRPageProps> = ({ fallback }) => (
    <SWRConfig value={{ fallback }}>
      <PageWithId Page={Page} viewPath={viewPath} />
    </SWRConfig>
  );
  return StaticPage;
}
