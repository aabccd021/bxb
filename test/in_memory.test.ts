import { json, readonlyRecord, task } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import * as t from 'io-ts';
import { behavior, expect, mkTest, runVitest } from 'unit-test-ts';
import * as vitest from 'vitest';

import { impl, predicate, TypeOf, Variant } from '../src/a';

type TagC<TagKey extends string, Tag extends string> = {
  readonly [TK in TagKey]: t.LiteralC<Tag>;
};

type TaggedC<
  TagKey extends string,
  Tag extends string,
  V extends t.TypeC<t.Props>
  // eslint-disable-next-line functional/prefer-readonly-type
> = t.IntersectionC<[t.TypeC<{ readonly [TK in TagKey]: t.LiteralC<Tag> }>, V]>;

const AddTag = <TagKey extends string, Tag extends string, V extends t.TypeC<t.Props>>(
  tagKey: TagKey,
  tag: Tag,
  v: V
): TaggedC<TagKey, Tag, V> =>
  t.intersection([
    t.type({
      [tagKey]: t.literal(tag),
    } as TagC<TagKey, Tag>),
    v,
  ]);

type TaggedRecordC<TagKey extends string, V extends Record<string, t.TypeC<t.Props>>> = {
  readonly [K in keyof V]: K extends string ? TaggedC<TagKey, K, V[K]> : never;
};

const MapTag = <TagKey extends string, V extends Record<string, t.TypeC<t.Props>>>(
  tagKey: TagKey,
  vRec: V
): TaggedRecordC<TagKey, V> =>
  pipe(
    vRec,
    readonlyRecord.mapWithIndex((tag, v) => AddTag(tagKey, tag, v))
  ) as TaggedRecordC<TagKey, V>;

const VKCodec = MapTag('method', {
  VV: t.type({
    value: t.number,
    yaa: t.string,
  }),
  KK: t.type({
    bo: t.boolean,
  }),
});

type BTypeOf<K extends Record<string, TaggedC<string, string, t.TypeC<t.Props>>>> = {
  readonly [KK in keyof K]: t.TypeOf<K[KK]>;
};

export const vv: BTypeOf<typeof VKCodec>['VV'] = {
  method: 'VV',
  value: 12,
  yaa: 'g',
};

const SignOutError = json.stringify({
  Unknown: t.type({
    value: t.number,
    yaa: t.string,
  }),
  Provider: t.type({
    value: t.string,
  }),
});

export const a: t.TypeOf<typeof SignOutError> = {
  type: 'Unknown',
  value: 10,
};

type SignInErrorUnion<K> =
  | Variant<'Provider', { readonly value: K }>
  | Variant<'UserAlreadyExists', { readonly wahaha: string }>;

// eslint-disable-next-line functional/prefer-tacit
const SignInError = <K>() => impl('type')<SignInErrorUnion<K>>();

type SignInError<K> = TypeOf<ReturnType<typeof SignInError<K>>>;

const NumberSignInError = SignInError<number>();

type NumberSignInError = SignInError<number>;

const yaaProvider: NumberSignInError['Provider'] = NumberSignInError.Provider({
  value: 76,
});

export const kkkProvider = NumberSignInError.Provider({
  value: 99,
});

export const yooProvider: NumberSignInError['Provider'] = {
  type: 'Provider',
  value: 99,
};

const barUserAlreadyExists: NumberSignInError['UserAlreadyExists'] =
  NumberSignInError.UserAlreadyExists({
    wahaha: 'ggg',
  });

export const k: readonly NumberSignInError['Provider'][] = [
  NumberSignInError.Provider({ value: 99 }),
  NumberSignInError.UserAlreadyExists({ wahaha: 'zzz' }),
  NumberSignInError.Provider({ value: 42 }),
  NumberSignInError.UserAlreadyExists({ wahaha: 'kkk' }),
].filter(predicate('type', 'Provider'));

const behaviors = [
  behavior(
    'yyy',
    expect({
      task: task.of(yaaProvider),
      resolvesTo: {
        type: 'Provider',
        value: 76,
      },
    })
  ),

  behavior(
    'zzz',
    expect({
      task: task.of(barUserAlreadyExists),
      resolvesTo: {
        type: 'UserAlreadyExists',
        wahaha: 'ggg',
      },
    })
  ),

  behavior(
    'zzz',
    expect({
      task: task.of(
        [
          NumberSignInError.Provider({ value: 99 }),
          NumberSignInError.UserAlreadyExists({ wahaha: 'zzz' }),
          NumberSignInError.Provider({ value: 42 }),
          NumberSignInError.UserAlreadyExists({ wahaha: 'kkk' }),
        ].filter(predicate('type', 'Provider'))
      ),
      resolvesTo: [
        NumberSignInError.Provider({ value: 99 }),
        NumberSignInError.Provider({ value: 42 }),
      ],
    })
  ),
];

const main = pipe(
  behaviors,
  mkTest({ hook: { beforeEach: task.of(task.of(42)) } }),
  runVitest(vitest)
);

main();
