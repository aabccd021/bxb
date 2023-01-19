import { generateNextjs } from 'bxb/dist/cjs/scripts';
import * as foo from 'bxb-stack-foo';

export const main = generateNextjs({ stack: foo });
