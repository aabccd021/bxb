import { ChangeEvent, useCallback, useState } from 'react';

type SetInput = (event: ChangeEvent<HTMLInputElement>) => void;

export function useInput(initialState: string): readonly [string, SetInput] {
  const [value, setValue] = useState(initialState);

  const setValueFromEvent = useCallback<SetInput>((e) => setValue(e.target.value), []);

  return [value, setValueFromEvent];
}
