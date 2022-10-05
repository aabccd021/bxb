/* eslint-disable functional/no-expression-statement */
export type Variant<
  TagKey extends string = string,
  Tag extends string = string,
  Value extends Record<string, unknown> = Record<string, unknown>
> = {
  readonly [TK in TagKey]: Tag;
} & {
  readonly [VK in Exclude<keyof Value, TagKey>]: Value[VK];
};

type UnionV =
  | Variant<'type', 'foo', { readonly num: number }>
  | Variant<'type', 'bar', { readonly str: string }>
  | Variant<'type', 'baz', { readonly bo: boolean }>;

export const v1: UnionV = {
  type: 'foo',
  num: 10,
};

export const v2: UnionV = {
  type: 'bar',
  str: 'ssss',
};

export type AnyVariant<TagKey extends string> = Variant<TagKey>;

export type Tags<TagKey extends string, Var extends AnyVariant<TagKey>> = Var[TagKey];

export function tag<
  TagKey extends string,
  Var extends AnyVariant<TagKey>,
  Tag extends Tags<TagKey, Var>,
  Value extends Record<string, unknown>
>(tagKey: TagKey, _tag: Tag, value: Value): Variant<TagKey, Tag, Value> {
  return {
    ...value,
    [tagKey]: _tag,
  };
}

type TagsV = Tags<'type', UnionV>;

export const tv1: TagsV = 'foo';

export const tv2: TagsV = 'bar';

export type Narrow<
  TagKey extends string,
  Var extends AnyVariant<TagKey>,
  Tag extends Tags<TagKey, Var>
> = Extract<Var, Variant<TagKey, Tag>>;

type NarrowV = Narrow<'type', UnionV, 'foo' | 'bar'>;

export const nv1: NarrowV = {
  type: 'foo',
  num: 10,
};

export const nv2: NarrowV = {
  type: 'bar',
  str: 'ssss',
};

export function hasTag<
  TagKey extends string,
  Var extends AnyVariant<TagKey>,
  Tag extends Tags<TagKey, Var>
>(tagKey: TagKey, variant: Var, tag: Tag): variant is Narrow<TagKey, Var, Tag> {
  return variant[tagKey] === tag;
}

// eslint-disable-next-line functional/no-return-void
export const doSomething = (union: UnionV) => {
  // union.value has type number | string

  // eslint-disable-next-line functional/no-conditional-statement
  if (hasTag('type', union, 'foo')) {
    // union.value has type number now
  }
};

export type Predicate<
  TagKey extends string,
  Var extends AnyVariant<TagKey>,
  Tag extends Tags<TagKey, Var>
> = (variant: Var) => variant is Narrow<TagKey, Var, Tag>;

export function predicate<
  TagKey extends string,
  Var extends AnyVariant<TagKey>,
  Tag extends Tags<TagKey, Var>
>(tagKey: TagKey, tag: Tag): Predicate<TagKey, Var, Tag> {
  return (variant: Var): variant is Narrow<TagKey, Var, Tag> => hasTag(tagKey, variant, tag);
}

export const doSomething2 = (list: readonly UnionV[]) => list.filter(predicate('type', 'foo'));

export type Values<TagKey extends string, Var extends AnyVariant<TagKey>> = Omit<Var, TagKey>;

export type Constructor<
  TagKey extends string,
  Var extends AnyVariant<TagKey>,
  Tag extends Tags<TagKey, Var>,
  Value extends Record<string, unknown>
> = (value: Value) => Variant<TagKey, Tag, Value>;

export interface ConstructorExtra<
  TagKey extends string,
  Var extends AnyVariant<TagKey>,
  Tag extends Tags<TagKey, Var>
> {
  readonly tag: Tag;
  readonly is: Predicate<TagKey, Var, Tag>;
}

export type ConstructorWithExtra<
  TagKey extends string,
  Var extends AnyVariant<TagKey>,
  Tag extends Tags<TagKey, Var>,
  Value extends Record<string, unknown>
> = Constructor<TagKey, Var, Tag, Value> & ConstructorExtra<TagKey, Var, Tag>;

export function constructor<
  TagKey extends string,
  Var extends AnyVariant<TagKey>,
  Tag extends Tags<TagKey, Var>
>(
  tagKey: TagKey,
  tagName: Tag
): ConstructorWithExtra<TagKey, Var, Tag, Values<TagKey, Narrow<TagKey, Var, Tag>>> {
  function _constructor(value: Values<TagKey, Narrow<TagKey, Var, Tag>>) {
    console.log('_constructor', tagKey, tagName, value);
    return tag(tagKey, tagName, value);
  }
  // eslint-disable-next-line functional/immutable-data
  _constructor.tag = tagName;
  // eslint-disable-next-line functional/immutable-data
  _constructor.is = predicate(tagKey, tagName);
  return _constructor as any;
}

// type TypeOf<TagKey extends string, Var extends AnyVariant<TagKey>> = {
//   readonly Union: Var;
// } & {
//   readonly [Tag in Tags<TagKey, Var>]: Narrow<TagKey, Var, Tag>;
// };

export type Impl<TagKey extends string, Var extends AnyVariant<TagKey>> = {
  readonly [Tag in Tags<TagKey, Var>]: ConstructorWithExtra<
    TagKey,
    Var,
    Tag,
    Values<TagKey, Narrow<TagKey, Var, Tag>>
  >;
};

export interface InVariant<
  Tag extends string = string,
  Value extends Record<string, unknown> = Record<string, unknown>
> {
  readonly tag: Tag;
  readonly value: Value;
}

export type AnyInVariant = InVariant;

export function impl<TagKey extends string, Var extends AnyVariant<TagKey>>(
  tagKey: TagKey
): Impl<TagKey, Var> {
  return new Proxy({} as Impl<TagKey, Var>, {
    get: <Tag extends keyof Impl<TagKey, Var>>(_: Impl<TagKey, Var>, tagName: any) => {
      return constructor<TagKey, Var, Tag>(tagKey, tagName);
    },
  });
}

export type ITags<IVar extends AnyInVariant> = IVar['tag'];

export type INarrow<Var extends AnyInVariant, Tag extends ITags<Var>> = Extract<
  Var,
  InVariant<Tag>
>;

type ToVar<TagKey extends string, IVar extends AnyInVariant> = Variant<
  TagKey,
  IVar['tag'],
  IVar['value']
>;

type Z<TagKey extends string, IVar extends AnyInVariant> = {
  readonly [Tag in ITags<IVar>]: ToVar<TagKey, INarrow<IVar, Tag>>;
};

type ValueOf<K> = K[keyof K];

export type Impl3<TagKey extends string, Var extends AnyVariant<TagKey>> = {
  readonly [Tag in Tags<TagKey, Var>]: ConstructorWithExtra<
    TagKey,
    Var,
    Tag,
    Values<TagKey, Narrow<TagKey, Var, Tag>>
  >;
};

export type Impl2<TagKey extends string, Var extends AnyVariant<TagKey>> = {
  readonly [Tag in Tags<TagKey, Var>]: ConstructorWithExtra<
    TagKey,
    Var,
    Tag,
    Values<TagKey, Narrow<TagKey, Var, Tag>>
  >;
};

export const impl2 =
  <TagKey extends string>(tagKey: TagKey) =>
  <
    IVar extends AnyInVariant,
    Var extends ValueOf<Z<TagKey, IVar>> = ValueOf<Z<TagKey, IVar>>
  >(): Impl<TagKey, Var> => {
    return new Proxy({} as Impl<TagKey, Var>, {
      get: <Tag extends keyof Impl<TagKey, Var>>(_: Impl<TagKey, Var>, tagName: any) => {
        return constructor<TagKey, Var, Tag>(tagKey, tagName);
      },
    });
  };

type TypeOf<I> = I extends Impl<infer TagKey, infer V>
  ? {
      readonly Union: V;
    } & {
      readonly [Tag in Tags<TagKey, V>]: Narrow<TagKey, V, Tag>;
    }
  : never;

type SignInErrorUnion<K> =
  | InVariant<'Provider', { readonly value: K }>
  | InVariant<'UserAlreadyExists', { readonly wahaha: string }>;

// eslint-disable-next-line functional/prefer-tacit
export const SignInError = <K>() => impl2('type')<SignInErrorUnion<K>>();

export type SignInError<K> = TypeOf<ReturnType<typeof SignInError<K>>>;

// type CreateUserAndSignInErrorUnion<K> =
//   | Variant<'type', 'Provider', { readonly value: K }>
//   | Variant<'type', 'UserAlreadyExists', { readonly wahaha: string }>;
//
// export const CreateUserAndSignInError = <K>() =>
//   impl<'type', CreateUserAndSignInErrorUnion<K>>('type');
//
// export type CreateUserAndSignInError<K> = TypeOf<'type', CreateUserAndSignInErrorUnion<K>>;
