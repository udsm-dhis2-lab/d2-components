import { D2HttpClient } from '../../shared';
import { DataElementQuery } from './queries';

export class DataElementModule {
  constructor(private httpClient: D2HttpClient) {}
  get dataElement(): DataElementQuery {
    return new DataElementQuery(this.httpClient);
  }
}
