import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgZone, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  Button,
  IconDownload16,
  IconFullscreen16,
  IconFullscreenExit16,
  IconVisualizationColumn16,
  Menu,
  MenuItem,
} from '@dhis2/ui';
import {
  DownloadFormat,
  VISUALIZATION_TYPES,
  VisualizationDownloadOption,
  VisualizationDownloadOptionUtil,
} from '@iapps/d2-visualizer';
import { ReactWrapperModule } from '@iapps/ng-dhis2-ui';
import React, { useState } from 'react';

@Component({
  standalone: true,
  imports: [CommonModule, ReactWrapperModule, MatTooltipModule, MatIconModule],
  selector: 'd2-dashboard-item-header',
  templateUrl: './dashboard-item-header.component.html',
  styleUrls: ['./dashboard-item-header.component.scss'],
})
export class DashboardItemHeaderComponent {
  @Input() fullScreen!: boolean;
  @Input() isChart!: boolean;
  @Input() hideChartTypes!: boolean | undefined;
  @Input() visualizationTitle?: string;
  @Input() visualizationType!: any;
  @Input() disableVisualizationChange!: boolean;
  visualizationTypes!: any[];

  showVisualizationTypes!: boolean;
  downloadOptions: VisualizationDownloadOption[] = [];
  @Output()
  download: EventEmitter<DownloadFormat> = new EventEmitter<DownloadFormat>();
  @Output() fullscreenChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() visualizationTypeChange: EventEmitter<any> =
    new EventEmitter<any>();

  constructor(private ngZone: NgZone) {
    this.visualizationTypes = VISUALIZATION_TYPES.filter(
      (visualizationType) => !visualizationType.hiddenInList
    );
  }

  FullScreenButton = () => {
    const [fullScreen, setFullScreen] = useState(this.fullScreen);
    return (
      <Button
        small
        className="d2-dashboard__visualization-button"
        title={fullScreen ? 'Hide fullscreen' : 'View in fullscreen'}
        onClick={() => {
          setFullScreen(!fullScreen);
          this.ngZone.run(() => {
            this.onFullScreenAction();
          });
        }}
      >
        {fullScreen ? <IconFullscreenExit16 /> : <IconFullscreen16 />}
      </Button>
    );
  };

  DownloadButton: any;

  VisualizationOptionButton = () => {
    const [showVisualizationTypes, setShowVisualizationTypes] = useState(false);
    const [activeVisualizationType, setActiveVisualizationType] = useState(
      this.visualizationTypes?.find(
        (visualizationType) =>
          visualizationType.type === this.visualizationType.type
      )
    );

    return (
      <>
        <Button
          className="d2-dashboard__visualization-type-button"
          small
          onClick={() => {
            setShowVisualizationTypes(!showVisualizationTypes);
          }}
        >
          {activeVisualizationType?.type ? (
            <activeVisualizationType.icon />
          ) : (
            <IconVisualizationColumn16 />
          )}
        </Button>

        {showVisualizationTypes ? (
          <div className="d2-dashboard__visualization-type-list">
            <Menu dense>
              {this.visualizationTypes.map((visualizationType) => (
                <MenuItem
                  key={visualizationType.type}
                  label={visualizationType.description}
                  icon={<visualizationType.icon />}
                  active={
                    activeVisualizationType?.type === visualizationType.type
                  }
                  disabled={
                    activeVisualizationType?.type === visualizationType.type
                  }
                  onClick={() => {
                    setActiveVisualizationType(visualizationType);
                    setShowVisualizationTypes(false);
                    this.ngZone.run(() => {
                      // this.updateChartType(visualizationType.type);
                      this.onVisualizationTypeChange(visualizationType.type);
                    });
                  }}
                />
              ))}
            </Menu>
          </div>
        ) : (
          <></>
        )}
      </>
    );
  };

  ngOnInit() {
    this.downloadOptions = VisualizationDownloadOptionUtil.get(
      this.visualizationType.type
    );

    if (this.downloadOptions?.length > 0) {
      this.DownloadButton = () => {
        const [showDownloadOptions, setShowDownloadOptions] = useState(false);
        return (
          <>
            <Button
              className="d2-dashboard__visualization-button"
              small
              onClick={() => {
                setShowDownloadOptions(!showDownloadOptions);
              }}
            >
              <IconDownload16 />
            </Button>
            {showDownloadOptions ? (
              <div className="d2-dashboard__visualization-download-options">
                <Menu dense>
                  {this.downloadOptions.map((downloadOption) => (
                    <MenuItem
                      key={downloadOption.label}
                      label={downloadOption.label}
                      onClick={() => {
                        setShowDownloadOptions(!showDownloadOptions);
                        this.ngZone.run(() => {
                          this.onDownload(downloadOption.format);
                        });
                      }}
                    />
                  ))}
                </Menu>
              </div>
            ) : (
              <></>
            )}
          </>
        );
      };
    }
  }

  onDownload(format: DownloadFormat) {
    this.download.emit(format);
  }

  onFullScreenAction(event?: MouseEvent) {
    event?.stopPropagation();
    this.fullscreenChange.emit();
  }

  onVisualizationTypeChange(visualizationType: string) {
    this.showVisualizationTypes = false;
    this.visualizationTypeChange.emit(visualizationType);
  }

  onToggleVisualizationType(event: MouseEvent) {
    event.stopPropagation();
    this.showVisualizationTypes = !this.showVisualizationTypes;
  }
}
