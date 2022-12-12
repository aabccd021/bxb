import * as onAuthUserCreated from './onAuthUserCreated';
import * as onObjectCreated from './onObjectCreated';

export { onAuthUserCreated, onObjectCreated };

export const allSuites = [onAuthUserCreated.suite, onObjectCreated.suite];
