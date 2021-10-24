// import { initializeApp } from "firebase-admin/app";
import { ViewPath } from "../../masmott";
import { makeGetStaticPaths, makeGetStaticProps } from "../../masmott/fetching";
import { makeStaticPage } from "../../masmott/isr";

const viewPath: ViewPath = ["thread", "page"];

export const getStaticPaths = makeGetStaticPaths();

export const getStaticProps = makeGetStaticProps(viewPath);

const StaticPage = makeStaticPage(viewPath);

export default StaticPage;
