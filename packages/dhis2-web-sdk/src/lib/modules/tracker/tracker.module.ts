import { BaseTrackerQuery, ModelBaseTrackerQuery } from './queries';
import { D2HttpClient } from '../../shared';
import { TrackedEntityInstance } from './models';

export class TrackerModule {
  constructor(private httpClient: D2HttpClient) {}

  get trackedEntity(): BaseTrackerQuery<TrackedEntityInstance> {
    return new BaseTrackerQuery(this.httpClient);
  }

  getTrackedEntityQuery<T extends TrackedEntityInstance>(
    model: T
  ): ModelBaseTrackerQuery<T> {
    return new ModelBaseTrackerQuery(this.httpClient, model);
  }
}
