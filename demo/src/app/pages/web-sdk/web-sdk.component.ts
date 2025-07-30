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
  TrackerQueryConfig,
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

      .setProgram('lw9fZTamYec')
      .setOrgUnit('rQS2cX4JH88')
      .setOuMode('DESCENDANTS')
      .setFilters([
        new DataQueryFilter()
          .setAttribute('tgGvHgQgtQ0')
          .setCondition(DataFilterCondition.Equal)
          .setValue('ND_BATCH_32525931'),
      ])
      .setPagination(
        new Pager({
          pageSize: 10,
          page: 1,
        })
      )
      .setOrderCriterias([
        new DataOrderCriteria().setField('createdAt').setOrder('desc'),
      ])
      .setConfig(
        new TrackerQueryConfig({
          ignoreProgramForTrackedEntity: true,
        })
      )
      .setStatus('COMPLETED')
      .get();

    console.log(trackerQuery);

    const trackerResponse = (
      await this.d2.trackerModule.trackedEntity
        // .setProgram('lw9fZTamYec')
        .setTrackedEntity(`KHCoPswNIqk`)
        .get()
    ).data as TrackedEntityInstance;

    console.log('the response', trackerResponse);

    const eventQuery = await this.d2.eventModule.event
      .setProgram('lw9fZTamYec')
      .setProgramStage('NtZXBym2KfD')
      .setPagination(
        new Pager({
          pageSize: 10,
          page: 1,
        })
      )
      .setFilters([
        new DataQueryFilter()
          .setAttribute('lj3cQAle9Fo')
          .setCondition(DataFilterCondition.In)
          .setValue(['Qualified', 'Rejected'])
          .setType('DATA_ELEMENT'),
      ])
      .setStatus('COMPLETED')
      .get();

    console.log(eventQuery);

    const standaloneTrackerQuery = await this.d2.trackerModule.trackedEntity
      .setTrackedEntity('UNIDoHvJIPV')
      .get();

    console.log(standaloneTrackerQuery);

    const createTestQuery = this.d2.trackerModule.trackedEntity
      .setProgram('lw9fZTamYec')
      .setTrackedEntity('test-entity');

    const testInstance = await createTestQuery.create();

    console.log('CREATE INSTANCE', testInstance);

    const orgUnitIndexDbResponse = await this.d2.httpInstance.get(
      'organisationUnits.json?fields=id,code,name,parent',
      { useIndexDb: true }
    );

    console.log('ORGUNIT FROM INDEX DB', orgUnitIndexDbResponse);

    const dataStoreIndexDbResponse = await this.d2.httpInstance.get(
      'dataStore/modules/cacheCleaner?fields=id,section,menuItems,authorities,icon,sort&paging=false',
      { useIndexDb: true }
    );

    console.log('DATA STORE', dataStoreIndexDbResponse);
  }
}
