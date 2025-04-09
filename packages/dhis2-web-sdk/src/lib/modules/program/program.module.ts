import { D2HttpClient } from '../../shared';
import {
  ProgramQuery,
  ProgramRuleActionQuery,
  ProgramRuleQuery,
  ProgramRuleVariableQuery,
  ProgramSectionQuery,
  ProgramStageDataElementQuery,
  ProgramStageQuery,
  ProgramStageSectionQuery,
  ProgramTrackedEntityAttributeQuery,
  TrackedEntityAttributeQuery,
  TrackedEntityTypeAttributeQuery,
  TrackedEntityTypeQuery,
} from './queries';

export class ProgramModule {
  constructor(private httpClient: D2HttpClient) {}
  get program(): ProgramQuery {
    return new ProgramQuery(this.httpClient);
  }

  get programStage(): ProgramStageQuery {
    return new ProgramStageQuery(this.httpClient);
  }

  get programSection(): ProgramSectionQuery {
    return new ProgramSectionQuery(this.httpClient);
  }

  get programStageSection(): ProgramStageSectionQuery {
    return new ProgramStageSectionQuery(this.httpClient);
  }

  get programStageDataElement(): ProgramStageDataElementQuery {
    return new ProgramStageDataElementQuery(this.httpClient);
  }

  get programRule(): ProgramRuleQuery {
    return new ProgramRuleQuery(this.httpClient);
  }

  get programRuleAction(): ProgramRuleActionQuery {
    return new ProgramRuleActionQuery(this.httpClient);
  }

  get programRuleVariable(): ProgramRuleVariableQuery {
    return new ProgramRuleVariableQuery(this.httpClient);
  }

  get programTrackedEntityAttribute(): ProgramTrackedEntityAttributeQuery {
    return new ProgramTrackedEntityAttributeQuery(this.httpClient);
  }

  get trackedEntityAttribute(): TrackedEntityAttributeQuery {
    return new TrackedEntityAttributeQuery(this.httpClient);
  }

  get trackedEntityType(): TrackedEntityTypeQuery {
    return new TrackedEntityTypeQuery(this.httpClient);
  }

  get trackedEntityTypeAttribute(): TrackedEntityTypeAttributeQuery {
    return new TrackedEntityTypeAttributeQuery(this.httpClient);
  }
}
