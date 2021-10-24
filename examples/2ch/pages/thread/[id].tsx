import { ThreadPageData } from "../../generated";
import { ViewPath } from "../../masmott";
import { makeGetStaticPaths, makeGetStaticProps } from "../../masmott/fetching";
import { makeStaticPage } from "../../masmott/isr";
import { components } from "../../page-components/thread/[id]";
const viewPath: ViewPath = ["thread", "page"];
const StaticPage = makeStaticPage<ThreadPageData>(viewPath, components);
export default StaticPage;
export const getStaticPaths = makeGetStaticPaths();
export const getStaticProps = makeGetStaticProps(viewPath);