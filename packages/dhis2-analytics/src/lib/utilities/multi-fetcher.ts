import { Runner } from './runner';
import { Fetcher } from './fetcher';

/**
 * Represents the multiple fetcher process
 *@extends Fetcher
 */
export class MultiFetcher extends Fetcher {
  private _fetchers: Fetcher[];
  /**
   * Creates a fethcer
   * @constructor
   */
  constructor(fetchers: Fetcher[]) {
    super();
    this._fetchers = fetchers;
  }

  /**
   * Gets the Fetchers
   * @returns {array} fetchers - Array of Fetchers
   */
  get fetchers() {
    return this._fetchers;
  }

  /**
   * Gets the executed Promise
   * @returns {ProgressPromise} progressPromise - Promise which alerts progresss
   */
  override get(): Promise<any> {
    const runnerInstance = Runner.getInstance();
    return runnerInstance.getAllResults(this);
  }
}
