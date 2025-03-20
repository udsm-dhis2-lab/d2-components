import { D2HttpClient } from '../../shared';
import { OptionGroupQuery, OptionQuery, OptionSetQuery } from './queries';

export class OptionSetModule {
  constructor(private httpClient: D2HttpClient) {}
  get optionSet(): OptionSetQuery {
    return new OptionSetQuery(this.httpClient);
  }

  get optionGroup(): OptionGroupQuery {
    return new OptionGroupQuery(this.httpClient);
  }

  get option(): OptionQuery {
    return new OptionQuery(this.httpClient);
  }
}
