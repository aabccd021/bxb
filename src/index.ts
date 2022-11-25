export * from './stack';
export * from './type';

export const adaptClientEnv = <T>(clientEnv: T) => ({
  browser: { window: () => window },
  client: clientEnv,
});
