
import { generateUid } from "@iapps/d2-web-sdk";

export class TrackerRelationship {
  relationship!: string;
  relationshipType!: string;
  trackedEntityInstance!: string;
  relationDirection!: 'FROM' | 'TO';
  constructor(
    public relationshipResponse: Record<string, any>,
    public currentTrackedEntityInstance: string
  ) {
    this.relationshipType = (relationshipResponse as any)?.relationshipType;
    this.relationship =
      (relationshipResponse as any)?.relationship || generateUid();
    const { trackedEntityInstance, relationDirection } =
      this.getRelatedTrackedEntityInstance(
        relationshipResponse,
        currentTrackedEntityInstance
      );

    this.trackedEntityInstance = trackedEntityInstance;
    this.relationDirection = relationDirection;
  }

  getRelatedTrackedEntityInstance(
    relationshipResponse: Record<string, any>,
    currentTrackedEntityInstance: string
  ): { trackedEntityInstance: string; relationDirection: 'FROM' | 'TO' } {
    const relatedEntity = (relationshipResponse as any).to?.trackedEntity
      ?.trackedEntity;

    if (relatedEntity === currentTrackedEntityInstance) {
      return {
        trackedEntityInstance: (relationshipResponse as any).from?.trackedEntity
          ?.trackedEntity,
        relationDirection: 'FROM',
      };
    }

    return { trackedEntityInstance: relatedEntity, relationDirection: 'TO' };
  }

  static fromJson(jsonData: Record<string, string>): TrackerRelationship {
    const trackerRelationship = new TrackerRelationship(
      {},
      jsonData['currentTrackedEntityInstance']
    );
    trackerRelationship.relationship = generateUid();
    trackerRelationship.relationshipType = jsonData['relationshipType'];
    trackerRelationship.trackedEntityInstance =
      jsonData['trackedEntityInstance'] || jsonData['trackedEntity'];
    trackerRelationship.relationDirection = jsonData['relationDirection'] as
      | 'FROM'
      | 'TO';
    return trackerRelationship;
  }

  toObject() {
    return {
      relationshipType: this.relationshipType,
      relationship: this.relationship,
      from: {
        trackedEntity: {
          trackedEntity:
            this.relationDirection === 'FROM'
              ? this.trackedEntityInstance
              : this.currentTrackedEntityInstance,
        },
      },
      to: {
        trackedEntity: {
          trackedEntity:
            this.relationDirection === 'TO'
              ? this.trackedEntityInstance
              : this.currentTrackedEntityInstance,
        },
      },
    };
  }
}
