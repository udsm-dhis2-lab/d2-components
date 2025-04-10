import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AttributeFieldDecorator,
  D2Web,
  D2Window,
  DataElement,
  DataFilterCondition,
  DataOrderCriteria,
  DataQueryFilter,
  ITrackedEntityInstance,
  ModelBaseTrackerQuery,
  Pager,
  TrackedEntityDecorator,
  TrackedEntityInstance,
} from '@iapps/d2-web-sdk';
import { d2Web } from '@iapps/ng-dhis2-shell';

class NeedDistribution
  extends TrackedEntityInstance
  implements ITrackedEntityInstance
{
  batchNumber!: string;
}

class NeedQuery extends ModelBaseTrackerQuery<NeedDistribution> {
  constructor() {
    super(
      (window as unknown as D2Window).d2Web.httpInstance,
      NeedDistribution as any
    );
  }
}

@TrackedEntityDecorator({
  program: 'oUiYTdbtOuh',
  trackedEntityType: 'TYkuqCFPX43',
})
class Applicant extends TrackedEntityInstance {
  // @AttributeFieldDecorator('xozWLQN3K4m')
  firstName!: string;

  @AttributeFieldDecorator('MuMwgKIGNKk')
  middleName!: string;

  @AttributeFieldDecorator('uh5A5BxTVTc')
  surname!: string;

  get displayName(): string {
    return [this['firstName'], this['middleName'], this['surname']]
      .filter((name) => name)
      .join(' ');
  }
}

@Component({
  selector: 'app-web-sdk',
  templateUrl: './web-sdk.component.html',
  imports: [CommonModule],
})
export class WebSdkComponent {
  d2 = d2Web;

  async ngOnInit() {
    const trackerQuery = await this.d2.trackerModule.trackedEntity
      .setEndDate('')
      .setProgram('lw9fZTamYec')
      .setOrgUnit('rQS2cX4JH88')
      .setOuMode('DESCENDANTS')
      .setFilters([
        new DataQueryFilter()
          .setAttribute('tgGvHgQgtQ0')
          .setCondition(DataFilterCondition.Equal)
          .setValue('ND_BATCH_32525931'),
        new DataQueryFilter()
          .setAttribute('lj3cQAle9Fo')
          .setCondition(DataFilterCondition.Equal)
          .setValue('Qualified')
          .setProgramStage('NtZXBym2KfD')
          .setType('DATA_ELEMENT'),
      ])
      .setPagination(
        new Pager({
          pageSize: 10,
          page: 1,
        })
      )
      .setOrderCriteria(
        new DataOrderCriteria().setField('createdAt').setOrder('desc')
      )
      .get();

    console.log(trackerQuery);
  }
}
