export class TrackerQueryConfig {
  ignoreProgramForTrackedEntity?: boolean;

  constructor(props?: Partial<TrackerQueryConfig>) {
    this.ignoreProgramForTrackedEntity = props?.ignoreProgramForTrackedEntity;
  }
}
