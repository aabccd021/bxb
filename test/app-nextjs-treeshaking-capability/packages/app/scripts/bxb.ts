import {appScripts} from 'bxb';
import * as foo from 'bxb-stack-foo';

const main = appScripts({  
  stacks: {    default: foo
  }
})

void main()
