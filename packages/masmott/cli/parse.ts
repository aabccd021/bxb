import { Validation } from 'io-ts';
import * as yaml from 'js-yaml';
import { MasmottConfig } from './types';

export function parseMasmottConfig(configStr: string): Validation<MasmottConfig> {
  const unsafeSpecData = yaml.load(configStr);
  const decodeResult = MasmottConfig.decode(unsafeSpecData);
  return decodeResult;
}
