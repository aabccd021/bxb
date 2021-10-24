import { NextPage } from "next";
import { useRouter } from "next/dist/client/router";
import React, { useEffect, useState } from "react";
import { SWRConfig } from "swr";
import { Doc, DocData, ISRPageProps, useDoc, ViewPath } from ".";

export type DocChildren<DD extends DocData = DocData> = {
  readonly error: Doc.ErrorComponent;
  readonly fetching: Doc.FetchingComponent;
  readonly loadedExists: Doc.LoadedExistsComponent<DD>;
  readonly loadedNotExists: Doc.LoadedNotExistsComponent;
};

export type Children<DD extends DocData = DocData> = DocChildren<DD> & {
  readonly routerLoading: () => JSX.Element;
};

function DocPage<DD extends DocData = DocData>({
  viewPath: [collection, view],
  components,
  id,
}: {
  readonly viewPath: ViewPath;
  readonly components: DocChildren<DD>;
  readonly id: string;
}): JSX.Element {
  const doc = useDoc<Doc.Type<DD>>([collection, id], view);
  if (doc.state === "error") return <components.error doc={doc} />;
  if (doc.state === "fetching") return <components.fetching doc={doc} />;
  if (doc.exists) return <components.loadedExists doc={doc} />;
  return <components.loadedNotExists doc={doc} />;
}

function Page<DD extends DocData = DocData>({
  viewPath,
  components,
}: {
  readonly viewPath: ViewPath;
  readonly components: Children<DD>;
}): JSX.Element {
  const router = useRouter();
  const [id, setId] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (router.isReady) {
      const value = router.query["id"];
      if (typeof value === "string" || typeof value === "undefined") {
        setId(value);
      }
    }
  }, [router]);

  if (id === undefined) {
    return <components.routerLoading />;
  }

  return <DocPage viewPath={viewPath} components={components} id={id} />;
}

export function makeStaticPage<DD extends DocData = DocData>(
  viewPath: ViewPath,
  components: Children<DD>
): NextPage<ISRPageProps> {
  const StaticPage: NextPage<ISRPageProps> = ({ fallback }) => (
    <SWRConfig value={{ fallback }}>
      <Page viewPath={viewPath} components={components} />
    </SWRConfig>
  );
  return StaticPage;
}
