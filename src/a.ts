type TaggedVariant<
  TagKey extends string = string,
  Tag extends string = string,
  Value extends Record<string, unknown> = Record<string, unknown>
> = {
  readonly [TK in TagKey]: Tag;
} & Value;

type Tags<TagKey extends string, Var extends TaggedVariant<TagKey>> = Var[TagKey];

const tag = <
  TagKey extends string,
  Var extends TaggedVariant<TagKey>,
  Tag extends Tags<TagKey, Var>,
  Value extends Record<string, unknown>
>(
  tagKey: TagKey,
  _tag: Tag,
  value: Value
): TaggedVariant<TagKey, Tag, Value> => ({
  ...value,
  [tagKey]: _tag,
});

type Narrow<
  TagKey extends string,
  Var extends TaggedVariant<TagKey>,
  Tag extends Tags<TagKey, Var>
> = Extract<Var, TaggedVariant<TagKey, Tag>>;

const hasTag = <
  TagKey extends string,
  Var extends TaggedVariant<TagKey>,
  Tag extends Tags<TagKey, Var>
>(
  tagKey: TagKey,
  variant: Var,
  _tag: Tag
): variant is Narrow<TagKey, Var, Tag> => variant[tagKey] === _tag;

type Predicate<
  TagKey extends string,
  Var extends TaggedVariant<TagKey>,
  Tag extends Tags<TagKey, Var>
> = (variant: Var) => variant is Narrow<TagKey, Var, Tag>;

export const predicate =
  <TagKey extends string, Var extends TaggedVariant<TagKey>, Tag extends Tags<TagKey, Var>>(
    tagKey: TagKey,
    _tag: Tag
  ): Predicate<TagKey, Var, Tag> =>
  (variant: Var): variant is Narrow<TagKey, Var, Tag> =>
    hasTag(tagKey, variant, _tag);

type Values<TagKey extends string, Var extends TaggedVariant<TagKey>> = Omit<Var, TagKey>;

type ConstructorWithExtra<
  TagKey extends string,
  Var extends TaggedVariant<TagKey>,
  Tag extends Tags<TagKey, Var>,
  Value extends Record<string, unknown>
> = (value: Value) => TaggedVariant<TagKey, Tag, Value> & {
  readonly tag: Tag;
  readonly is: Predicate<TagKey, Var, Tag>;
};

const constructor = <
  TagKey extends string,
  Var extends TaggedVariant<TagKey>,
  Tag extends Tags<TagKey, Var>
>(
  tagKey: TagKey,
  tagName: Tag
): ConstructorWithExtra<TagKey, Var, Tag, Values<TagKey, Narrow<TagKey, Var, Tag>>> => {
  function _constructor(value: Values<TagKey, Narrow<TagKey, Var, Tag>>) {
    return tag(tagKey, tagName, value);
  }

  // eslint-disable-next-line functional/immutable-data, functional/no-expression-statement
  _constructor.tag = tagName;

  // eslint-disable-next-line functional/immutable-data, functional/no-expression-statement
  _constructor.is = predicate(tagKey, tagName);

  return _constructor as any;
};

type Impl<TagKey extends string, Var extends TaggedVariant<TagKey>> = {
  readonly [Tag in Tags<TagKey, Var>]: ConstructorWithExtra<
    TagKey,
    Var,
    Tag,
    Values<TagKey, Narrow<TagKey, Var, Tag>>
  >;
};

export interface Variant<
  Tag extends string = string,
  Value extends Record<string, unknown> = Record<string, unknown>
> {
  readonly tag: Tag;
  readonly value: Value;
}

type ToTagged<TagKey extends string, Var extends Variant> = Var extends Variant
  ? TaggedVariant<TagKey, Var['tag'], Var['value']>
  : never;

export const impl =
  <TagKey extends string>(tagKey: TagKey) =>
  <
    UntaggedVar extends Variant,
    TaggedVar extends ToTagged<TagKey, UntaggedVar> = ToTagged<TagKey, UntaggedVar>
  >(): Impl<TagKey, TaggedVar> => {
    return new Proxy({} as Impl<TagKey, TaggedVar>, {
      get: <Tag extends keyof Impl<TagKey, TaggedVar>>(_: Impl<TagKey, TaggedVar>, tagName: Tag) =>
        constructor<TagKey, TaggedVar, Tag>(tagKey, tagName),
    });
  };

export type TypeOf<I> = I extends Impl<infer TagKey, infer Var>
  ? {
      readonly Union: Var;
    } & {
      readonly [Tag in Tags<TagKey, Var>]: Narrow<TagKey, Var, Tag>;
    }
  : never;
