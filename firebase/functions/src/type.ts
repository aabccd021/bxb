import * as functions from 'firebase-functions';
import { RefSFSpec } from './field/ref';
import { StringSFSpec } from './field/string';

export type SFSpec = StringSFSpec | RefSFSpec;

export type SF = {
  readonly name: string;
  readonly spec: SFSpec;
};

export type RefSpec = {
  readonly collectionName: string;
  readonly fieldName: string;
};

export type JoinSpec = {
  readonly firstRef: RefSpec;
  readonly refChain: readonly RefSpec[];
  readonly selectedFieldNames: readonly string[];
};

export type View = {
  readonly viewName: string;
  readonly selectedFieldNames: readonly string[];
  readonly joinSpecs: readonly JoinSpec[];
};

export type Collection = {
  readonly collectionName: string;
  readonly src: readonly SF[];
  readonly view: readonly View[];
};

export type VFTrigger = {
  readonly [triggerName: string]:
    | functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>
    | functions.CloudFunction<
        functions.Change<functions.firestore.QueryDocumentSnapshot>
      >;
};
