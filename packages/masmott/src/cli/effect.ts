// const args = process.argv.slice(2);

import * as BOOL from 'fp-ts/boolean';
import * as C from 'fp-ts/Console';
import * as E from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/function';
import * as IO from 'fp-ts/IO';
import * as A from 'fp-ts/ReadonlyArray';
import { Validation } from 'io-ts';

import * as CP from './library/child_process';
import * as FS from './library/fs';
import { decodeConfig, makeWriteFileActions } from './pure';
import { GenerateCmdArgs, WriteFileAction } from './type';

// commands.forEach((command) => {
//   if (isEqual(args, command.args)) {
//     command.handler();
//   }

// });

// export function generate(): IO.IO<void> {
//   const configStr = fs.readFileSync('./masmott.yaml', { encoding: 'utf-8' });
//   const configParseResult = parseMasmottConfig(configStr);
//   if (isLeft(configParseResult)) {
//     throw Error(PathReporter.report(configParseResult)[0]);
//   }
//   const config = configParseResult.right;
//   const writeFileActions = makeWriteFileActions(config);
//   writeFileActions.forEach(({ dir, name, content }) => {
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir, { recursive: true });
//     }
//     fs.writeFileSync(`${dir}/${name}`, content);
//   });
//   exec('yarn lint --fix');
// }

// eslint-disable-next-line @typescript-eslint/no-empty-function
const doNothing: IO.IO<void> = () => {};

const writeFile = ({ dir, name, content }: WriteFileAction): IO.IO<void> =>
  pipe(
    dir,
    FS.exists,
    IO.chainFirst(
      BOOL.fold(
        () => doNothing,
        () => FS.mkdir(dir, { recursive: true })
      )
    ),
    IO.chain(() => FS.writeFile(`${dir}/${name}`, content))
  );

const generate = (_: GenerateCmdArgs): IO.IO<void> =>
  pipe(
    FS.readFileAsString('./masmott.yaml', { encoding: 'utf-8' }),
    IO.chain(
      flow(
        E.chain(decodeConfig),
        E.map(flow(makeWriteFileActions, A.map(writeFile), IO.sequenceArray)),
        E.getOrElse(() => doNothing)
      )
    ),
    IO.chain(() => CP.exec('yarn lint --fix'))
  );

const decodeAndRun = <A>(
  decode: (args: readonly string[]) => Validation<A>,
  handle: (a: A) => IO.IO<void>
) =>
  E.orElse((args: readonly string[]) =>
    pipe(
      args,
      decode,
      E.map(handle),
      E.mapLeft(() => args)
    )
  );

export const cli: IO.IO<void> = pipe(
  process.argv.slice(2),
  E.left,
  decodeAndRun(GenerateCmdArgs.decode, generate),
  E.getOrElse(() => C.error(`unknown command`))
);
