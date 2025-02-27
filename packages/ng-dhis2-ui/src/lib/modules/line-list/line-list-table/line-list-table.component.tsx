import {
  Component,
  Input,
} from "@angular/core";
import {
  Button,
  DataTable,
  TableHead,
  DataTableRow,
  DataTableColumnHeader,
  TableBody,
  DataTableCell,
  CircularLoader,
} from "@dhis2/ui";
import React, { useEffect, useRef, useState } from "react";


@Component({
  selector: "app-line-list-table",
  templateUrl: "./line-list-table.component.html",
  styleUrls: ["./line-list-table.component.scss"],
  standalone: false,
})
export class LineListTableComponent{
   @Input() columns: { label: string; key: string }[] = [];
   @Input() data: any[] = [];
  
  Table = () => {
    return (
      <DataTable>
        <TableHead>
          <DataTableRow>
            {this.columns.map((col) => (
              <DataTableColumnHeader key={col.key}>
                {col.label}
              </DataTableColumnHeader>
            ))}
          </DataTableRow>
        </TableHead>
        <tbody>
          {this.data.map((row, index) => (
            <DataTableRow key={index}>
              {this.columns.map((col) => (
                <DataTableCell key={col.key}>
                  {row[col.key]}
                </DataTableCell>
              ))}
            </DataTableRow>
          ))}
        </tbody>
      </DataTable>
    );
  }
}
