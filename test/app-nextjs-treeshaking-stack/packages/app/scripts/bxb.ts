import {appScripts} from 'bxb';
import * as smaller from 'bxb-stack-smaller';
import * as larger from 'bxb-stack-larger';
const main = appScripts({  
  stacks: {
    env: { production: smaller },
    default: larger
  }
})
void main()