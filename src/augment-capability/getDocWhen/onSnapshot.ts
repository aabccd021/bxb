import { either, io, ioOption, ioRef, option } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import type { Option } from 'fp-ts/Option';
import type { Task } from 'fp-ts/Task';

import type { Stack } from '../..';
import type { Unsubscribe } from '../../type/client/db/OnSnapshot';

export const fromOnSnapshot =
  <Env>(onSnapshot: (t: Env) => Stack.client.db.OnSnapshot.Fn) =>
  (env: Env) =>
  <T>(param: Stack.client.db.GetDocWhen.Param<T>): Task<T> =>
  () =>
    // eslint-disable-next-line functional/no-return-void
    new Promise<T>((resolve) =>
      pipe(
        ioRef.newIORef<Option<Unsubscribe>>(option.none),
        io.chain((unsubRef) =>
          pipe(
            onSnapshot(env)({
              key: param.key,
              onChanged: flow(
                either.mapLeft((err) => ({ ...err, capability: 'client.db.getDocWhen' as const })),
                param.select,
                ioOption.fromOption,
                ioOption.chainIOK((value) =>
                  pipe(
                    // eslint-disable-next-line functional/no-return-void
                    () => resolve(value),
                    io.chain(() => unsubRef.read),
                    ioOption.chainIOK((unsub) => unsub)
                  )
                ),
                io.map(() => undefined)
              ),
            }),
            io.chain(flow(option.some, unsubRef.write))
          )
        )
      )()
    );
