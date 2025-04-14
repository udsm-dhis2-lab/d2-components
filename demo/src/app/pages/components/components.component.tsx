import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  DataFilterCondition,
  DataQueryFilter,
  DHIS2Event,
  ProgramRuleEngine,
  TrackedEntityInstance,
} from '@iapps/d2-web-sdk';
import {
  BreadcrumbItem,
  FormValue,
  OrganisationUnitSelectionConfig,
} from '@iapps/ng-dhis2-ui';
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
import { Period } from '@iapps/period-utilities';
import { IconView16 } from '@dhis2/ui';
import { TableRow } from 'packages/ng-dhis2-ui/src/lib/modules/line-list/models/line-list.models';
//import { LineListTableComponent } from '../../../../../packages/ng-dhis2-ui/src/lib/modules/line-list/containers/line-list.component';

@Component({
  selector: 'ng-dhis2-ui-app-componenent',
  templateUrl: './components.component.html',
  standalone: false,
})
export class ComponentsComponent implements OnInit {
  httpClient = inject(NgxDhis2HttpClientService);
  selectedPeriods = [
    { id: 'THIS_MONTH', name: 'This month' },
    { id: 'LAST_MONTH', name: 'Last month' },
    { id: 'LAST_3_MONTHS', name: 'Last 3 months' },
  ];

  handleApprovalClick() {
    console.log(
      'Approval button clicked from child! Performing approval logic...'
    );
  }

  attributeFilters = [
    {
      attribute: 'tgGvHgQgtQ0',
      operator: 'eq',
      value: `ABC`,
    },
  ];

  dynamicFilterInputs: DataQueryFilter[] = [
    new DataQueryFilter()
      .setAttribute('tgGvHgQgtQ0')
      .setCondition(DataFilterCondition.Equal)
      .setValue('ND_BATCH_32525931'),

    new DataQueryFilter()
      .setAttribute('lj3cQAle9Fo')
      .setCondition(DataFilterCondition.In)
      .setValue(['Qualified'])
      .setType('DATA_ELEMENT')
      .setProgramStage('NtZXBym2KfD'),

    // new DataQueryFilter()
    // .setAttribute('lj3cQAle9Fo')
    // .setCondition(DataFilterCondition.NotEqual)
    // .setValue('Rejected')
    // .setType('DATA_ELEMENT')
    // .setProgramStage('NtZXBym2KfD'),
  ];

  isButtonLoading: any;

  actionOptions = [
    {
      label: 'View',
      onClick: (data: any) => {
        console.log('Viewing data item:', data);
      },
    },
    { label: 'Edit', destructive: true },
  ];

  constructor() {
    setInterval(() => {
      this.isButtonLoading = false; // Toggle value every 5 seconds
    }, 10000);
  }

  // onActionSelected(emitActionResponse: any) {
  //   console.log(
  //     'ON ACTION SELECTED::: ',
  //     JSON.stringify(emitActionResponse, null, 4)
  //   );
  // }

  onActionSelected(event: {
    action: string;
    data: TrackedEntityInstance | DHIS2Event;
  }) {
    if (event.action === 'View') {
      this.onView(event.data);
    }
  }

  onRowsSelected(data: TableRow[]) {
    console.log('this is the data being emitted', data)
  }

  // onActionSelected(event: { action: string; row: TableRow }) {
  //   if (event.action === 'View') {
  //     this.onView(event.row);
  //   }
  // }

  formValuePayload: any;

  filters = [
    {
      programStage: 'AFdwWJ6LpRT',
      dataElement: 'WCuw3RqR2pX',
      operator: '=',
      value: 'New event',
    },
  ];

  rasFilters = [
    {
      programStage: 'k4ZFqYqRNDF',
      dataElement: 'Z4LwppfGhjI',
      operator: 'EQ',
      value: 'Approved',
    },
    {
      programStage: 'k4ZFqYqRNDF',
      dataElement: 'EBUF7spbIY1',
      operator: 'EQ',
      value: 'DED',
    },
    {
      programStage: 'NtZXBym2KfD',
      dataElement: 'lj3cQAle9Fo',
      operator: '',
      value: 'Qualified',
    },
  ];

  onApprovalSelected(data: any) {
    console.log('these are all the tei', data);
  }

  // [attributeFilters]="[
  //   { attribute: 'nfpxRnc5Rsg', operator: 'eq', value: 'A99' },
  //   { attribute: 'vZ6Eb7SovWK', operator: 'gt', value: 3 },
  //   { attribute: 'aukU9PbQpZs', operator: 'eq', value: 'Closed' },
  //   { attribute: 'jI43wrfikTb', operator: 'eq', value: 'true' }
  // ]"

  selectedOrgUnits = [];
  orgUnitSelectionConfig: OrganisationUnitSelectionConfig = {
    hideGroupSelect: false,
    hideLevelSelect: false,
    hideUserOrgUnits: false,
    allowSingleSelection: true,
    usageType: 'DATA_ENTRY',
  };
  onSelectOrgUnits(orgUnits: any) {
    this.selectedOrgUnits = orgUnits;

    console.log(this.selectedOrgUnits);
  }

  onSelectPeriods(periods: any) {
    console.log(periods);
  }

  onFirstValueEmitted(teiId: string) {
    console.log('first tei emitted', teiId);
  }

  tableColumns = [
    { label: 'Name', key: 'name' },
    { label: 'Age', key: 'age' },
    { label: 'Country', key: 'country' },
  ];

  tableData = [
    { name: 'John Doe', age: 28, country: 'Tanzania' },
    { name: 'Jane Smith', age: 34, country: 'Kenya' },
  ];

  // rasFilters = [
  //   {
  //     programStage: 'k4ZFqYqRNDF',
  //     dataElement: 'Z4LwppfGhjI',
  //     operator: '=',
  //     value: 'Approved',
  //   },
  //   // {
  //   //   programStage: 'k4ZFqYqRNDF',
  //   //   dataElement: 'EBUF7spbIY1',
  //   //   operator: '=',
  //   //   value: 'DED',
  //   // },
  //   {
  //     programStage: 'NtZXBym2KfD',
  //     dataElement: 'lj3cQAle9Fo',
  //     operator: '=',
  //     value: 'Qualified',
  //   },
  // ];

  ourRules = [
    {
      actions: [
        {
          field: 'GOb402rgorP',
          actionType: 'ASSIGN',
        },
      ],
      condition: 'd2:yearsBetween(A{Date of birth},V{current_date})',
    },
    {
      actions: [
        {
          field: 'p5FAom9pPWw',
          actionType: 'HIDEFIELD',
        },
      ],
      condition: '',
    },
    {
      actions: [
        {
          field: 'OhV3SJdy7HV',
          actionType: 'HIDEFIELD',
        },
      ],
      condition: '',
    },
    {
      actions: [
        {
          field: 'B4EfUtSyMMP',
          actionType: 'HIDEFIELD',
        },
      ],
      condition: '',
    },
    {
      actions: [
        {
          field: 'CqvVhRhKTM8',
          actionType: 'HIDEFIELD',
        },
      ],
      condition: '',
    },
    {
      actions: [
        {
          field: 'p5FAom9pPWw',
          actionType: 'HIDEFIELD',
        },
      ],
      condition: '',
    },
    {
      actions: [
        {
          field: 'p5FAom9pPWw',
          actionType: 'HIDEFIELD',
        },
      ],
      condition: '',
    },
    {
      actions: [
        {
          field: 'B4EfUtSyMMP',
          actionType: 'HIDEFIELD',
        },
      ],
      condition: '',
    },
    {
      actions: [
        {
          field: 'OhV3SJdy7HV',
          actionType: 'HIDEFIELD',
        },
      ],
      condition: '',
    },
    {
      actions: [
        {
          field: 'CqvVhRhKTM8',
          actionType: 'HIDEFIELD',
        },
      ],
      condition: '',
    },
    {
      actions: [
        {
          field: 'QuJ5Eno7WdP',
          actionType: 'HIDEFIELD',
        },
      ],
      condition: '',
    },
  ];

  ruleActions = [];

  onUpdate(formValue: FormValue) {
    this.ruleActions = new ProgramRuleEngine()
      .setRules(this.ourRules)
      .setDataValues({
        GOb402rgorP: 10,
        p5FAom9pPWw: '1111111',
        OhV3SJdy7HV: '0767676767',
        B4EfUtSyMMP: '',
        CqvVhRhKTM8: '',
        QuJ5Eno7WdP: '',
      })
      .execute() as any;

    this.formValuePayload = formValue;
  }

  //event program = A3olldDSHQg
  //program stage= AFdwWJ6LpRT

  // [attributeFilters]="[
  //   { attribute: 'WCuw3RqR2pX', operator: 'eq', value: 'Ongoing event' },
  // ]"

  onView(row: any) {
    console.log('View', row);
  }

  onEdit(row: any) {
    console.log('Edit', row);
  }

  onDelete(row: any) {
    console.log('Delete', row);
  }

  onApprove(row: any) {
    console.log('Approve', row);
  }

  onGenerateReport(row: any): void {
    console.log('Delete', row);
  }

  ngOnInit() {
    this.httpClient
      .get('http://dashboards.json', { isExternalLink: true })
      .subscribe((res) => {
        console.log(res);
      });

    const periodInstance = new Period().setType('Weekly').get();

    console.log('PERIOD LIST', periodInstance.list());

    this.enrollmentFormGroup = this.generatedDataElementGroup(
      this.formBuilder,
      this.dataElements
    );

    this.fields = this.transformDataElements(this.dataElements) as any;
  }

  enrollmentFormGroup!: FormGroup;
  private formBuilder = inject(FormBuilder);

  toCamelCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .split(' ')
      .map((word, index) =>
        index === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join('');
  }

  generatedDataElementGroup(
    formBuilder: FormBuilder,
    dataElements: any[],
    event?: any
  ): FormGroup {
    const formControls: { [key: string]: any } = {};

    dataElements.forEach((dataElement: any) => {
      const fieldKey = this.toCamelCase(
        dataElement.name || dataElement.formName
      );

      let value = '';
      if (event) {
        const eventDataValue = event.dataValues.find(
          (dataValue: any) => dataValue.dataElement === dataElement.id
        );
        value = eventDataValue ? eventDataValue.value : '';
      }

      formControls[fieldKey] = [value, Validators.required];
    });

    return formBuilder.group(formControls);
  }

  transformDataElements(dataElements: any[]) {
    return dataElements.map((dataElement) => {
      const camelCaseLabel = this.toCamelCase(
        dataElement.name || dataElement.formName
      );

      const controlType =
        dataElement.valueType === 'DATE'
          ? 'date'
          : dataElement.valueType === 'ORGANISATION_UNIT'
          ? 'org-unit'
          : dataElement.valueType === 'BOOLEAN'
          ? 'checkbox'
          : dataElement.valueType === 'NUMBER'
          ? 'number'
          : dataElement.optionSet
          ? 'dropdown'
          : 'textbox';

      const type =
        dataElement.valueType === 'TEXT'
          ? 'text'
          : dataElement.valueType === 'NUMBER'
          ? 'number'
          : dataElement.valueType === 'BOOLEAN'
          ? 'checkbox'
          : 'text';

      const options =
        dataElement.optionSet?.options?.map((option: any) => ({
          value: option?.value || option?.code || '',
          label: option?.name || option?.name || '',
          code: option?.value || option?.code || '',
        })) || [];

      if (dataElement.valueType === 'DATE') {
        return new DateField({
          id: dataElement.id || camelCaseLabel,
          key: camelCaseLabel,
          label: dataElement.name,
          controlType: controlType,
          generated: (dataElement && dataElement.generated) || false,
          unique: (dataElement && dataElement.unique) || false,
          type: controlType,
          required: true,
        });
      }

      return new FormField<string>({
        id: dataElement.id || camelCaseLabel,
        code: dataElement.code,
        key: camelCaseLabel,
        label: dataElement.name,
        controlType: controlType,
        generated: false,
        unique: false,
        type: type,
        required: true,
        optionSet: options.length > 0 ? { options } : undefined,
      });
    });
  }

  fields = [];

  dataElements = [
    {
      code: 'MONTHLY_ALLOWANCE_2',
      name: 'Monthly Allowance 2',
      shortName: 'Monthly Allowance 4',
      formName: 'Monthly Allowance 3',
      valueType: 'TEXT',
      optionSetValue: false,
      generated: true,
      unique: true,
      id: 'wArlfDIGVm1',
    },
    {
      code: 'MONTHLY_ALLOWANCE',
      name: 'Monthly Allowance',
      shortName: 'Monthly Allowance',
      formName: 'Monthly Allowance',
      valueType: 'NUMBER',
      optionSetValue: false,
      id: 'wArlfDIGVmg',
    },
    {
      code: 'MODE_OF_PAYMENT',
      name: 'Preferred mode of payment',
      shortName: 'Preferred mode of payment',
      valueType: 'TEXT',
      optionSet: {
        name: 'Mode of payment',
        options: [
          {
            code: 'MNO',
            name: 'Mobile network operator (MNO)',
            id: 'x0HrJtyItIA',
          },
          { code: 'BANK', name: 'Bank', id: 'MJ34erJHU3O' },
        ],
        id: 'fUNANKyULhe',
      },
      optionSetValue: true,
      id: 'vR5EEbIO8wx',
    },
    {
      code: 'SELECT_BANK',
      name: 'Select bank',
      shortName: 'Select bank',
      formName: 'Select bank',
      valueType: 'TEXT',
      optionSet: {
        name: 'Bank',
        options: [
          {
            code: 'FMBZTZTX',
            name: 'ACCESS BANK TANZANIA LIMITED',
            id: 'usAyQn1PUpw',
          },
          {
            code: 'AKCOTZTZ',
            name: 'AKIBA COMMERCIAL BANK LTD',
            id: 'rlLS1acWdT4',
          },
          { code: 'AMNNTZTZ', name: 'AMANA BANK LIMITED', id: 'JnYySXPsGrw' },
          { code: 'AZANTZTZ', name: 'AZANIA BANK LIMITED', id: 'w8j9BgT0x5w' },
          {
            code: 'BARBTZTZ',
            name: 'BANK OF BARODA (TANZANIA) LTD',
            id: 'bEuA725w5kW',
          },
          {
            code: 'BARCTZTZ',
            name: 'BARCLAYS BANK TANZANIA LTD',
            id: 'IsUsKGUh750',
          },
          {
            code: 'BKIDTZTZ',
            name: 'BANK OF INDIA (TANZANIA) LIMITED',
            id: 'xFi2sVj9j4h',
          },
          {
            code: 'BKMYTZTZ',
            name: 'INTERNATIONAL COMMERCIAL BANK (TANZANIA) LIMITED',
            id: 'ZbeN1D5rs4H',
          },
          {
            code: 'CBAFTZTZ',
            name: 'COMMERCIAL BANK OF AFRICA TANZANIA LTD',
            id: 'IRhBFnIf6KZ',
          },
          {
            code: 'CBFWTZTZ',
            name: 'COVENANT BANK FOR WOMEN (TANZANIA) LIMITED',
            id: 'viAtjB711Bc',
          },
          {
            code: 'CHLMTZTZ',
            name: 'CHINA COMMMEKCIAL BANK',
            id: 'xym3UL9crfC',
          },
          {
            code: 'CITITZTZ',
            name: 'CITIBANK TANZANIA LTD',
            id: 'ULBE9p2aSO8',
          },
          {
            code: 'CNRBTZTZ',
            name: 'CANARA BANK TANZANIA LTD',
            id: 'Wo0oz1KLN9C',
          },
          { code: 'CORUTZTZ', name: 'CRDB BANK PLC', id: 'dlwclKwKnxL' },
          {
            code: 'DASUTZTZ',
            name: 'DAR ES SALAAM COMMUNITY BANK LTD',
            id: 'Mw8qkNDwglf',
          },
          {
            code: 'DTKETZTZ',
            name: 'DIAMOND TRUST BANK TANZANIA LTD',
            id: 'PmFP7j8S95v',
          },
          {
            code: 'ECOCTZTZ',
            name: 'ECOBANK TANZANIA LIMITED',
            id: 'awY94xcdii3',
          },
          {
            code: 'EQBLTZTZ',
            name: 'EQUITY BANK TANZANIA LIMITED',
            id: 'IKStNDgoTRG',
          },
          {
            code: 'EUAFTZTZ',
            name: 'BANK OF AFRICA TANZANIA LIMITED',
            id: 'y3au4Rs6XJC',
          },
          {
            code: 'EXTNTZTZ',
            name: 'EXIM BANK (TANZANIA) LTD',
            id: 'e2TEqztfjZn',
          },
          {
            code: 'FIRNTZTZ',
            name: 'FIRST NATIONAL BANK LIMITED',
            id: 'NEhsdLX83uY',
          },
          {
            code: 'HABLTZTZ',
            name: 'HABIB AFRICAN BANK LIMITED',
            id: 'FLqV13DoGtg',
          },
          { code: 'IMBLTZTZ', name: 'IM BANK LIMITED', id: 'kEPJnblNZU2' },
          {
            code: 'KCBLTZTZ',
            name: 'KCB BANK TANZANIA LIMITED',
            id: 'gIuernrRzXQ',
          },
          {
            code: 'KLMJTZTZ',
            name: 'KILIMANJARO CO-OPERATIVE BANK LTD',
            id: 'rph65iSe0yR',
          },
          { code: 'MBTLTZTZ', name: 'MAENDELEO BANK LTD', id: 'tnypLCBcEhW' },
          {
            code: 'MKCBTZTZ',
            name: 'MKOMBOZI COMMERCIAL BANK',
            id: 'SbugsVwfeGg',
          },
          {
            code: 'MWCOTZTZ',
            name: 'MWALIMU COMMERCIAL BANK PLC',
            id: 'l4DOycGCM8Z',
          },
          {
            code: 'NLCBTZTZ',
            name: 'NATIONAL BANK OF COMMERCE LTD',
            id: 'Y7UXLEFO3QO',
          },
          {
            code: 'NMIBTZTZ',
            name: 'NATIONAL MICROFINANCE BANK LIMITED',
            id: 'y1XRVvMzsCH',
          },
          {
            code: 'PBZATZTZ',
            name: "PEOPLE'S BANK OF ZANZIBAR LTD",
            id: 'X3Z33AoGV8J',
          },
          {
            code: 'SBICTZTZ',
            name: 'STANBIC BANK TANZANIA LTD.',
            id: 'hvmrGHqPilY',
          },
          {
            code: 'SCBLTZTZ',
            name: 'STANDARD CHARTERED BANK (T) LIMITED',
            id: 'qBZRDDPT2BP',
          },
          { code: 'TANZTZTX', name: 'BANK OF TANZANIA', id: 'ZzbB2SDTZZH' },
          {
            code: 'UCCTTZTZ',
            name: 'UCHUMI COMMERCIAL BANK (T) LTD',
            id: 'Lb5yJAsabMd',
          },
          {
            code: 'UNAFTZTZ',
            name: 'UNITED BANK FOR AFRICA (T) LTD',
            id: 'mQKhVchcrIi',
          },
          {
            code: 'UNILTZTZ',
            name: 'UBL BANK (TANZANIA) LIMITED',
            id: 'lWPjtyAJ0Od',
          },
          {
            code: 'TARATZTZ',
            name: 'TANZANIA REVENUE AUTHORITY',
            id: 'F6VtowLLp2M',
          },
          { code: 'MUOBTZTZ', name: 'MuCoBa BANK PLC', id: 'WIuld7usHzT' },
          {
            code: 'GTBITZTZ',
            name: 'GUARANTY TRUST BANK (TANZANIA) LTD',
            id: 'dY8arSd0aBV',
          },
          {
            code: 'TAPBTZTZ',
            name: 'TANZANIA COMMERCIAL BANK',
            id: 'l5T4S5Ul7u0',
          },
          {
            code: 'TANZTZTXXXX',
            name: 'KMC BOT REVENUE COLLECTION ACCOUNT',
            id: 'YDQQR6dFyMK',
          },
          {
            code: 'TAINTZTZXXX',
            name: 'TIB DEVELOPMENT BANK',
            id: 'XhTW2nuMLMY',
          },
          { code: 'CDSHTZTZ', name: 'CHINA DASHENG BANK', id: 'ZqPKA2HUx8U' },
          {
            code: 'ACTZTZTZ',
            name: 'SELCOM MICROFINANCE BANK TANZANIA LTD',
            id: 'aSPY1BvIE6e',
          },
          {
            code: 'FMBZTZTZ',
            name: 'AFRICAN BANKING CORPORATION TANZANIA LIMITED',
            id: 'Xvvj1VJGA4i',
          },
          { code: 'GEBABEBB', name: 'BNP PARIBAS FORTIS', id: 'A38evzfY9SU' },
          {
            code: 'CIBEEGCX004',
            name: 'COMMERCIAL INTERNATIONAL BANK (CIB)',
            id: 'Ugum463ZMiq',
          },
          { code: 'UNAFCDKS', name: 'CITIBANK NEW YORK', id: 'F9lHfncBuOW' },
          { code: 'BARCMUMUMAF', name: 'ABSA BANK', id: 'hLMTM2N63lS' },
          { code: 'CITIUS33', name: 'CITIBANK N.A.', id: 'Wv1asyaRJ4h' },
          { code: 'KOEXKRSEXXX', name: 'KEB HANA BANK', id: 'h11VnXEHT7y' },
          { code: 'BKCHCNBJ910', name: 'BANK OF CHINA', id: 'driYpTSPvrJ' },
          { code: 'INGBNL2A', name: 'ING BANK AMSTERDAM', id: 'Sc8y0D9B4N7' },
          { code: 'UGBAUGKA', name: 'UGANDA BANK ACCOUNT', id: 'HD5R6TvMo8Y' },
          { code: 'KCBLKEN0', name: 'KCB BANK', id: 'db15LhDRyMZ' },
          {
            code: 'MWCBTZTZ',
            name: 'MWANGA COMMUNITY BANK LTD',
            id: 'rLotIGaFQ9F',
          },
          {
            code: 'FIRNSZMA',
            name: 'FIRST NATIONAL BANK (FNB)',
            id: 'WCBan7nA78M',
          },
          { code: 'BUKBGB21', name: 'BARCLAYS BANK UK', id: 'EteKCjPUOEu' },
        ],
        id: 'Q9jCaPArGq8',
      },
      optionSetValue: true,
      id: 'CqvVhRhKTM8',
    },
    {
      code: 'BANK_ACC_NO',
      name: 'Bank A/c number',
      shortName: 'Bank A/c number',
      formName: 'Bank A/c number',
      valueType: 'TEXT',
      optionSetValue: false,
      id: 'p5FAom9pPWw',
    },
    {
      code: 'SELECT_MOBILE_NETWORK',
      name: 'Select mobile network',
      shortName: 'Select mobile network',
      formName: 'Select mobile network',
      valueType: 'TEXT',
      optionSet: {
        name: 'Mobile Network Operator (MNO)',
        options: [
          { code: 'AMTLTZTX', name: 'Airtel Money', id: 'alLBQfLrH6W' },
          { code: 'HALOTZTX', name: 'Vietel (Halotel)', id: 'C4QgPqXXlwy' },
          { code: 'TIGOTZTX', name: 'Yas!', id: 'OuANUxgdn1B' },
          { code: 'TTCLTZTX', name: 'TTCL', id: 'aUNYUVYlvKl' },
          { code: 'VODATZTX', name: 'Vodacom', id: 'phyLX9mpp2Y' },
        ],
        id: 'wkVzfzUPuXW',
      },
      optionSetValue: true,
      id: 'B4EfUtSyMMP',
    },
    {
      code: 'PHONE_NUMBER',
      name: 'Phone number',
      shortName: 'Phone number',
      formName: 'Enter phone number',
      valueType: 'PHONE_NUMBER',
      optionSetValue: false,
      id: 'OhV3SJdy7HV',
    },
    {
      code: 'PAYMENT_REJECTION',
      name: 'Payment rejection status',
      shortName: 'Payment rejection status',
      formName: 'Was payment rejected?',
      valueType: 'TEXT',
      optionSet: {
        name: 'Yes/No',
        options: [
          { code: 'Yes', name: 'Yes', id: 'wXlqnr8uKha' },
          { code: 'No', name: 'No', id: 'iReTJT2MxE5' },
        ],
        id: 'p5xfSSaioBL',
      },
      optionSetValue: true,
      id: 'mSafUR4iSzA',
    },
    {
      code: 'PAYMENT_REJECTION_REASON',
      name: 'Payment rejection reason',
      shortName: 'Payment rejection reason',
      formName: 'Payment rejection reason',
      valueType: 'TEXT',
      optionSetValue: false,
      id: 'QuJ5Eno7WdP',
    },
  ];

  onSelectBreadcrumb(breadcrumb: BreadcrumbItem) {
    console.log('SELECTED BREADCRUMB', breadcrumb);
  }
}

class Option {
  value: string;
  label: string;
  code: string;

  constructor({
    value,
    label,
    code,
  }: {
    value: string;
    label: string;
    code: string;
  }) {
    this.value = value;
    this.label = label;
    this.code = code;
  }
}

class FormField<T> {
  id: string;
  code: string;
  key: string;
  label: string;
  controlType: string;
  generated: boolean;
  unique: boolean;
  type: string;
  required: boolean;
  options: Option[];
  defaultValue?: T;

  constructor({
    id,
    code,
    key,
    label,
    controlType,
    generated,
    unique,
    type,
    required,
    optionSet,
    defaultValue,
  }: {
    id: string;
    code: string;
    key: string;
    label: string;
    controlType: string;
    generated: boolean;
    unique: boolean;
    type: string;
    required: boolean;
    optionSet?: { options: { value: string; label: string; code: string }[] };
    defaultValue?: T;
  }) {
    this.id = id;
    this.code = code;
    this.key = key;
    this.label = label;
    this.controlType = controlType;
    this.generated = generated;
    this.unique = unique;
    this.type = type;
    this.required = required;
    this.defaultValue = defaultValue;

    this.options = optionSet?.options
      ? optionSet.options.map((option) => new Option(option))
      : [];
  }
}

class DateField {
  id: string;
  key: string;
  label: string;
  controlType: string;
  generated: boolean;
  unique: boolean;
  type: string;
  required: boolean;
  options: Option[];

  constructor({
    id,
    key,
    label,
    controlType,
    generated,
    unique,
    type,
    required,
    optionSet,
  }: {
    id: string;
    key: string;
    label: string;
    controlType: string;
    generated: boolean;
    unique: boolean;
    type: string;
    required: boolean;
    optionSet?: { options: { value: string; label: string; code: string }[] };
  }) {
    this.id = id;
    this.key = key;
    this.label = label;
    this.controlType = controlType;
    this.generated = generated;
    this.unique = unique;
    this.type = type;
    this.required = required;

    this.options = optionSet?.options
      ? optionSet.options.map((option) => new Option(option))
      : [];
  }
}
