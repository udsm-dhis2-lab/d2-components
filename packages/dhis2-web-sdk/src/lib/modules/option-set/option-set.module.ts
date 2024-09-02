import { D2HttpClient } from '../../shared';
import { OptionQuery, OptionSetQuery } from './queries';

export class OptionSetModule {
  constructor(private httpClient: D2HttpClient) {}
  get optionSet(): OptionSetQuery {
    return new OptionSetQuery(this.httpClient);
  }

  get option(): OptionQuery {
    return new OptionQuery(this.httpClient);
  }
}
