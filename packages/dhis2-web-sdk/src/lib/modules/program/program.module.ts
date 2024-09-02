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

  get programRule(): ProgramRuleActionQuery {
    return new ProgramRuleActionQuery(this.httpClient);
  }

  get programRuleAction(): ProgramRuleQuery {
    return new ProgramRuleQuery(this.httpClient);
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
}
