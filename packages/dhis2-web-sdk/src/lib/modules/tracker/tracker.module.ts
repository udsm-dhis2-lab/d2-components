import { BaseTrackerQuery } from './queries';
import { D2HttpClient } from '../../shared';
import { TrackedEntityInstance } from './models';

export class TrackerModule {
  constructor(private httpClient: D2HttpClient) {}

  getTrackedEntityQuery<T extends TrackedEntityInstance>(
    model: T
  ): BaseTrackerQuery<T> {
    return new BaseTrackerQuery(model, this.httpClient);
  }
}
