import { masmott } from '@/masmott_config';
import Page from '@/web/post/[id]';
import { ISRPage, makeISRPage, ViewPath } from 'masmott';
import { makeGetStaticPaths, makeGetStaticProps } from 'masmott/dist/cjs';
const viewPath: ViewPath = ['post', 'page'];
const ISRPage = makeISRPage(masmott.firebase, viewPath, Page);
export default ISRPage;
export const getStaticPaths = makeGetStaticPaths();
export const getStaticProps = makeGetStaticProps(viewPath);
