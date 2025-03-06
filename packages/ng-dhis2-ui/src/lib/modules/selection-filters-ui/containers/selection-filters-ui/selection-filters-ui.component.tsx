import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import React, { useState, useEffect } from 'react';
import * as ReactDOM from 'react-dom/client';
import { InputField, SingleSelectField, SingleSelectOption, Button } from '@dhis2/ui';
import { ReactWrapperComponent } from '../../../react-wrapper';
import { AttributeFilter, DataElementFilter, SelectionFiltersProps } from '../../models/selection-filters-ui.model';

@Component({
  selector: 'app-selection-filters-ui',
  template: '<ng-content></ng-content>',
  styleUrls: ['./selection-filters-ui.component.scss'],
  standalone: false,
})
export class SelectionFiltersComponent extends ReactWrapperComponent implements AfterViewInit {
  @Input() actionOptions: { label: string; onClick: (row: any) => void }[] = [];
  @Input() attributeFilters: AttributeFilter[] = [];
  @Input() dataElementFilters: DataElementFilter[] = [];
  @Input() startDate?: string;
  @Input() endDate?: string;
  @Output() actionSelected = new EventEmitter<SelectionFiltersProps>();

  SelectionFiltersUI = () => {
    const [filters, setFilters] = useState<{
      attributeFilters: AttributeFilter[];
      dataElementFilters: DataElementFilter[];
    }>({
      attributeFilters: this.attributeFilters || [],
      dataElementFilters: this.dataElementFilters || [],
    });

    useEffect(() => {
      setFilters({
        attributeFilters: this.attributeFilters,
        dataElementFilters: this.dataElementFilters,
      });
    }, [this.attributeFilters, this.dataElementFilters]);

    const handleAttributeChange = (index: number, selectedValue: string) => {
      setFilters((prevFilters) => {
        const updatedFilters = [...prevFilters.attributeFilters];
        updatedFilters[index] = { ...updatedFilters[index], value: selectedValue };
        return { ...prevFilters, attributeFilters: updatedFilters };
      });
    };

    const handleDataElementChange = (index: number, selectedValue: string) => {
      setFilters((prevFilters) => {
        const updatedFilters = [...prevFilters.dataElementFilters];
        updatedFilters[index] = { ...updatedFilters[index], value: selectedValue };
        return { ...prevFilters, dataElementFilters: updatedFilters };
      });
    };

    const handleSearch = () => {
      this.actionSelected.emit(filters as SelectionFiltersProps);
    };

    // Grid Column Span Logic for Attribute Filters
    const getAttributeColumnSpan = (index: number) => {
      const totalItems = filters.attributeFilters.length;

      if (totalItems <= 4) {
        // If 1 to 4 items, place them in a single row (span all columns if there's only one item)
        if (totalItems === 1) {
          return 'span 4'; // One item spans all four columns
        }
        if (totalItems === 2) {
          return 'span 2'; // Two items, each spans 2 columns
        }
        if (totalItems === 3) {
          return 'span 1'; // Three items, each spans one column
        }
        if (totalItems === 4) {
          return 'span 1'; // Four items, each spans one column
        }
      } else {
        // More than 4 items, recursively adjust the placement
        const rowIndex = Math.floor(index / 2); // Calculate row by pairs
        if (index % 2 === 0) {
          // For first item in each row, span 2 columns
          return 'span 2';
        } else if (index === totalItems - 1) {
          // Last item, spans the full row (4 columns)
          return 'span 4';
        } else {
          // For other items, span 2 columns
          return 'span 2';
        }
      }

      return 'span 1'; // Default behavior
    };

    // Grid Column Span Logic for Data Element Filters
    const getDataElementColumnSpan = (index: number) => {
      const totalItems = filters.dataElementFilters.length;

      if (totalItems <= 4) {
        // If 1 to 4 items, place them in a single row (span all columns if there's only one item)
        if (totalItems === 1) {
          return 'span 4'; // One item spans all four columns
        }
        if (totalItems === 2) {
          return 'span 2'; // Two items, each spans 2 columns
        }
        if (totalItems === 3) {
          return 'span 1'; // Three items, each spans one column
        }
        if (totalItems === 4) {
          return 'span 1'; // Four items, each spans one column
        }
      } else {
        // More than 4 items, recursively adjust the placement
        const rowIndex = Math.floor(index / 2); // Calculate row by pairs
        if (index % 2 === 0) {
          // For first item in each row, span 2 columns
          return 'span 2';
        } else if (index === totalItems - 1) {
          // Last item, spans the full row (4 columns)
          return 'span 4';
        } else {
          // For other items, span 2 columns
          return 'span 2';
        }
      }

      return 'span 1'; // Default behavior
    };

    return (
      <div style={{
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      }}>
        {/* Attribute Filters Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
        }}>
          {filters.attributeFilters.map((filter, index) => (
            <div key={index} style={{ gridColumn: getAttributeColumnSpan(index) }}>
              {filter.hasOptions && filter.options.length > 0 ? (
                <SingleSelectField
                  className="single-select"
                  label={filter.name || 'Select Option'}
                  selected={filter.value}
                  onChange={(event: { selected: string }) => handleAttributeChange(index, event.selected)}
                >
                  {filter.options.map((option, i) => (
                    <SingleSelectOption key={i} label={option.name} value={option.id} />
                  ))}
                </SingleSelectField>
              ) : (
                <InputField
                  className="input-field"
                  label={filter.name || 'Program name'}
                  value={filter.value}
                  onChange={(event: { value: string }) => handleAttributeChange(index, event.value)}
                />
              )}
            </div>
          ))}
        </div>

        {/* Data Element Filters Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
        }}>
          {filters.dataElementFilters.map((filter, index) => (
            <div key={index} style={{ gridColumn: getDataElementColumnSpan(index) }}>
              {filter.hasOptions && filter.options.length > 0 ? (
                <SingleSelectField
                  className="single-select"
                  label={filter.name || 'Aggregation type'}
                  selected={filter.value}
                  onChange={(event: { selected: string }) => handleDataElementChange(index, event.selected)}
                >
                  {filter.options.map((option, i) => (
                    <SingleSelectOption key={i} label={option.name} value={option.id} />
                  ))}
                </SingleSelectField>
              ) : (
                <InputField
                  className="input-field"
                  label={filter.name || 'Program name'}
                  value={filter.value}
                  onChange={(event: { value: string }) => handleDataElementChange(index, event.value)}
                />
              )}
            </div>
          ))}
        </div>

        {/* Search Button */}
        <div style={{ textAlign: 'right', marginTop: '16px' }}>
          <Button onClick={handleSearch}>Search</Button>
        </div>
      </div>
    );
  };

  override async ngAfterViewInit() {
    if (!this.elementRef) throw new Error('No element ref');
    this.reactDomRoot = ReactDOM.createRoot(this.elementRef.nativeElement);
    this.component = this.SelectionFiltersUI;
    this.render();
  }
}
