// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { AxiosDefaults } from 'axios';
import {
  AppManifestModule,
  CurrentUser,
  D2EngineModule,
  DataElementModule,
  Manifest,
  OptionSetModule,
  ProgramModule,
  TrackerModule,
  UserModule,
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
  currentUser!: CurrentUser | null;
  private constructor() {}

  public static async initialize(config: D2WebConfig): Promise<D2Web> {
    if (!D2Web.instance) {
      const instance = new D2Web();

      /**
       * Set configuration
       */
      instance.setConfig(config);

      /**
       * Initialize http instance to allow http request using axios
       */
      instance.setHttpInstance(config.httpClientConfig as AxiosDefaults);

      /**
       * Fetch and set app manifest
       */
      await instance.setAppManifest();

      /**
       * Update http instance to account for new information from manifest
       */
      const newWebConfig = new D2WebConfig({
        baseUrl: instance.rootUrl,
      });
      instance.setHttpInstance(newWebConfig.httpClientConfig as AxiosDefaults);

      /**
       * Fetch and set current user
       */
      await instance.setCurrentUser();

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
    const appManifestModule = new AppManifestModule();

    try {
      const manifest = await appManifestModule.get();
      this.appManifest = manifest;
    } catch (e) {
      this.appManifest = null;
    }
  }

  async setCurrentUser(): Promise<void> {
    try {
      const currentUser = await this.userModule.currentUser();

      if (currentUser) {
        this.currentUser = currentUser;
      }
    } catch (e) {
      throw new Error(
        'Current user information could not be found or determined'
      );
    }
  }

  setHttpInstance(httpConfig: AxiosDefaults): void {
    this.httpInstance = new D2HttpClient(httpConfig);
  }

  get rootUrl() {
    const defaultRootUrl = '../../..';
    if (!this.appManifest) {
      return defaultRootUrl;
    }

    return this.appManifest.activities &&
      this.appManifest.activities.dhis &&
      this.appManifest.activities.dhis.href
      ? this.appManifest.activities.dhis.href
      : defaultRootUrl;
  }

  get config(): D2WebConfig {
    return this.#config;
  }

  get userModule(): UserModule {
    return new UserModule(this.httpInstance);
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
