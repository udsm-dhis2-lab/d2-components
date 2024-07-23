/**
 * This is the representation of the processor
 */
export class Process {
  postProcessors: any[];
  dependencies: any[];
  private _results!: any[];
  /**
   * Creates a processor
   * @constructor
   */
  constructor() {
    this.postProcessors = [];
    this.dependencies = [];
  }

  /**
   * Checks if processor has dependencies
   * @returns {boolean} - Boolean value of the result
   */
  hasDependencies() {
    return this.dependencies.length > 0;
  }

  /**
   * Adds dependency to the processor
   * @param {Dependency} dependency - The
   * @deprecated Use addPreProcess
   * @returns {Process}
   */
  preProcess(dependency: any) {
    this.dependencies.push(dependency);
    return this;
  }

  /**
   * Adds dependency to the processor
   * @param {Dependency} dependency
   * @returns {Process}
   */
  addPreProcess(dependency: any) {
    this.dependencies.push(dependency);
    return this;
  }

  /**
   * Adds callback process the output process
   * @param callback
   * @deprecated Use addPostProcess
   * @returns {Process}
   */
  postProcess(callback: (data: any) => any) {
    this.postProcessors.push(callback);
    return this;
  }

  /**
   * Adds callback process the output process
   * @param callback
   * @returns {Process}
   */
  addPostProcess(callback: any) {
    this.postProcessors.push(callback);
    return this;
  }

  /**
   * Performs pre process
   * @returns {Process}
   */
  performPreProcess() {
    this.dependencies.forEach((dependency) => {
      dependency.processCallback(dependency.process._results, this);
    });
    return this;
  }

  /**
   * Performs post process after the process has ended
   * @param {Object} data
   * @returns {Object}
   */
  performPostProcess(data: any[]) {
    this._results = data;
    let dataToProcess = data;

    this.postProcessors.forEach((callback) => {
      dataToProcess = callback(dataToProcess);
    });
    return dataToProcess;
  }
}
