import { TrackerRelationship } from '../models';

export class TrackerRelationshipUtil {
  static getRelationships(
    relationshipResponses: Record<string, any>[],
    currentTrackedEntityInstance: string
  ): TrackerRelationship[] {
    return relationshipResponses.map(
      (relation) =>
        new TrackerRelationship(relation, currentTrackedEntityInstance)
    );
  }
}
