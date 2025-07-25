import { D2_RESOURCES } from '../constants';
import { ID2IndexDbConfig } from '../interfaces';

export class D2IndexDbConfig implements ID2IndexDbConfig {
  namespace: string;
  version: number;
  models: Record<string, string>;

  constructor(config?: Partial<ID2IndexDbConfig>) {
    this.namespace = config?.namespace || 'db';
    this.version = config?.version || 1;
    this.models = this.#setModels(config?.models || {});
  }

  #setModels(models: Record<string, string>) {
    return {
      ...this.#getDefaultModels(),
      ...(models || {}),
    };
  }

  #getDefaultModels() {
    const resources = D2_RESOURCES as Record<
      string,
      { name: string; indices: string }
    >;
    return Object.keys(resources).reduce((models, resourceKey) => {
      const resource = resources[resourceKey];

      return {
        ...models,
        [resource.name]: resource.indices,
      };
    }, {});
  }
}
