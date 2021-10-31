#!/usr/bin/env node

import { isLeft } from 'fp-ts/lib/Either';
import * as fs from 'fs';
import * as t from 'io-ts';
import { PathReporter } from 'io-ts/PathReporter';
import * as yaml from 'js-yaml';
import mapValues from 'lodash/mapValues';

const StringFieldSchema = t.literal('string');

const RefIdFieldSchema = t.type({
  type: t.literal('refId'),
  referTo: t.string,
});

const FieldSchema = t.union([StringFieldSchema, RefIdFieldSchema]);

const CollectionSchema = t.union([t.record(t.string, FieldSchema), t.null]);

const Schema = t.record(t.string, CollectionSchema);

const CountViewSchema = t.type({
  count: t.string,
  groupBy: t.string,
});

const ViewSchema = t.record(t.string, CountViewSchema);

const CollectionViewSchemas = t.record(t.string, ViewSchema);

const ViewSchemas = t.record(t.string, CollectionViewSchemas);

const FirebaseConfig = t.type({
  projectId: t.string,
});

const Masmott = t.type({
  schema: Schema,
  views: ViewSchemas,
  firebase: FirebaseConfig,
});

type Masmott = t.TypeOf<typeof Masmott>;

const specStr = fs.readFileSync('./masmott.yaml', { encoding: 'utf-8' });
const unsafeSpecData = yaml.load(specStr);
const decodeResult = Masmott.decode(unsafeSpecData);

if (isLeft(decodeResult)) {
  throw Error(PathReporter.report(decodeResult)[0]);
}

const { schema, firebase } = decodeResult.right;

const spec = mapValues(schema, () => {
  const src = {};
  return { src };
});

const clientStr = `/* istanbul ignore file */

import { Doc, DocCreation, FirebaseOptions, Spec, useDoc, useDocCreation } from 'masmott';

export const options: FirebaseOptions = { projectId: '${firebase.projectId}' };

export const spec = ${JSON.stringify({ spec })}

  `;

fs.writeFileSync('masmott.ts', clientStr);
