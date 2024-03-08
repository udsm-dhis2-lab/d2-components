import { Runner } from "./runner";
import { Process } from "./process";
import { ProgressPromise } from "./progress-promise";

/**
 * Represents the fetcher process
 *@extends Process
 */
export class Fetcher extends Process {
  parameters: any;
  /**
   * Creates a fethcer
   * @constructor
   */
  constructor() {
    super();
    this.parameters = {};
  }

  /**
   * Gets the URL Parameters
   * @returns {string}
   * @private
   */
  get _urlParameters() {
    let url = "";

    Object.keys(this.parameters).forEach((key) => {
      if (url !== "") {
        url += "&";
      }
      if (typeof this.parameters[key] === "string") {
        url += key + "=" + this.parameters[key];
      } else {
        Object.keys(this.parameters[key]).forEach((key2) => {
          if (url !== "") {
            url += "&";
          }
          if (this.parameters[key][key2] === "") {
            url += key + "=" + key2;
          } else {
            url += key + "=" + key2 + ":" + this.parameters[key][key2];
          }
        });
      }
    });
    return url;
  }

  /**
   * Gets the url
   * @throws Implementation Error
   * @returns {string}
   */
  get url(): string {
    throw new Error("Should implement url generation");
  }

  /**
   * Gets the running process started
   * @returns {Promise}
   */
  get(): Promise<any> {
    return Runner.getInstance()?.getResults(this);
  }

  /**
   * Set paremeters
   * @param {Object} parameters - The parameters to be passed to the url
   * @returns {Fetcher} - Object of the fetcher
   */
  setParameters(parameters: any) {
    Object.keys(parameters).forEach((key) => {
      this.parameters[key] = parameters[key];
    });
    return this;
  }

  /**
   * Get Dependency results
   * @returns {ProgressPromise}
   */
  getDependecyFetchResults() {
    const promises = this.dependencies.map((dependency) => {
      return Runner.getInstance()?.getResults(dependency.process);
    });

    return ProgressPromise.all(promises);
  }
  _encode64(buff: Iterable<number>) {
    return btoa(
      new Uint8Array(buff).reduce((s, b) => s + String.fromCharCode(b), "")
    );
  }

  hash() {
    return this.url;
  }
}
