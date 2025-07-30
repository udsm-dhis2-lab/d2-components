// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import axios, { AxiosDefaults, AxiosInstance } from 'axios';
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
  SystemInfo,
  SystemModule,
  EventModule,
} from './modules';
import {
  D2HttpClient,
  D2IndexDb,
  D2WebConfig,
  ID2IndexDbConfig,
} from './shared';

export interface D2Window extends Window {
  d2Web: D2Web;
}

export class D2Web {
  private static instance: D2Web;
  #config!: D2WebConfig;
  httpInstance!: D2HttpClient;
  appManifest!: Manifest | null;
  currentUser!: CurrentUser | null;
  systemInfo!: SystemInfo | null;
  private constructor() {}

  public static async initialize(config: D2WebConfig): Promise<D2Web> {
    if (!D2Web.instance) {
      const instance = new D2Web();

      /**
       * Set configuration
       */
      instance.setConfig(config);

      let axiosInstance = axios.create(
        config.httpClientConfig as AxiosDefaults
      );

      /**
       * Fetch and set app manifest
       */
      await instance.setAppManifest(axiosInstance);

      /**
       * Update http instance to account for new information from manifest
       */
      const newWebConfig = new D2WebConfig({
        baseUrl: instance.rootUrl,
        indexDBConfig: config.indexDBConfig,
      });

      const indexDb = new D2IndexDb(
        newWebConfig.indexDBConfig as ID2IndexDbConfig
      );

      axiosInstance = axios.create(
        newWebConfig.httpClientConfig as AxiosDefaults
      );

      instance.setHttpInstance(axiosInstance, indexDb);

      /**
       * Fetch and set current user
       */
      await instance.setCurrentUser();

      /**
       * Set system information
       */
      await instance.setSystemInfo();

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

  async setAppManifest(axiosInstance: AxiosInstance): Promise<void> {
    const appManifestModule = new AppManifestModule(axiosInstance);

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

  async setSystemInfo(): Promise<void> {
    try {
      const systemInfo = await this.systemModule.getSystemInfo();

      if (systemInfo) {
        this.systemInfo = systemInfo;
      }
    } catch (e) {
      throw new Error('System information could not be retrieved');
    }
  }

  setHttpInstance(axiosInstance: AxiosInstance, indexDb: D2IndexDb): void {
    this.httpInstance = new D2HttpClient(axiosInstance, indexDb);
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

  get systemModule(): SystemModule {
    return new SystemModule(this.httpInstance);
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

  get eventModule(): EventModule {
    return new EventModule(this.httpInstance);
  }
  get trackerModule(): TrackerModule {
    return new TrackerModule(this.httpInstance);
  }
}
