import { Component, Input, OnInit } from '@angular/core';
import {
  Button,
  DataTable,
  TableHead,
  DataTableRow,
  DataTableColumnHeader,
  TableBody,
  DataTableCell,
  CircularLoader,
} from '@dhis2/ui';
import React, { useEffect, useRef, useState } from 'react';
import { LineListService } from '../services/line-list.service';
import { set } from 'lodash';

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

  // columns: { label: string; key: string }[] = [];
  // data: any[] = [];

  constructor(private lineListService: LineListService) {}

  // ngOnInit(): void {
  //   this.fetchLineListData();
  // }

  // fetchLineListData(): void {
  //   this.lineListService
  //     .getLineListData(this.programId, this.orgUnit, this.programStageId)
  //     .subscribe((response) => {
  //       if (this.programStageId) {
  //         // If programStageId is provided, show Data Elements
  //         this.columns = response.dataValues.length
  //           ? response.dataValues.map((dv: any) => ({
  //               label: dv.dataElement,
  //               key: dv.dataElement,
  //             }))
  //           : [];
  //         this.data = response.map((event: any) => {
  //           let row: any = { event: event.event };
  //           event.dataValues.forEach((dv: any) => {
  //             row[dv.dataElement] = dv.value;
  //           });
  //           return row;
  //         });
  //       } else if (response.trackedEntityInstances) {
  //         // Tracker Program → Show Attributes
  //         this.columns = response.trackedEntityInstances[0]?.attributes.map(
  //           (attr: any) => ({
  //             label: attr.displayName,
  //             key: attr.attribute,
  //           })
  //         );

  //         console.log('these are the columns', this.columns);

  //         this.data = response.trackedEntityInstances.map((tei: any) => {
  //           let row: any = { trackedEntityInstance: tei.trackedEntityInstance };
  //           tei.attributes.forEach((attr: any) => {
  //             row[attr.attribute] = attr.value;
  //           });
  //           return row;
  //         });
  //         console.log('these are the data', this.data);
  //       } else if (response.events) {
  //         // Event Program → Show Data Elements
  //         this.columns = response.events[0]?.dataValues.map((dv: any) => ({
  //           label: dv.dataElement,
  //           key: dv.dataElement,
  //         }));
  //         this.data = response.events.map((event: any) => {
  //           let row: any = { event: event.event };
  //           event.dataValues.forEach((dv: any) => {
  //             row[dv.dataElement] = dv.value;
  //           });
  //           return row;
  //         });
  //       }
  //     });
  // }

  Table = () => {
    const [columns, setColumns] = useState<{ label: string; key: string }[]>([]);
    const [data, setData] = useState([]);
    useEffect(() => {
      this.lineListService
        .getLineListData(this.programId, this.orgUnit, this.programStageId)
        .subscribe((response) => {
          if (this.programStageId) {
            // If programStageId is provided, show Data Elements
            let columns = response.dataValues.length
              ? response.dataValues.map((dv: any) => ({
                  label: dv.dataElement,
                  key: dv.dataElement,
                }))
              : [];
            setColumns(columns);
            let data = response.map((event: any) => {
              let row: any = { event: event.event };
              event.dataValues.forEach((dv: any) => {
                row[dv.dataElement] = dv.value;
              });
              return row;
            });
            setData(data);
          } else if (response.trackedEntityInstances) {
            // Tracker Program → Show Attributes
            let columns = response.trackedEntityInstances[0]?.attributes.map(
              (attr: any) => ({
                label: attr.displayName,
                key: attr.attribute,
              })
            );
            setColumns(columns);
            console.log('these are the columns', columns);

            let data = response.trackedEntityInstances.map((tei: any) => {
              let row: any = {
                trackedEntityInstance: tei.trackedEntityInstance,
              };
              tei.attributes.forEach((attr: any) => {
                row[attr.attribute] = attr.value;
              });
              return row;
            });
            setData(data);
            console.log('these are the data', data);
          } else if (response.events) {
            // Event Program → Show Data Elements
            let columns = response.events[0]?.dataValues.map((dv: any) => ({
              label: dv.dataElement,
              key: dv.dataElement,
            }));
            setColumns(columns);
            let data = response.events.map((event: any) => {
              let row: any = { event: event.event };
              event.dataValues.forEach((dv: any) => {
                row[dv.dataElement] = dv.value;
              });
              return row;
            });
            setData(data);
          }
        });
    }, []);

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
                <DataTableCell key={col.key}>{row[col.key]}</DataTableCell>
              ))}
            </DataTableRow>
          ))}
        </tbody>
      </DataTable>
    );
  };

  // Table = () => {
  //   return (
  //     <DataTable>
  //       <TableHead>
  //         <DataTableRow>
  //           {this.columns.map((col) => (
  //             <DataTableColumnHeader key={col.key}>
  //               {col.label}
  //             </DataTableColumnHeader>
  //           ))}
  //         </DataTableRow>
  //       </TableHead>
  //       <tbody>
  //         {this.data.map((row, index) => (
  //           <DataTableRow key={index}>
  //             {this.columns.map((col) => (
  //               <DataTableCell key={col.key}>{row[col.key]}</DataTableCell>
  //             ))}
  //           </DataTableRow>
  //         ))}
  //       </tbody>
  //     </DataTable>
  //   );
  // };
}

// import {
//   Component,
//   Input,
// } from "@angular/core";
// import {
//   Button,
//   DataTable,
//   TableHead,
//   DataTableRow,
//   DataTableColumnHeader,
//   TableBody,
//   DataTableCell,
//   CircularLoader,
// } from "@dhis2/ui";
// import React, { useEffect, useRef, useState } from "react";

// @Component({
//   selector: "app-line-list-table",
//   templateUrl: "./line-list-table.component.html",
//   styleUrls: ["./line-list-table.component.scss"],
//   standalone: false,
// })
// export class LineListTableComponent{
//    @Input() columns: { label: string; key: string }[] = [];
//    @Input() data: any[] = [];

//   Table = () => {
//     return (
//       <DataTable>
//         <TableHead>
//           <DataTableRow>
//             {this.columns.map((col) => (
//               <DataTableColumnHeader key={col.key}>
//                 {col.label}
//               </DataTableColumnHeader>
//             ))}
//           </DataTableRow>
//         </TableHead>
//         <tbody>
//           {this.data.map((row, index) => (
//             <DataTableRow key={index}>
//               {this.columns.map((col) => (
//                 <DataTableCell key={col.key}>
//                   {row[col.key]}
//                 </DataTableCell>
//               ))}
//             </DataTableRow>
//           ))}
//         </tbody>
//       </DataTable>
//     );
//   }
// }
