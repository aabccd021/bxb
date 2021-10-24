import { NextPage } from "next";
import { useRouter } from "next/dist/client/router";
import React, { useEffect, useState } from "react";
import { SWRConfig } from "swr";
import { Doc, DocData, ISRPageProps, useDoc, ViewPath } from ".";

export type PageDocComponents<DD extends DocData = DocData> = {
  readonly Error: Doc.ErrorComponent;
  readonly Fetching: Doc.FetchingComponent;
  readonly LoadedExists: Doc.LoadedExistsComponent<DD>;
  readonly LoadedNotExists: Doc.LoadedNotExistsComponent;
};

export type PageComponents<DD extends DocData = DocData> =
  PageDocComponents<DD> & {
    readonly RouterLoading: () => JSX.Element;
  };

function DocPage<DD extends DocData = DocData>({
  viewPath: [collection, view],
  components: { Error, Fetching, LoadedExists, LoadedNotExists },
  id,
}: {
  readonly viewPath: ViewPath;
  readonly components: PageDocComponents<DD>;
  readonly id: string;
}): JSX.Element {
  const doc = useDoc<Doc.Type<DD>>([collection, id], view);
  if (doc.state === "error") return <Error doc={doc} id={id} />;
  if (doc.state === "fetching") return <Fetching doc={doc} id={id} />;
  if (doc.exists) return <LoadedExists doc={doc} id={id} />;
  return <LoadedNotExists doc={doc} id={id} />;
}

function Page<DD extends DocData = DocData>({
  viewPath,
  components,
}: {
  readonly viewPath: ViewPath;
  readonly components: PageComponents<DD>;
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
    return <components.RouterLoading />;
  }

  return <DocPage viewPath={viewPath} components={components} id={id} />;
}

export function makeStaticPage<DD extends DocData = DocData>(
  viewPath: ViewPath,
  components: PageComponents<DD>
): NextPage<ISRPageProps> {
  const StaticPage: NextPage<ISRPageProps> = ({ fallback }) => (
    <SWRConfig value={{ fallback }}>
      <Page viewPath={viewPath} components={components} />
    </SWRConfig>
  );
  return StaticPage;
}
