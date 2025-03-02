// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { AxiosDefaults } from 'axios';
import {
  AppManifestModule,
  D2EngineModule,
  DataElementModule,
  Manifest,
  OptionSetModule,
  ProgramModule,
  TrackerModule,
} from './modules';
import { D2HttpClient, D2WebConfig } from './shared';

export interface D2Window extends Window {
  d2Web: D2Web;
}

export class D2Web {
  private static instance: D2Web;
  #config!: D2WebConfig;
  httpInstance!: D2HttpClient;
  appManifest!: Manifest | null;
  private constructor() {}

  public static async initialize(config: D2WebConfig): Promise<D2Web> {
    if (!D2Web.instance) {
      const instance = new D2Web();
      instance.setConfig(config);
      instance.setHttpInstance(config.httpClientConfig as AxiosDefaults);
      await instance.setAppManifest();
      D2Web.instance = instance;

      (window as unknown as D2Window).d2Web = instance;
    }

    return D2Web.instance;
  }

  public static async getInstance(config: D2WebConfig): Promise<D2Web> {
    if (!D2Web.instance) {
      return await D2Web.initialize(config);
    }
    return D2Web.instance;
  }

  setConfig(config: D2WebConfig): void {
    this.#config = config;
  }

  async setAppManifest(): Promise<void> {
    const appManifestModule = new AppManifestModule(this.httpInstance);

    try {
      const manifest = await appManifestModule.get();
      this.appManifest = manifest;
    } catch (e) {
      this.appManifest = null;
    }
  }

  setHttpInstance(httpConfig: AxiosDefaults): void {
    this.httpInstance = new D2HttpClient(httpConfig);
  }

  get config(): D2WebConfig {
    return this.#config;
  }

  get programModule(): ProgramModule {
    return new ProgramModule(this.httpInstance);
  }

  get dataElementModule(): DataElementModule {
    return new DataElementModule(this.httpInstance);
  }

  get optionSetModule(): OptionSetModule {
    return new OptionSetModule(this.httpInstance);
  }

  get engineModule(): D2EngineModule {
    return new D2EngineModule();
  }

  get trackerModule(): TrackerModule {
    return new TrackerModule(this.httpInstance);
  }
}
