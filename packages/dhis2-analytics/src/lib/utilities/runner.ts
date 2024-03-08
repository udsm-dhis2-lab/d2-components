import { MultiFetcher } from '../utilities/multi-fetcher';
import { FnConfig } from '../interfaces/config.interface';
import { FetchConfig } from './fetch-config';
import { Fetcher } from './fetcher';
import fetch from 'node-fetch';
/**
 * Runner represents the process which will schedule and run operations of the processes
 */
export class Runner {
  private static _instance: Runner;
  cache: any;
  config!: FnConfig;

  private constructor(configurations?: FnConfig) {
    this.cache = {};
    if (configurations) this.config = configurations;
  }
  /**
   * Initiates the runner singleton instance
   * @param configurations
   */
  static initiateRunner(configurations?: FnConfig): void {
    if (!Runner._instance) {
      Runner._instance = new Runner(configurations);
    }
  }

  /**
   * Get the Runner instance
   * @returns {Runner}
   */
  get instance() {
    return this;
  }

  static getInstance(): Runner {
    return Runner._instance;
  }

  /**
   * This callback type is called `resolveCallback`.
   *
   * @callback resolveCallback
   * @param {Object} responseResult
   */

  /**
   * This callback type is called `rejectCallback`.
   *
   * @callback rejectCallback
   * @param {Error} error
   */

  /**
   * Fetches the data from the fetcher
   * @param {Fetcher} fetcher
   * @param {resolveCallback} resolve
   * @param {rejectCallback} reject
   * @private
   */
  _fetch(fetcher: Fetcher, resolve: any, reject: any) {
    if (!this.instance) {
      let error =
        'Configuration not set please configure function ' +
        'analytics eg {baseUrl:"dhis_base_url", username:"username", ' +
        'password:"password"}';

      throw Error(error);
    }
    let hashed: any = fetcher.hash();

    if (!this.cache[hashed]) {
      this.cache[hashed] = {
        finished: false,
        resolutions: [],
      };

      const config = new FetchConfig({
        config: this.config,
        method: 'GET',
        url: fetcher.url,
      });

      fetch(config.url, config.fetchConfig).then(
        async (results) => {
          this.cache[hashed].data = await results.json();
          resolve(
            fetcher.performPostProcess(
              JSON.parse(JSON.stringify(this.cache[hashed].data))
            )
          );
          this.cache[hashed].resolutions.forEach((resolution: any) => {
            resolution(
              fetcher.performPostProcess(
                JSON.parse(JSON.stringify(this.cache[hashed].data))
              )
            );
          });
          this.cache[hashed].finished = true;
        },
        (err) => {
          reject(err);
        }
      );
    } else {
      if (!this.cache[hashed].finished) {
        this.cache[hashed].resolutions.push(resolve);
      } else {
        resolve(
          fetcher.performPostProcess(
            JSON.parse(JSON.stringify(this.cache[hashed].data))
          )
        );
      }
    }
  }

  /**
   * Fetches data related to a fetcher
   * @param {Fetcher} fetcher
   * @returns {ProgressPromise}
   */
  getResults(fetcher: Fetcher | MultiFetcher): Promise<any> {
    if ((fetcher as MultiFetcher).fetchers) {
      // If is a multifetcher
      return this.getAllResults(fetcher as MultiFetcher);
    }
    return new Promise((resolve, reject) => {
      if (fetcher.hasDependencies()) {
        fetcher
          .getDependecyFetchResults()
          .then(() => {
            fetcher.performPreProcess();
            this._fetch(fetcher, resolve, reject);
          })
          .catch((err: any) => {
            reject();
          });
      } else {
        this._fetch(fetcher, resolve, reject);
      }
    });
  }

  /**
   * Fetches data for multiple fetchers
   * @param {MultiFetcher} multifetcher
   * @returns {Promise}
   */
  getAllResults(multifetcher: MultiFetcher) {
    return new Promise((resolve, reject) => {
      const promises = multifetcher.fetchers.map((fetcher: Fetcher) =>
        this.getResults(fetcher)
      );

      return Promise.all(promises)
        .then((results) => {
          resolve(multifetcher.performPostProcess(results));
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
