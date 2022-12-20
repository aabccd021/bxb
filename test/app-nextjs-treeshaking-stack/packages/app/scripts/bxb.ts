import {appScripts} from 'bxb';
import * as foo from 'bxb-stack-foo';
import * as bar from 'bxb-stack-bar';

const main = appScripts({  
  stacks: {
    env: { production: foo },
    default: bar
  }
})

void main()
