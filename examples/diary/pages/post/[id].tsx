import { ISRPage, makeISRPage, ViewPath } from 'masmott';
import { makeGetStaticPaths, makeGetStaticProps } from 'masmott/dist/cjs';
import { masmott } from '../../masmott';
import Page from '../../web/post/[id]';
const viewPath: ViewPath = ['post', 'card'];
const ISRPage = makeISRPage(masmott.firebase, viewPath, Page);
export default ISRPage;
export const getStaticPaths = makeGetStaticPaths();
export const getStaticProps = makeGetStaticProps(viewPath);
