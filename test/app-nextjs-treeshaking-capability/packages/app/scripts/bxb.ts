import {appScripts} from 'bxb';
import * as foo from 'bxb-stack-foo';
import * as bar from 'bxb-stack-bar';

const main = appScripts({  envStacks: { production: foo },
  defaultStack: bar
})

void main()
