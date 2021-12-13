import { MasmottConfig } from '@src/core/type';
import * as E from 'fp-ts/Either';
import { flow } from 'fp-ts/function';

import * as YAML from './library/yaml';
import { WriteFileAction } from './type';

export const decodeConfig = flow(YAML.load, E.chainW(MasmottConfig.decode));

export const makeWriteFileActions = (
  config: MasmottConfig
): readonly WriteFileAction[] => [];
