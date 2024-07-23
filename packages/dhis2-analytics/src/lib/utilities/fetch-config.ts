import { FetchMethod, FnConfig } from '../interfaces/config.interface';
import { encode } from 'base-64';

export class FetchConfig {
  config: FnConfig;
  method: FetchMethod;
  contentType: string;
  private _url: string;
  constructor(configOptions: {
    config: FnConfig;
    method: FetchMethod;
    contentType?: string;
    url: string;
  }) {
    this.config = configOptions?.config;
    this.method = configOptions?.method || 'GET';
    this.contentType = configOptions?.contentType || 'application/json';
    this._url = configOptions?.url;
  }

  get authorization(): string | undefined {
    if (!this.config.username || !this.config.password) {
      return undefined;
    }

    return `Basic ${encode(this.config.username + ':' + this.config.password)}`;
  }

  get headers() {
    const headers = {
      Accept: this.contentType,
    };
    if (!this.authorization) {
      return headers;
    }

    return { ...headers, Authorization: this.authorization };
  }

  get url(): string {
    if (!this._url) {
      throw 'No url passed';
    }

    return this.config.baseUrl + this._url;
  }

  get fetchConfig(): any {
    return {
      method: this.method,
      credentials: 'include',
      headers: this.headers,
    };
  }
}
