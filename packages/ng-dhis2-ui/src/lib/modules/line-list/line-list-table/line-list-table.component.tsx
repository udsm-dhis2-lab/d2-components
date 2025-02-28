import { Component, Input } from '@angular/core';
import {
  Button,
  DataTable,
  TableHead,
  DataTableRow,
  DataTableColumnHeader,
  TableBody,
  DataTableCell,
  CircularLoader,
  Menu,
  MenuItem,
  Popover,
  IconMore24,
  colors,
  Layer,
  Popper,
  FlyoutMenu,
} from '@dhis2/ui';
import React, { useEffect, useState } from 'react';
import { LineListService } from '../services/line-list.service';
import { DropdownMenu, DropdownMenuOption } from '../components/dropdown-menu';

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
  @Input() actionOptions?: DropdownMenuOption[]; // New input for action options

  constructor(private lineListService: LineListService) {}

  Table = () => {
    const [columns, setColumns] = useState<{ label: string; key: string }[]>([]);
    const [data, setData] = useState([]);

    useEffect(() => {
      this.lineListService
        .getLineListData(this.programId, this.orgUnit, this.programStageId)
        .subscribe((response) => {
          let newColumns: { label: string; key: string }[] = [];

          if (this.programStageId) {
            newColumns = response.dataValues.map((dv: any) => ({
              label: dv.dataElement,
              key: dv.dataElement,
            }));

            let dataElementData = response.map((event: any) => {
              let row: any = { event: event.event };
              event.dataValues.forEach((dv: any) => {
                row[dv.dataElement] = dv.value;
              });
              return row;
            });

            setData(dataElementData);
          } else if (response.trackedEntityInstances) {
            newColumns = response.trackedEntityInstances[0]?.attributes.map(
              (attr: any) => ({
                label: attr.displayName,
                key: attr.attribute,
              })
            );

            let attributeData = response.trackedEntityInstances.map((tei: any) => {
              let row: any = { trackedEntityInstance: tei.trackedEntityInstance };
              tei.attributes.forEach((attr: any) => {
                row[attr.attribute] = attr.value;
              });
              return row;
            });

            setData(attributeData);
          } else if (response.events) {
            newColumns = response.events[0]?.dataValues.map((dv: any) => ({
              label: dv.dataElement,
              key: dv.dataElement,
            }));

            let dataElementData = response.events.map((event: any) => {
              let row: any = { event: event.event };
              event.dataValues.forEach((dv: any) => {
                row[dv.dataElement] = dv.value;
              });
              return row;
            });

            setData(dataElementData);
          }

          // Conditionally add the "Actions" column only if actionOptions are provided
          if (this.actionOptions && this.actionOptions.length > 0) {
            setColumns([...newColumns, { label: "Actions", key: "actions" }]);
          } else {
            setColumns(newColumns);
          }
        });
    }, [this.actionOptions]); // Add actionOptions as a dependency to re-run if it changes

    // Use the actionOptions from @Input, or fallback to an empty array
    const getDropdownOptions = (row: any): DropdownMenuOption[] => {
      return (this.actionOptions || []).map((option) => ({
        ...option,
        onClick: () => option.onClick?.(row), // Pass row data to the original onClick
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
          {data.map((row, index) => (
            <DataTableRow key={index}>
              {columns.map((col) => (
                <DataTableCell key={col.key}>
                  {col.key === "actions" ? (
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


 // Table = () => {
  //   const [columns, setColumns] = useState<{ label: string; key: string }[]>([]);
  //   const [data, setData] = useState([]);
  //   useEffect(() => {
  //     this.lineListService
  //       .getLineListData(this.programId, this.orgUnit, this.programStageId)
  //       .subscribe((response) => {
  //         if (this.programStageId) {
  //           // If programStageId is provided, show Data Elements
  //           let columns = response.dataValues.length
  //             ? response.dataValues.map((dv: any) => ({
  //                 label: dv.dataElement,
  //                 key: dv.dataElement,
  //               }))
  //             : [];
  //           setColumns(columns);
  //           let data = response.map((event: any) => {
  //             let row: any = { event: event.event };
  //             event.dataValues.forEach((dv: any) => {
  //               row[dv.dataElement] = dv.value;
  //             });
  //             return row;
  //           });
  //           setData(data);
  //         } else if (response.trackedEntityInstances) {
  //           // Tracker Program → Show Attributes
  //           let columns = response.trackedEntityInstances[0]?.attributes.map(
  //             (attr: any) => ({
  //               label: attr.displayName,
  //               key: attr.attribute,
  //             })
  //           );
  //           setColumns(columns);
  //           console.log('these are the columns', columns);

  //           let data = response.trackedEntityInstances.map((tei: any) => {
  //             let row: any = {
  //               trackedEntityInstance: tei.trackedEntityInstance,
  //             };
  //             tei.attributes.forEach((attr: any) => {
  //               row[attr.attribute] = attr.value;
  //             });
  //             return row;
  //           });
  //           setData(data);
  //           console.log('these are the data', data);
  //         } else if (response.events) {
  //           // Event Program → Show Data Elements
  //           let columns = response.events[0]?.dataValues.map((dv: any) => ({
  //             label: dv.dataElement,
  //             key: dv.dataElement,
  //           }));
  //           setColumns(columns);
  //           let data = response.events.map((event: any) => {
  //             let row: any = { event: event.event };
  //             event.dataValues.forEach((dv: any) => {
  //               row[dv.dataElement] = dv.value;
  //             });
  //             return row;
  //           });
  //           setData(data);
  //         }
  //       });
  //   }, []);

  //   return (
  //     <DataTable>
  //       <TableHead>
  //         <DataTableRow>
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
  //             {columns.map((col) => (
  //               <DataTableCell key={col.key}>{row[col.key]}</DataTableCell>
  //             ))}
  //           </DataTableRow>
  //         ))}
  //       </tbody>
  //     </DataTable>
  //   );
  // };
