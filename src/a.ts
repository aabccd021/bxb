import { AnyVariant, impl, Narrow, Tags, Variant } from '@practical-fp/union-types';

type TypeOf<Var extends AnyVariant> = {
  readonly Union: Var;
} & {
  readonly [Tag in Tags<Var>]: Narrow<Var, Tag>;
};

type CreateUserAndSignInError_ =
  | Variant<'Provider', { readonly value: string }>
  | Variant<'UserAlreadyExists', { readonly wahaha: string }>;

export const CreateUserAndSignInError = impl<CreateUserAndSignInError_>();

export type CreateUserAndSignInError = TypeOf<CreateUserAndSignInError_>;
