// Fallback for engines that don't support Symbol
const LISTENERS = Symbol ? Symbol() : '__listeners';

/**
 * Represents Progress Promise
 * @extends Promise
 */
export class ProgressPromise extends Promise<any> {
  constructor(executor: any) {
    super((resolve: any, reject: (arg0: any) => void) =>
      executor(
        resolve,
        reject,
        // Pass method for passing progress to listener
        (value: any) => {
          try {
            return (this as any)[LISTENERS].forEach((listener: any) =>
              listener(value)
            );
          } catch (error) {
            reject(error);
          }
          return undefined;
        }
      )
    );

    (this as any)[LISTENERS] = [];
  }
  /**
   *
   * @param {callback} handler
   */
  progress(handler: any) {
    if (typeof handler !== 'function') {
      throw new Error('PROGRESS_REQUIRES_FUNCTION');
    }
    (this as any)[LISTENERS].push(handler);
    return this;
  }
  /**
   *
   * @param {*} promises
   */
  static override all(promises: any) {
    const results = new Array(promises.length);
    const length = promises.length;
    let resolveCount = 0;

    return new ProgressPromise((resolve: any, reject: any, progress: any) => {
      promises.forEach((promise: any, index: number) => {
        promise
          .then((result: any) => {
            results[index] = result;
            (results as any).proportion = ++resolveCount / length;
            progress(results);
            if (resolveCount === length) resolve(results);
          })
          .catch(reject);
      });
    });
  }
  /**
   *
   * @param {*} inputs
   * @param {*} handler
   */
  static sequence(inputs: any, handler: any) {
    const results: any[] = [];
    const length = inputs.length;
    let resolveCount = 0;

    return new ProgressPromise((resolve: any, reject: any, progress: any) => {
      function invokeNext() {
        handler
          .call(null, inputs[results.length])
          .then((result: any) => {
            results.push(result);
            (results as any).proportion = ++resolveCount / length;
            progress(results);
            if (results.length === length) resolve(results);
            else invokeNext();
          })
          .catch(reject);
      }
      invokeNext();
    });
  }
}
