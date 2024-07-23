/**
 * This callback type is called `processCallback`.
 *
 * @mixin
 * @callback processCallback
 * @param {Object} result
 */

import { Process } from "./process";

/**
 * Represents a process dependency
 */
export class Dependency {
  /**
   * Creates a dependency instance
   * @param {Process} process
   * @param {processCallback} processCallback
   */
  constructor(public process: Process, public processCallback: any) {}
}
