import { Validation } from 'io-ts';
import * as yaml from 'js-yaml';
import { getClientStr } from './client';
import { cypressTsconfig, packageJson, tsconfig } from './etc';
import { MasmottConfig, WriteFileDict } from './types';

export function parseMasmottConfig(configStr: string): Validation<MasmottConfig> {
  const unsafeSpecData = yaml.load(configStr);
  const decodeResult = MasmottConfig.decode(unsafeSpecData);
  return decodeResult;
}

export function getWriteFileDict(config: MasmottConfig): WriteFileDict {
  return {
    'masmott.ts': getClientStr(config),
    'tsconfig.json': tsconfig,
    'package.json': packageJson(config.firebase.projectId),
    cypress: {
      'tsconfig.json': cypressTsconfig,
    },
  };
}
