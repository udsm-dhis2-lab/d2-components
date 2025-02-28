import { Component, Input } from '@angular/core';
import {
  DataTable,
  TableHead,
  DataTableRow,
  DataTableColumnHeader,
  TableBody,
  DataTableCell,
} from '@dhis2/ui';
import React, { useEffect, useState } from 'react';
import { LineListService } from '../services/line-list.service';
import { DropdownMenu, DropdownMenuOption } from '../components/dropdown-menu';
import {
  LineListResponse,
  ColumnDefinition,
  TableRow,
  EventsResponse,
  TrackedEntityInstancesResponse,
} from '../models/line-list.models';

@Component({
  selector: 'app-line-list-table',
  templateUrl: './line-list-table.component.html',
  styleUrls: ['./line-list-table.component.scss'],
  standalone: false,
})
export class LineListTableComponent {
  @Input() programId!: string;
  @Input() orgUnit!: string;
  @Input() programStageId?: string;
  @Input() actionOptions?: DropdownMenuOption[];

  constructor(private lineListService: LineListService) {}

  LineList = () => {
    const [columns, setColumns] = useState<ColumnDefinition[]>([]);
    const [data, setData] = useState<TableRow[]>([]);

    // TODO: Refactor the following column and data generation logic into a utils file (e.g., src/utils/line-list-utils.ts).
    //       Extract functions like:
    //       - buildDataElementMap: Create a map of data element IDs to names from metadata.
    //       - getProgramStageData: Generate columns and data for programStageId case.
    //       - getTrackedEntityData: Generate columns and data for trackedEntityInstances case.
    //       - getEventData: Generate columns and data for events case (without programStageId).
    //       - addActionsColumn: Conditionally add "Actions" column based on actionOptions.
    //       -remove index from data and make index column dynamic
    //       This will improve readability and reusability.

    useEffect(() => {
      this.lineListService
        .getLineListData(this.programId, this.orgUnit, this.programStageId)
        .subscribe((response: LineListResponse) => {
          console.log('this is the response', response.metadata);
          let entityColumns: ColumnDefinition[] = []; 

          if (this.programStageId) {
            const dataElementMap: Record<string, string> = {};
            response.metadata.programStages.forEach((stage) => {
              stage.programStageDataElements.forEach((psde) => {
                dataElementMap[psde.dataElement.id] = psde.dataElement.name;
              });
            });
            
            const events = (response.data as EventsResponse).events;
            const allDataElements = new Set<string>();
            events.forEach((event) => {
              event.dataValues.forEach((dv) => {
                allDataElements.add(dv.dataElement);
              });
            });

            entityColumns = Array.from(allDataElements).map((dataElementId) => ({
              label: dataElementMap[dataElementId] || dataElementId,
              key: dataElementId,
            })); 

            let indexeDataElementsData: TableRow[] = events.map((event, idx) => {
              let row: TableRow = { event: event.event, index: idx + 1 };
              allDataElements.forEach((dataElementId) => {
                row[dataElementId] = '';
              });
              event.dataValues.forEach((dv) => {
                row[dv.dataElement] = dv.value;
              });
              return row;
            });

            setData(indexeDataElementsData);
           
          } else if ('trackedEntityInstances' in response.data) {
            const teis = (response.data as TrackedEntityInstancesResponse).trackedEntityInstances;
            const allAttributes = new Set<string>();
            teis.forEach((tei) => {
              tei.attributes.forEach((attr) => {
                allAttributes.add(attr.attribute);
              });
            });

            entityColumns = Array.from(allAttributes).map((attrId) => {
              const foundAttribute = teis
                .flatMap((tei) => tei.attributes)
                .find((attr) => attr.attribute === attrId);
              return {
                label: foundAttribute?.displayName || attrId,
                key: attrId,
              };
            });

            let indexedAttributesData: TableRow[] = teis.map((tei, idx) => {
              let row: TableRow = { trackedEntityInstance: tei.trackedEntityInstance, index: idx + 1 };
              allAttributes.forEach((attrId) => {
                row[attrId] = '';
              });
              tei.attributes.forEach((attr) => {
                row[attr.attribute] = attr.value;
              });
              return row;
            });

            setData(indexedAttributesData);
          } else if ('events' in response.data) {
            const dataElementMap: Record<string, string> = {};
            response.metadata.programStages.forEach((stage) => {
              stage.programStageDataElements.forEach((psde) => {
                dataElementMap[psde.dataElement.id] = psde.dataElement.name;
              });
            });

            const events = (response.data as EventsResponse).events;
            const uniqueDataElements = new Set<string>();
            events.forEach((event) => {
              event.dataValues.forEach((dv) => {
                uniqueDataElements.add(dv.dataElement);
              });
            });

            entityColumns = Array.from(uniqueDataElements).map((dataElement) => ({
              label: dataElementMap[dataElement] || dataElement,
              key: dataElement,
            }));

            let indexedDataElementsData: TableRow[] = events.map((event, idx) => {
              let row: TableRow = { event: event.event, index: idx + 1 };
              uniqueDataElements.forEach((dataElement) => {
                row[dataElement] = '';
              });
              event.dataValues.forEach((dv) => {
                row[dv.dataElement] = dv.value;
              });
              return row;
            });
            setData(indexedDataElementsData);
          }

          const finalColumns: ColumnDefinition[] = [
            { label: '#', key: 'index' }, // Index column
            ...entityColumns,
            ...(this.actionOptions && this.actionOptions.length > 0
              ? [{ label: 'Actions', key: 'actions' }]
              : []),
          ];
          setColumns(finalColumns);
        });
    }, [this.programId, this.orgUnit, this.programStageId, this.actionOptions]);

    const getDropdownOptions = (row: TableRow): DropdownMenuOption[] => {
      return (this.actionOptions || []).map((option) => ({
        ...option,
        onClick: () => option.onClick?.(row),
      }));
    };

    return (
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
        <tbody>
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
        </tbody>
      </DataTable>
    );
  };
}






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
