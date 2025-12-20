import { V1Status } from '@kubernetes/client-node';

/**
 * Interface for errors thrown by the @kubernetes/client-node.
 * This library does not throw a native Error object, but an object with response and body.
 */
export interface K8sHttpError {
  response: {
    statusCode: number;
  };
  body: V1Status; // Contains details like 'reason', 'message', 'code'
}

/**
 * Type Guard: Checks at runtime if an unknown error is a K8s error.
 * This provides full type safety in if-blocks without using 'as any'.
 */
export function isK8sError(error: unknown): error is K8sHttpError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    'body' in error &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (error as any).response?.statusCode === 'number'
  );
}
