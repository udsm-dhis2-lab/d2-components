// src/app/line-list-table.component.ts
import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  CircularLoader,
  DataTable,
  DataTableCell,
  DataTableColumnHeader,
  DataTableRow,
  Pagination,
  TableBody,
  TableFoot,
  TableHead,
  Button,
} from '@dhis2/ui';
import React, { useEffect, useRef, useState } from 'react';
import * as ReactDOM from 'react-dom/client';
import { ReactWrapperModule } from '../../react-wrapper/react-wrapper.component';
import { DropdownMenu, DropdownMenuOption } from '../components/dropdown-menu';
import { AttributeFilter } from '../models/attribute-filter.model';
import { FilterConfig } from '../models/filter-config.model';
import {
  ColumnDefinition,
  EventsResponse,
  LineListResponse,
  Pager,
  TableRow,
  TrackedEntityInstancesResponse,
} from '../models/line-list.models';
import { LineListService } from '../services/line-list.service';
import {
  addActionsColumn,
  getEventData,
  getProgramStageData,
  getTrackedEntityData,
} from '../utils/line-list-utils';

@Component({
  selector: 'app-line-list',
  template: '<ng-content></ng-content>',
  styleUrls: ['./line-list.component.scss'],
  standalone: false,
})
export class LineListTableComponent extends ReactWrapperModule {
  @Input() programId!: string;
  @Input() orgUnit!: string;
  @Input() programStageId?: string;
  @Input() actionOptions?: DropdownMenuOption[];
  @Input() attributeFilters?: AttributeFilter[];
  @Input() startDate?: string;
  @Input() endDate?: string;
  @Input() filters?: FilterConfig[];
  @Input() ouMode?: string;
  @Input() showApprovalButton: boolean = false;
  @Output() actionSelected = new EventEmitter<{
    action: string;
    row: TableRow;
  }>();
  private reactStateUpdaters: any = null;
  @Output() approvalSelected = new EventEmitter<string[]>();

  setReactStateUpdaters = (updaters: any) => {
    this.reactStateUpdaters = updaters;
  };

  ngOnChanges(changes: SimpleChanges) {
    if (this.reactStateUpdaters) {
      if (changes['programId']) {
        this.reactStateUpdaters.setProgramIdState(this.programId);
      }
      if (changes['orgUnit']) {
        this.reactStateUpdaters.setOrgUnitState(this.orgUnit);
      }
      if (changes['programStageId']) {
        this.reactStateUpdaters.setProgramStageIdState(this.programStageId);
      }
      if (changes['attributeFilters']) {
        this.reactStateUpdaters.setAttributeFiltersState(this.attributeFilters);
      }
      if (changes['startDate']) {
        this.reactStateUpdaters.setStartDateState(this.startDate);
      }
      if (changes['endDate']) {
        this.reactStateUpdaters.setEndDateState(this.endDate);
      }
    }
  }

  lineListService = inject(LineListService);

  LineList = () => {
    const [columns, setColumns] = useState<ColumnDefinition[]>([]);
    const [data, setData] = useState<TableRow[]>([]);
    const [pager, setPager] = useState<Pager>({
      page: 1,
      pageSize: 10,
      total: 0,
      pageCount: 1,
    });
    const paginationRef = useRef<HTMLDivElement>(null);
    const [programIdState, setProgramIdState] = useState<string>(
      this.programId
    );
    const [orgUnitState, setOrgUnitState] = useState<string>(this.orgUnit);
    const [programStageIdState, setProgramStageIdState] = useState<
      string | undefined
    >(this.programStageId);
    const [attributeFiltersState, setAttributeFiltersState] = useState<
      AttributeFilter[] | undefined
    >(this.attributeFilters);
    const [startDateState, setStartDateState] = useState<string | undefined>(
      this.startDate
    );
    const [endDateState, setEndDateState] = useState<string | undefined>(
      this.endDate
    );
    const [loading, setLoading] = useState<boolean>(false);

    // Store updaters in refs for Angular to access
    const updateRefs = useRef({
      setProgramIdState,
      setOrgUnitState,
      setProgramStageIdState,
      setAttributeFiltersState,
      setStartDateState,
      setEndDateState,
    });

    useEffect(() => {
      this.setReactStateUpdaters?.(updateRefs.current);
    }, []);

    useEffect(() => {
      if (!loading) {
        setTimeout(() => {
          const paginationContainer = document.querySelector(
            '[data-test="dhis2-uiwidgets-pagination"]'
          ) as HTMLElement;

          if (paginationContainer) {
            paginationContainer.style.display = 'flex';
            paginationContainer.style.flexDirection = 'row';
            paginationContainer.style.justifyContent = 'space-between';
            paginationContainer.style.alignItems = 'center';
          }
        }, 500); // Short delay to ensure styles apply after data renders
      }
    }, [loading]);

    useEffect(() => {
      setLoading(true);
      this.lineListService
        .getLineListData(
          this.programId,
          this.orgUnit,
          this.programStageId,
          pager.page,
          pager.pageSize,
          this.attributeFilters,
          this.startDate,
          this.endDate,
          this.ouMode
        )
        .subscribe((response: LineListResponse) => {
          let entityColumns: ColumnDefinition[] = [];
          let responsePager: Pager;
          let entityData: TableRow[] = [];

          if (this.programStageId) {
            responsePager = (response.data as EventsResponse).pager;
            const { columns, data } = getProgramStageData(
              response,
              this.programStageId,
              pager
            );
            entityColumns = columns;
            entityData = data;
          } else if ('trackedEntityInstances' in response.data) {
            responsePager = (response.data as TrackedEntityInstancesResponse)
              .pager;
            const { columns, data } = getTrackedEntityData(
              response,
              this.programId,
              pager,
              this.filters
            );
            entityColumns = columns;
            entityData = data;
          } else {
            responsePager = (response.data as EventsResponse).pager;
            const { columns, data } = getEventData(response, pager);
            entityColumns = columns;
            entityData = data;
          }

          const finalColumns: ColumnDefinition[] = addActionsColumn(
            [{ label: '#', key: 'index' }, ...entityColumns],
            this.actionOptions
          );
          setLoading(false);
          console.log('hey');
          setColumns(...[finalColumns]);
          setData(...[entityData]);
          setPager(...[responsePager]);
          console.log('columns', columns);
          console.log('data', data);
        });
    }, [
      programIdState,
      orgUnitState,
      programStageIdState,
      attributeFiltersState,
      startDateState,
      endDateState,
      pager.page,
      pager.pageSize,
    ]);

    const getDropdownOptions = (row: TableRow): DropdownMenuOption[] => {
      return (this.actionOptions || []).map((option) => ({
        ...option,
        onClick: () => {
          option.onClick?.(row);
          this.actionSelected.emit({ action: option.label, row });
        },
      }));
    };

    // // Add this handler for the Approval button
    // const handleApprovalClick = () => {
    //   console.log('Approval button clicked');
    //   // Optionally emit an event to Angular parent component
    //   // this.actionSelected.emit({ action: 'Approval', row: null });
    // };

    // Updated handler using the new approvalSelected emitter
    const handleApprovalClick = () => {
      this.lineListService
        .getLineListData(
          this.programId,
          this.orgUnit,
          this.programStageId,
          pager.page,
          pager.pageSize,
          this.attributeFilters,
          this.startDate,
          this.endDate,
          this.ouMode
        )
        .subscribe((response: LineListResponse) => {
          if ('trackedEntityInstances' in response.data) {
            const trackedEntityInstances = (response.data as TrackedEntityInstancesResponse)
              .trackedEntityInstances;
            const teiIds = trackedEntityInstances.map((tei) => tei.trackedEntityInstance);
            // Emit TEI IDs using the new emitter
            console.log('teis emitted', teiIds);
            this.approvalSelected.emit(teiIds);
          } else {
            console.log('No tracked entity instances found in the response');
            this.approvalSelected.emit([]); // Emit empty array if no TEIs
          }
        });
    };

    return (
      <div>
        {/* <div
          style={{
            width: '100%', // Ensures it spans the full container
            display: 'flex',
            justifyContent: 'flex-end', // Aligns button to the right
            alignItems: 'center',
            gap: 8, // Adds 8px gap (if you add more elements later)
            padding: 8, // Adds 8px padding around the div
            marginBottom: 16, // Adds 16px space below (equivalent to mb-4)
          }}
        >
          <Button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={handleApprovalClick}
            primary
          >
            Approval
          </Button>
        </div> */}
        {this.showApprovalButton && (
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 8,
              padding: 8,
              marginBottom: 16,
            }}
          >
            <Button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={handleApprovalClick}
              primary
            >
              Approval
            </Button>
          </div>
        )}
        {loading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: 8,
            }}
          >
            <CircularLoader small />
            <div
              style={{
                fontSize: 14,
              }}
            >
              Loading
            </div>
          </div>
        ) : (
          <DataTable>
            <TableHead>
              <DataTableRow>
                {columns.map((col) => (
                  <DataTableColumnHeader key={col.key}>
                    {col.label}
                  </DataTableColumnHeader>
                ))}
              </DataTableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <DataTableRow key={row.index}>
                  {columns.map((col) => (
                    <DataTableCell key={col.key}>
                      {col.key === 'actions' ? (
                        <DropdownMenu
                          dropdownOptions={getDropdownOptions(row)}
                          onClick={(option) => option.onClick?.()}
                        />
                      ) : (
                        row[col.key]
                      )}
                    </DataTableCell>
                  ))}
                </DataTableRow>
              ))}
            </TableBody>
            <TableFoot>
              <DataTableRow>
                {/* <DataTableCell colSpan={columns.length}> */}
                <DataTableCell colSpan={columns.length.toString()}>
                  <div>
                    <Pagination
                      page={pager.page}
                      pageCount={pager.pageCount}
                      pageSize={pager.pageSize}
                      total={pager.total}
                      onPageChange={(page: number) =>
                        setPager((prev) => ({ ...prev, page }))
                      }
                      onPageSizeChange={(pageSize: number) => {
                        const newPageSize = Number(pageSize);
                        setPager((prev) => ({
                          ...prev,
                          page: 1,
                          pageSize: newPageSize,
                        }));
                      }}
                      pageSizes={['5', '10', '20', '50']}
                    />
                  </div>
                </DataTableCell>
              </DataTableRow>
            </TableFoot>
          </DataTable>
        )}
      </div>
    );
  };

  override async ngAfterViewInit() {
    if (!this.elementRef) throw new Error('No element ref');
    this.reactDomRoot = ReactDOM.createRoot(this.elementRef.nativeElement);

    this.component = this.LineList;
    this.render();
  }
}

// import { Component, Input } from '@angular/core';
// import {
//   DataTable,
//   TableHead,
//   DataTableRow,
//   DataTableColumnHeader,
//   TableBody,
//   DataTableCell,
//   Pagination,
//   TableFoot,
// } from '@dhis2/ui';
// import React, { useEffect, useRef, useState } from 'react';
// import { LineListService } from '../services/line-list.service';
// import { DropdownMenu, DropdownMenuOption } from '../components/dropdown-menu';
// import {
//   LineListResponse,
//   ColumnDefinition,
//   TableRow,
//   EventsResponse,
//   TrackedEntityInstancesResponse,
//   Pager,
// } from '../models/line-list.models';

// @Component({
//   selector: 'app-line-list-table',
//   templateUrl: './line-list-table.component.html',
//   styleUrls: ['./line-list-table.component.scss'],
//   standalone: false,
// })
// export class LineListTableComponent {
//   @Input() programId!: string;
//   @Input() orgUnit!: string;
//   @Input() programStageId?: string;
//   @Input() actionOptions?: DropdownMenuOption[];

//   constructor(private lineListService: LineListService) {}

//   LineList = () => {
//     const [columns, setColumns] = useState<ColumnDefinition[]>([]);
//     const [data, setData] = useState<TableRow[]>([]);
//     const [pager, setPager] = useState<Pager>({
//       page: 1,
//       pageSize: 10,
//       total: 0,
//       pageCount: 1,
//     });
//     const paginationRef = useRef<HTMLDivElement>(null);

//     // TODO: Refactor the following column and data generation logic into a utils file (e.g., src/utils/line-list-utils.ts).
//     //       Extract functions like:
//     //       - buildDataElementMap: Create a map of data element IDs to names from metadata.
//     //       - getProgramStageData: Generate columns and data for programStageId case.
//     //       - getTrackedEntityData: Generate columns and data for trackedEntityInstances case.
//     //       - getEventData: Generate columns and data for events case (without programStageId).
//     //       - addActionsColumn: Conditionally add "Actions" column based on actionOptions.
//     //       -remove index from data and make index column dynamic
//     //      This will improve readability and reusability.

//     useEffect(() => {
//       setTimeout(() => {
//         const paginationContainer = document.querySelector(
//           '[data-test="dhis2-uiwidgets-pagination"]'
//         ) as HTMLElement;

//         if (paginationContainer) {
//           paginationContainer.style.setProperty('display', 'flex', 'important');
//           paginationContainer.style.setProperty(
//             'flex-direction',
//             'row',
//             'important'
//           );
//           paginationContainer.style.setProperty(
//             'justify-content',
//             'space-between',
//             'important'
//           );
//           paginationContainer.style.setProperty(
//             'align-items',
//             'center',
//             'important'
//           );
//         }
//       }, 1000);

//       if (paginationRef.current) {
//         paginationRef.current.style.setProperty('display', 'flex', 'important');
//         paginationRef.current.style.setProperty(
//           'flex-direction',
//           'row',
//           'important'
//         );
//       }
//       this.lineListService
//         .getLineListData(
//           this.programId,
//           this.orgUnit,
//           this.programStageId,
//           pager.page,
//           pager.pageSize
//         )
//         .subscribe((response: LineListResponse) => {
//           let entityColumns: ColumnDefinition[] = [];
//           let responsePager: Pager;

//           if (this.programStageId) {
//             const events = (response.data as EventsResponse).events;
//             responsePager = (response.data as EventsResponse).pager;
//             const allDataElements = new Set<string>();
//             events.forEach((event) => {
//               event.dataValues.forEach((dv) =>
//                 allDataElements.add(dv.dataElement)
//               );
//             });

//             const stageFromMetaData = response.metadata.programStages.find(
//               (stage) => stage.id === this.programStageId
//             );

//             if (!stageFromMetaData) {
//               throw new Error(`Program stage with ID ${this.programStageId} not found`);
//             }

//             entityColumns = Array.from(allDataElements).map(
//               (dataElementId) => ({
//                 label:
//                   stageFromMetaData.programStageDataElements.find(
//                     (psde) => psde.dataElement.id === dataElementId
//                   )?.dataElement.name || dataElementId,
//                 key: dataElementId,
//               })
//             );
//             let dataElementsData: TableRow[] = events.map((event, idx) => {
//               let row: TableRow = {
//                 event: event.event,
//                 index: (pager.page - 1) * pager.pageSize + idx + 1,
//               };
//               allDataElements.forEach(
//                 (dataElementId) => (row[dataElementId] = '')
//               );
//               event.dataValues.forEach(
//                 (dv) => (row[dv.dataElement] = dv.value)
//               );
//               return row;
//             });
//             setData(dataElementsData);
//           } else if ('trackedEntityInstances' in response.data) {
//             // const teis = (response.data as TrackedEntityInstancesResponse)
//             //   .trackedEntityInstances;
//             // responsePager = (response.data as TrackedEntityInstancesResponse)
//             //   .pager;
//             // const allAttributes = new Set<string>();
//             // teis.forEach((tei) => {
//             //   tei.attributes.forEach((attr) =>
//             //     allAttributes.add(attr.attribute)
//             //   );
//             // });
//             // entityColumns = Array.from(allAttributes).map((attrId) => {
//             //   const foundAttribute = teis
//             //     .flatMap((tei) => tei.attributes)
//             //     .find((attr) => attr.attribute === attrId);
//             //   return {
//             //     label: foundAttribute?.displayName || attrId,
//             //     key: attrId,
//             //   };
//             // });
//             // let attributesData = teis.map((tei, idx) => {
//             //   let row: TableRow = {
//             //     trackedEntityInstance: tei.trackedEntityInstance,
//             //     index: (pager.page - 1) * pager.pageSize + idx + 1,
//             //   };
//             //   allAttributes.forEach((attrId) => (row[attrId] = ''));
//             //   tei.attributes.forEach(
//             //     (attr) => (row[attr.attribute] = attr.value)
//             //   );
//             //   return row;
//             // });
//             // setData(attributesData);
//             const teis = (response.data as TrackedEntityInstancesResponse)
//               .trackedEntityInstances;
//             responsePager = (response.data as TrackedEntityInstancesResponse)
//               .pager;

//             const allAttributes = new Set<string>();

//             teis.forEach((tei) => {
//               // Find the enrollment for the given programId
//               const matchingEnrollment = tei.enrollments.find(
//                 (enrollment) => enrollment.program === this.programId
//               );

//               // Get attributes from the enrollment or fallback to TEI-level attributes
//               const attributes = matchingEnrollment
//                 ? matchingEnrollment.attributes
//                 : tei.attributes;

//               // Collect unique attribute IDs
//               attributes.forEach((attr) =>
//                 allAttributes.add(attr.attribute)
//               );
//             });

//             entityColumns = Array.from(allAttributes).map((attrId) => {
//               const foundAttribute = teis
//                 .flatMap((tei) => {
//                   const matchingEnrollment = tei.enrollments.find(
//                     (enrollment) => enrollment.program === this.programId
//                   );
//                   return matchingEnrollment
//                     ? matchingEnrollment.attributes
//                     : tei.attributes;
//                 })
//                 .find((attr) => attr.attribute === attrId);

//               return {
//                 label: foundAttribute?.displayName || attrId,
//                 key: attrId,
//               };
//             });

//             let attributesData = teis.map((tei, idx) => {
//               let row: TableRow = {
//                 trackedEntityInstance: tei.trackedEntityInstance,
//                 index:
//                   (responsePager.page - 1) * responsePager.pageSize + idx + 1,
//               };

//               // Initialize all attribute columns with empty strings
//               allAttributes.forEach((attrId) => (row[attrId] = ''));

//               // Get attributes from the correct enrollment or fallback to TEI attributes
//               const matchingEnrollment = tei.enrollments.find(
//                 (enrollment) => enrollment.program === this.programId
//               );
//               const attributesToUse = matchingEnrollment
//                 ? matchingEnrollment.attributes
//                 : tei.attributes;

//               // Populate row with attribute values
//               attributesToUse.forEach(
//                 (attr) => (row[attr.attribute] = attr.value)
//               );

//               return row;
//             });

//             setData(attributesData);
//           } else {
//             const events = (response.data as EventsResponse).events;
//             responsePager = (response.data as EventsResponse).pager;
//             const uniqueDataElements = new Set<string>();
//             events.forEach((event) => {
//               event.dataValues.forEach((dv) =>
//                 uniqueDataElements.add(dv.dataElement)
//               );
//             });
//             entityColumns = Array.from(uniqueDataElements).map(
//               (dataElement) => ({
//                 label:
//                   response.metadata.programStages[0].programStageDataElements.find(
//                     (psde) => psde.dataElement.id === dataElement
//                   )?.dataElement.name || dataElement,
//                 key: dataElement,
//               })
//             );
//             let dataElementsData = events.map((event, idx) => {
//               let row: TableRow = {
//                 event: event.event,
//                 index: (pager.page - 1) * pager.pageSize + idx + 1,
//               };
//               uniqueDataElements.forEach(
//                 (dataElement) => (row[dataElement] = '')
//               );
//               event.dataValues.forEach(
//                 (dv) => (row[dv.dataElement] = dv.value)
//               );
//               return row;
//             });
//             setData(dataElementsData);
//           }

//           const finalColumns: ColumnDefinition[] = [
//             { label: '#', key: 'index' },
//             ...entityColumns,
//             ...(this.actionOptions && this.actionOptions.length > 0
//               ? [{ label: 'Actions', key: 'actions' }]
//               : []),
//           ];

//           setColumns(finalColumns);
//           setPager(responsePager);
//         });
//     }, [
//       pager.page,
//       pager.pageSize,
//     ]);

//     const getDropdownOptions = (row: TableRow): DropdownMenuOption[] => {
//       return (this.actionOptions || []).map((option) => ({
//         ...option,
//         onClick: () => option.onClick?.(row),
//       }));
//     };

//     return (
//       <div>
//         <DataTable>
//           <TableHead>
//             <DataTableRow>
//               {columns.map((col) => (
//                 <DataTableColumnHeader key={col.key}>
//                   {col.label}
//                 </DataTableColumnHeader>
//               ))}
//             </DataTableRow>
//           </TableHead>
//           <TableBody>
//             {data.map((row) => (
//               <DataTableRow key={row.index}>
//                 {columns.map((col) => (
//                   <DataTableCell key={col.key}>
//                     {col.key === 'actions' ? (
//                       <DropdownMenu
//                         dropdownOptions={getDropdownOptions(row)}
//                         onClick={(option) => option.onClick?.()}
//                       />
//                     ) : (
//                       row[col.key]
//                     )}
//                   </DataTableCell>
//                 ))}
//               </DataTableRow>
//             ))}
//           </TableBody>
//           <TableFoot>
//             <DataTableRow>
//               <DataTableCell colSpan={columns.length}>
//                 <div>
//                   <Pagination
//                     page={pager.page}
//                     pageCount={pager.pageCount}
//                     pageSize={pager.pageSize}
//                     total={pager.total}
//                     onPageChange={(page: number) =>
//                       setPager((prev) => ({ ...prev, page }))
//                     }
//                     onPageSizeChange={(pageSize: string) => {
//                       const newPageSize = Number(pageSize);
//                       setPager((prev) => ({
//                         ...prev,
//                         page: 1,
//                         pageSize: newPageSize,
//                       }));
//                     }}
//                     pageSizes={['5', '10', '20', '50']}
//                   />
//                 </div>
//               </DataTableCell>
//             </DataTableRow>
//           </TableFoot>
//         </DataTable>
//       </div>
//     );
//   };
// }

// import { Component, Input } from '@angular/core';
// import {
//   DataTable,
//   TableHead,
//   DataTableRow,
//   DataTableColumnHeader,
//   TableBody,
//   DataTableCell,
//   Pagination, // Added for navigation
// } from '@dhis2/ui';
// import React, { useEffect, useState } from 'react';
// import { LineListService } from '../services/line-list.service';
// import { DropdownMenu, DropdownMenuOption } from '../components/dropdown-menu';
// import {
//   LineListResponse,
//   ColumnDefinition,
//   TableRow,
//   EventsResponse,
//   TrackedEntityInstancesResponse,
// } from '../models/line-list.models';

// @Component({
//   selector: 'app-line-list-table',
//   templateUrl: './line-list-table.component.html',
//   styleUrls: ['./line-list-table.component.scss'],
//   standalone: false,
// })
// export class LineListTableComponent {
//   @Input() programId!: string;
//   @Input() orgUnit!: string;
//   @Input() programStageId?: string;
//   @Input() actionOptions?: DropdownMenuOption[];

//   constructor(private lineListService: LineListService) {}

//   LineList = () => {
//     const [columns, setColumns] = useState<ColumnDefinition[]>([]);
//     const [data, setData] = useState<TableRow[]>([]);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [rowsPerPage, setRowsPerPage] = useState(10);

//     // TODO: Refactor the following column and data generation logic into a utils file (e.g., src/utils/line-list-utils.ts).
//     //       Extract functions like:
//     //       - buildDataElementMap: Create a map of data element IDs to names from metadata.
//     //       - getProgramStageData: Generate columns and data for programStageId case.
//     //       - getTrackedEntityData: Generate columns and data for trackedEntityInstances case.
//     //       - getEventData: Generate columns and data for events case (without programStageId).
//     //       - addActionsColumn: Conditionally add "Actions" column based on actionOptions.
//     //       -remove index from data and make index column dynamic
//     //       This will improve readability and reusability.

//     useEffect(() => {
//       this.lineListService
//         .getLineListData(this.programId, this.orgUnit, this.programStageId)
//         .subscribe((response: LineListResponse) => {
//           console.log('this is the response', response.metadata);
//           let entityColumns: ColumnDefinition[] = [];

//           if (this.programStageId) {
//             const dataElementMap: Record<string, string> = {};
//             response.metadata.programStages.forEach((stage) => {
//               stage.programStageDataElements.forEach((psde) => {
//                 dataElementMap[psde.dataElement.id] = psde.dataElement.name;
//               });
//             });

//             const events = (response.data as EventsResponse).events;
//             const allDataElements = new Set<string>();
//             events.forEach((event) => {
//               event.dataValues.forEach((dv) => {
//                 allDataElements.add(dv.dataElement);
//               });
//             });

//             entityColumns = Array.from(allDataElements).map((dataElementId) => ({
//               label: dataElementMap[dataElementId] || dataElementId,
//               key: dataElementId,
//             }));

//             let indexeDataElementsData: TableRow[] = events.map((event, idx) => {
//               let row: TableRow = { event: event.event, index: idx + 1 };
//               allDataElements.forEach((dataElementId) => {
//                 row[dataElementId] = '';
//               });
//               event.dataValues.forEach((dv) => {
//                 row[dv.dataElement] = dv.value;
//               });
//               return row;
//             });

//             setData(indexeDataElementsData);
//           } else if ('trackedEntityInstances' in response.data) {
//             const teis = (response.data as TrackedEntityInstancesResponse).trackedEntityInstances;
//             const allAttributes = new Set<string>();
//             teis.forEach((tei) => {
//               tei.attributes.forEach((attr) => {
//                 allAttributes.add(attr.attribute);
//               });
//             });

//             entityColumns = Array.from(allAttributes).map((attrId) => {
//               const foundAttribute = teis
//                 .flatMap((tei) => tei.attributes)
//                 .find((attr) => attr.attribute === attrId);
//               return {
//                 label: foundAttribute?.displayName || attrId,
//                 key: attrId,
//               };
//             });

//             let indexedAttributesData: TableRow[] = teis.map((tei, idx) => {
//               let row: TableRow = { trackedEntityInstance: tei.trackedEntityInstance, index: idx + 1 };
//               allAttributes.forEach((attrId) => {
//                 row[attrId] = '';
//               });
//               tei.attributes.forEach((attr) => {
//                 row[attr.attribute] = attr.value;
//               });
//               return row;
//             });

//             setData(indexedAttributesData);
//           } else if ('events' in response.data) {
//             const dataElementMap: Record<string, string> = {};
//             response.metadata.programStages.forEach((stage) => {
//               stage.programStageDataElements.forEach((psde) => {
//                 dataElementMap[psde.dataElement.id] = psde.dataElement.name;
//               });
//             });

//             const events = (response.data as EventsResponse).events;
//             const uniqueDataElements = new Set<string>();
//             events.forEach((event) => {
//               event.dataValues.forEach((dv) => {
//                 uniqueDataElements.add(dv.dataElement);
//               });
//             });

//             entityColumns = Array.from(uniqueDataElements).map((dataElement) => ({
//               label: dataElementMap[dataElement] || dataElement,
//               key: dataElement,
//             }));

//             let indexedDataElementsData: TableRow[] = events.map((event, idx) => {
//               let row: TableRow = { event: event.event, index: idx + 1 };
//               uniqueDataElements.forEach((dataElement) => {
//                 row[dataElement] = '';
//               });
//               event.dataValues.forEach((dv) => {
//                 row[dv.dataElement] = dv.value;
//               });
//               return row;
//             });
//             setData(indexedDataElementsData);
//           }

//           const finalColumns: ColumnDefinition[] = [
//             { label: '#', key: 'index' },
//             ...entityColumns,
//             ...(this.actionOptions && this.actionOptions.length > 0
//               ? [{ label: 'Actions', key: 'actions' }]
//               : []),
//           ];
//           setColumns(finalColumns);
//         });
//     }, [this.programId, this.orgUnit, this.programStageId, this.actionOptions]);

//     const getDropdownOptions = (row: TableRow): DropdownMenuOption[] => {
//       return (this.actionOptions || []).map((option) => ({
//         ...option,
//         onClick: () => option.onClick?.(row),
//       }));
//     };

//     return (
//       <div>
//         <DataTable>
//           <TableHead>
//             <DataTableRow>
//               {columns.map((col) => (
//                 <DataTableColumnHeader key={col.key}>
//                   {col.label}
//                 </DataTableColumnHeader>
//               ))}
//             </DataTableRow>
//           </TableHead>
//           <tbody>
//             {data.map((row) => (
//               <DataTableRow key={row.index}>
//                 {columns.map((col) => (
//                   <DataTableCell key={col.key}>
//                     {col.key === 'actions' ? (
//                       <DropdownMenu
//                         dropdownOptions={getDropdownOptions(row)}
//                         onClick={(option) => option.onClick?.()}
//                       />
//                     ) : (
//                       row[col.key]
//                     )}
//                   </DataTableCell>
//                 ))}
//               </DataTableRow>
//             ))}
//           </tbody>
//         </DataTable>
//         {/* Pagination controls */}
//         <Pagination
//           page={currentPage}
//           pageCount={Math.ceil(data.length / rowsPerPage)}
//           pageSize={rowsPerPage}
//           total={data.length}
//           onPageChange={(page: number) => setCurrentPage(page)}
//           onPageSizeChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
//             setRowsPerPage(Number(event.target.value));
//             setCurrentPage(1); // Reset to first page
//           }}
//           pageSizes={['5', '10', '20', '50']}
//         />
//       </div>
//     );
//   };
// }

// import { Component, Input } from '@angular/core';
// import {
//   Button,
//   DataTable,
//   TableHead,
//   DataTableRow,
//   DataTableColumnHeader,
//   TableBody,
//   DataTableCell,
//   CircularLoader,
//   Menu,
//   MenuItem,
//   Popover,
//   IconMore24,
//   colors,
//   Layer,
//   Popper,
//   FlyoutMenu,
// } from '@dhis2/ui';
// import React, { useEffect, useState } from 'react';
// import { LineListService } from '../services/line-list.service';
// import { DropdownMenu, DropdownMenuOption } from '../components/dropdown-menu';

// @Component({
//   selector: 'app-line-list-table',
//   templateUrl: './line-list-table.component.html',
//   styleUrls: ['./line-list-table.component.scss'],
//   standalone: false,
// })
// export class LineListTableComponent {
//   @Input() programId!: string;
//   @Input() orgUnit!: string;
//   @Input() programStageId?: string;
//   @Input() actionOptions?: DropdownMenuOption[]; // New input for action options

//   constructor(private lineListService: LineListService) {}

//   LineList = () => {
//     const [columns, setColumns] = useState<{ label: string; key: string }[]>(
//       []
//     );
//     const [data, setData] = useState([]);

//     // TODO: Refactor the following column and data generation logic into a utils file (e.g., src/utils/line-list-utils.ts).
//     //       Extract functions like:
//     //       - buildDataElementMap: Create a map of data element IDs to names from metadata.
//     //       - getProgramStageData: Generate columns and data for programStageId case.
//     //       - getTrackedEntityData: Generate columns and data for trackedEntityInstances case.
//     //       - getEventData: Generate columns and data for events case (without programStageId).
//     //       - addActionsColumn: Conditionally add "Actions" column based on actionOptions.
//     //       This will improve readability and reusability.
//     useEffect(() => {
//       this.lineListService
//         .getLineListData(this.programId, this.orgUnit, this.programStageId)
//         .subscribe((response) => {
//           console.log('this is the response', response.metadata);
//           let entityColumns: { label: string; key: string }[] = [];
//           if (this.programStageId) {
//             const dataElementMap: Record<string, string> = {};
//             response.metadata.programStages.forEach((stage: any) => {
//               stage.programStageDataElements.forEach((psde: any) => {
//                 dataElementMap[psde.dataElement.id] = psde.dataElement.name;
//               });
//             });

//             const allDataElements = new Set<string>();
//             response.data.events.forEach((event: any) => {
//               event.dataValues.forEach((dv: any) => {
//                 allDataElements.add(dv.dataElement);
//               });
//             });

//             entityColumns = Array.from(allDataElements).map(
//               (dataElementId: string) => ({
//                 label: dataElementMap[dataElementId] || dataElementId,
//                 key: dataElementId,
//               })
//             );

//             let dataElementData = response.data.events.map((event: any) => {
//               let row: any = { event: event.event };

//               // Initialize all possible data elements with empty values
//               allDataElements.forEach((dataElementId) => {
//                 row[dataElementId] = '';
//               });

//               // Fill in actual values from the event
//               event.dataValues.forEach((dv: any) => {
//                 row[dv.dataElement] = dv.value;
//               });

//               return row;
//             });

//             setData(dataElementData);
//             console.log(
//               'These are the columns:',
//               entityColumns,
//               dataElementData
//             );
//           } else if (response.data.trackedEntityInstances) {
//             const allAttributes = new Set<string>();
//             response.data.trackedEntityInstances.forEach((tei: any) => {
//               tei.attributes.forEach((attr: any) => {
//                 allAttributes.add(attr.attribute);
//               });
//             });

//             entityColumns = Array.from(allAttributes).map((attrId: string) => {
//               // Find an attribute with this ID to get its display name
//               const foundAttribute = response.data.trackedEntityInstances
//                 .flatMap((tei: any) => tei.attributes)
//                 .find((attr: any) => attr.attribute === attrId);

//               return {
//                 label: foundAttribute?.displayName || attrId,
//                 key: attrId,
//               };
//             });

//             let attributeData = response.data.trackedEntityInstances.map(
//               (tei: any) => {
//                 let row: any = {
//                   trackedEntityInstance: tei.trackedEntityInstance,
//                 };

//                 allAttributes.forEach((attrId) => {
//                   row[attrId] = ''; // Default empty value
//                 });

//                 tei.attributes.forEach((attr: any) => {
//                   row[attr.attribute] = attr.value;
//                 });

//                 return row;
//               }
//             );

//             setData(attributeData);
//           } else if (response.data.events) {
//             const dataElementMap: Record<string, string> = {};
//             response.metadata.programStages.forEach((stage: any) => {
//               stage.programStageDataElements.forEach((psde: any) => {
//                 dataElementMap[psde.dataElement.id] = psde.dataElement.name;
//               });
//             });

//             const uniqueDataElements = new Set<string>();

//             response.data.events.forEach((event: any) => {
//               event.dataValues.forEach((dv: any) => {
//                 uniqueDataElements.add(dv.dataElement);
//               });
//             });

//             entityColumns = Array.from(uniqueDataElements).map(
//               (dataElement) => ({
//                 label: dataElementMap[dataElement] || dataElement,
//                 key: dataElement,
//               })
//             );

//             let dataElementData = response.data.events.map((event: any) => {
//               let row: any = { event: event.event };

//               uniqueDataElements.forEach((dataElement) => {
//                 row[dataElement] = '';
//               });

//               event.dataValues.forEach((dv: any) => {
//                 row[dv.dataElement] = dv.value;
//               });

//               return row;
//             });

//             console.log('these are the data elements', dataElementData);
//             setData(dataElementData);
//           }

//           // Conditionally add the "Actions" column only if actionOptions are provided
//           if (this.actionOptions && this.actionOptions.length > 0) {
//             setColumns([
//               ...entityColumns,
//               { label: 'Actions', key: 'actions' },
//             ]);
//           } else {
//             setColumns(entityColumns);
//           }
//         });
//     }, []);

//     // Use the actionOptions from @Input, or fallback to an empty array
//     const getDropdownOptions = (row: any): DropdownMenuOption[] => {
//       return (this.actionOptions || []).map((option) => ({
//         ...option,
//         onClick: () => option.onClick?.(row), // Pass row data to the original onClick
//       }));
//     };

//     return (
//       <DataTable>
//       <TableHead>
//         <DataTableRow>
//           {/* Add Index column as the first column */}
//           <DataTableColumnHeader key="index">#</DataTableColumnHeader>
//           {columns.map((col) => (
//             <DataTableColumnHeader key={col.key}>
//               {col.label}
//             </DataTableColumnHeader>
//           ))}
//         </DataTableRow>
//       </TableHead>
//       <tbody>
//         {data.map((row, index) => (
//           <DataTableRow key={index}>
//             {/* Display index (1-based) */}
//             <DataTableCell key="index">{index + 1}</DataTableCell>
//             {columns.map((col) => (
//               <DataTableCell key={col.key}>
//                 {col.key === 'actions' ? (
//                   <DropdownMenu
//                     dropdownOptions={getDropdownOptions(row)}
//                     onClick={(option) => option.onClick?.()}
//                   />
//                 ) : (
//                   row[col.key]
//                 )}
//               </DataTableCell>
//             ))}
//           </DataTableRow>
//         ))}
//       </tbody>
//     </DataTable>
//     );
//   };
// }

// // Table = () => {
// //   const [columns, setColumns] = useState<{ label: string; key: string }[]>([]);
// //   const [data, setData] = useState([]);
// //   useEffect(() => {
// //     this.lineListService
// //       .getLineListData(this.programId, this.orgUnit, this.programStageId)
// //       .subscribe((response) => {
// //         if (this.programStageId) {
// //           // If programStageId is provided, show Data Elements
// //           let columns = response.dataValues.length
// //             ? response.dataValues.map((dv: any) => ({
// //                 label: dv.dataElement,
// //                 key: dv.dataElement,
// //               }))
// //             : [];
// //           setColumns(columns);
// //           let data = response.map((event: any) => {
// //             let row: any = { event: event.event };
// //             event.dataValues.forEach((dv: any) => {
// //               row[dv.dataElement] = dv.value;
// //             });
// //             return row;
// //           });
// //           setData(data);
// //         } else if (response.trackedEntityInstances) {
// //           // Tracker Program → Show Attributes
// //           let columns = response.trackedEntityInstances[0]?.attributes.map(
// //             (attr: any) => ({
// //               label: attr.displayName,
// //               key: attr.attribute,
// //             })
// //           );
// //           setColumns(columns);
// //           console.log('these are the columns', columns);

// //           let data = response.trackedEntityInstances.map((tei: any) => {
// //             let row: any = {
// //               trackedEntityInstance: tei.trackedEntityInstance,
// //             };
// //             tei.attributes.forEach((attr: any) => {
// //               row[attr.attribute] = attr.value;
// //             });
// //             return row;
// //           });
// //           setData(data);
// //           console.log('these are the data', data);
// //         } else if (response.events) {
// //           // Event Program → Show Data Elements
// //           let columns = response.events[0]?.dataValues.map((dv: any) => ({
// //             label: dv.dataElement,
// //             key: dv.dataElement,
// //           }));
// //           setColumns(columns);
// //           let data = response.events.map((event: any) => {
// //             let row: any = { event: event.event };
// //             event.dataValues.forEach((dv: any) => {
// //               row[dv.dataElement] = dv.value;
// //             });
// //             return row;
// //           });
// //           setData(data);
// //         }
// //       });
// //   }, []);

// //   return (
// //     <DataTable>
// //       <TableHead>
// //         <DataTableRow>
// //           {columns.map((col) => (
// //             <DataTableColumnHeader key={col.key}>
// //               {col.label}
// //             </DataTableColumnHeader>
// //           ))}
// //         </DataTableRow>
// //       </TableHead>
// //       <tbody>
// //         {data.map((row, index) => (
// //           <DataTableRow key={index}>
// //             {columns.map((col) => (
// //               <DataTableCell key={col.key}>{row[col.key]}</DataTableCell>
// //             ))}
// //           </DataTableRow>
// //         ))}
// //       </tbody>
// //     </DataTable>
// //   );
// // };
