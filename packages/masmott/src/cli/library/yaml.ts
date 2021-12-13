import * as E from 'fp-ts/Either';
import { identity } from 'fp-ts/function';
import * as yaml from 'js-yaml';

export const load = (str: string) => E.tryCatch(() => yaml.load(str), identity);
