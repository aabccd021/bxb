import { useCallback, useState } from 'react';
import { SetInput } from './types';

export function useInput(initialState: string): readonly [string, SetInput] {
  const [value, setValue] = useState(initialState);

  const setValueFromEvent = useCallback<SetInput>(
    (e) => setValue(e.target.value),
    []
  );

  return [value, setValueFromEvent];
}
