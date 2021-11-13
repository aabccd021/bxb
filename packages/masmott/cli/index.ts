import isEqual from 'lodash/isEqual';
import { build } from './build';
import { generate } from './generate';

type Command = {
  readonly args: readonly string[];
  readonly handler: () => void;
};

const commands: readonly Command[] = [
  {
    args: ['generate'],
    handler: generate,
  },
  {
    args: ['build'],
    handler: build,
  },
];

const args = process.argv.slice(2);

commands.forEach((command) => {
  if (isEqual(args, command.args)) {
    command.handler();
  }
});
