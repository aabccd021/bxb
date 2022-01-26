/**
 *
 */
export interface Dict<T> {
  readonly [key: string]: T;
}

/**
 *
 */
export type StringDFS = {
  readonly _type: 'string';
};

/**
 *
 */
// export type ForeignKeyDFS = {
// readonly _type: 'foreignKey';
// readonly referencedCollection: string;
// };

/**
 * Data Field Spec
 */
export type DFS = StringDFS;
//  | ForeignKeyDFS;

/**
 * Collection Data Spec
 */
export type CollectionDS = Dict<DFS>;

/**
 *
 */
export type SelectVS = Dict<undefined>;

/**
 *
 */
export type VS = SelectVS;

/**
 *
 */
export type CollectionVS = Dict<VS>;

/**
 *
 */
export type CollectionSpec = {
  readonly data?: CollectionDS;
  readonly view?: CollectionVS;
};

/**
 *
 */
export type Spec = Dict<CollectionSpec>;

/**
 *
 */
export type FirebaseConfig = {
  readonly projectId: string;
};

/**
 *
 */
export type Masmott = {
  readonly firebase: FirebaseConfig;
  readonly spec: Spec;
};
