type TaggedVariant<
  TagKey extends string = string,
  Tag extends string = string,
  Value extends Record<string, unknown> = Record<string, unknown>
> = {
  readonly [TK in TagKey]: Tag;
} & {
  readonly [VK in Exclude<keyof Value, TagKey>]: Value[VK];
};

type AnyTaggedVariant<TagKey extends string> = TaggedVariant<TagKey>;

type TagsTagged<TagKey extends string, Var extends AnyTaggedVariant<TagKey>> = Var[TagKey];

function tag<
  TagKey extends string,
  Var extends AnyTaggedVariant<TagKey>,
  Tag extends TagsTagged<TagKey, Var>,
  Value extends Record<string, unknown>
>(tagKey: TagKey, _tag: Tag, value: Value): TaggedVariant<TagKey, Tag, Value> {
  return {
    ...value,
    [tagKey]: _tag,
  };
}

type NarrowTagged<
  TagKey extends string,
  Var extends AnyTaggedVariant<TagKey>,
  Tag extends TagsTagged<TagKey, Var>
> = Extract<Var, TaggedVariant<TagKey, Tag>>;

function hasTag<
  TagKey extends string,
  Var extends AnyTaggedVariant<TagKey>,
  Tag extends TagsTagged<TagKey, Var>
>(tagKey: TagKey, variant: Var, _tag: Tag): variant is NarrowTagged<TagKey, Var, Tag> {
  return variant[tagKey] === _tag;
}

type Predicate<
  TagKey extends string,
  Var extends AnyTaggedVariant<TagKey>,
  Tag extends TagsTagged<TagKey, Var>
> = (variant: Var) => variant is NarrowTagged<TagKey, Var, Tag>;

export function predicate<
  TagKey extends string,
  Var extends AnyTaggedVariant<TagKey>,
  Tag extends TagsTagged<TagKey, Var>
>(tagKey: TagKey, _tag: Tag): Predicate<TagKey, Var, Tag> {
  return (variant: Var): variant is NarrowTagged<TagKey, Var, Tag> => hasTag(tagKey, variant, _tag);
}

type Values<TagKey extends string, Var extends AnyTaggedVariant<TagKey>> = Omit<Var, TagKey>;

type ConstructorWithExtra<
  TagKey extends string,
  Var extends AnyTaggedVariant<TagKey>,
  Tag extends TagsTagged<TagKey, Var>,
  Value extends Record<string, unknown>
> = (value: Value) => TaggedVariant<TagKey, Tag, Value> & {
  readonly tag: Tag;
  readonly is: Predicate<TagKey, Var, Tag>;
};

function constructor<
  TagKey extends string,
  Var extends AnyTaggedVariant<TagKey>,
  Tag extends TagsTagged<TagKey, Var>
>(
  tagKey: TagKey,
  tagName: Tag
): ConstructorWithExtra<TagKey, Var, Tag, Values<TagKey, NarrowTagged<TagKey, Var, Tag>>> {
  function _constructor(value: Values<TagKey, NarrowTagged<TagKey, Var, Tag>>) {
    return tag(tagKey, tagName, value);
  }

  // eslint-disable-next-line functional/immutable-data, functional/no-expression-statement
  _constructor.tag = tagName;

  // eslint-disable-next-line functional/immutable-data, functional/no-expression-statement
  _constructor.is = predicate(tagKey, tagName);

  return _constructor as any;
}

type Impl<TagKey extends string, Var extends AnyTaggedVariant<TagKey>> = {
  readonly [Tag in TagsTagged<TagKey, Var>]: ConstructorWithExtra<
    TagKey,
    Var,
    Tag,
    Values<TagKey, NarrowTagged<TagKey, Var, Tag>>
  >;
};

export interface Variant<
  Tag extends string = string,
  Value extends Record<string, unknown> = Record<string, unknown>
> {
  readonly tag: Tag;
  readonly value: Value;
}

type AnyVariant = Variant;

type Narrow<Var extends AnyVariant, Tag extends Var['tag']> = Extract<Var, Variant<Tag>>;

type ToTaggedVariant<TagKey extends string, Var extends AnyVariant> = TaggedVariant<
  TagKey,
  Var['tag'],
  Var['value']
>;

type ValueOf<K> = K[keyof K];

type MkTagged<TagKey extends string, Var extends AnyVariant> = ValueOf<{
  readonly [Tag in Var['tag']]: ToTaggedVariant<TagKey, Narrow<Var, Tag>>;
}>;

export const impl =
  <TagKey extends string>(tagKey: TagKey) =>
  <Var extends AnyVariant, TaggedVar extends MkTagged<TagKey, Var> = MkTagged<TagKey, Var>>(): Impl<
    TagKey,
    TaggedVar
  > => {
    return new Proxy({} as Impl<TagKey, TaggedVar>, {
      get: <Tag extends keyof Impl<TagKey, TaggedVar>>(
        _: Impl<TagKey, TaggedVar>,
        tagName: Tag
      ) => {
        return constructor<TagKey, TaggedVar, Tag>(tagKey, tagName);
      },
    });
  };

export type TypeOf<I> = I extends Impl<infer TagKey, infer Var>
  ? {
      readonly Union: Var;
    } & {
      readonly [Tag in TagsTagged<TagKey, Var>]: NarrowTagged<TagKey, Var, Tag>;
    }
  : never;


