/* istanbul ignore file */
import { makeISRPage, ViewPath } from 'masmott';
import { makeGetStaticPaths, makeGetStaticProps } from 'masmott/server';
import { ThreadPageData } from '../../generated';
import Page from '../../page-components/thread/[id]';
const viewPath: ViewPath = ['thread', 'page'];
const ISRPage = makeISRPage<ThreadPageData>(viewPath, Page);
export default ISRPage;
export const getStaticPaths = makeGetStaticPaths();
export const getStaticProps = makeGetStaticProps(viewPath);
