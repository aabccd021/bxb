import { generateNextjs } from 'bxb/cjs/scripts/node';
import * as foo from 'bxb-stack-foo';

export const main = generateNextjs({ stack: foo });
