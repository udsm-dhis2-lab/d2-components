// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { AxiosDefaults } from 'axios';
import { DataElementModule, OptionSetModule, ProgramModule } from './modules';
import { D2HttpClient, D2WebConfig } from './shared';

export class D2Web {
  private static instance: D2Web;
  #config!: D2WebConfig;
  #httpInstance!: D2HttpClient;
  private constructor() {}

  public static getInstance(config: D2WebConfig): D2Web {
    if (!D2Web.instance) {
      const instance = new D2Web();
      instance.setConfig(config);
      instance.setHttpInstance(config.httpClientConfig as AxiosDefaults);
      D2Web.instance = instance;
    }
    return D2Web.instance;
  }

  setConfig(config: D2WebConfig): void {
    this.#config = config;
  }

  setHttpInstance(httpConfig: AxiosDefaults): void {
    this.#httpInstance = new D2HttpClient(httpConfig);
  }

  get config(): D2WebConfig {
    return this.#config;
  }

  get programModule(): ProgramModule {
    return new ProgramModule(this.#httpInstance);
  }

  get dataElementModule(): DataElementModule {
    return new DataElementModule(this.#httpInstance);
  }

  get optionSetModule(): OptionSetModule {
    return new OptionSetModule(this.#httpInstance);
  }
}