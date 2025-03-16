// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
export class MapLayerConfiguration {
  hideBasemap: boolean;
  hideNavigationControls: boolean;
  hideStyleSwitcher: boolean;
  hideLegendControl: boolean;

  constructor(props?: Partial<MapLayerConfiguration>) {
    this.hideBasemap = props?.hideBasemap ?? false;
    this.hideNavigationControls = props?.hideNavigationControls ?? false;
    this.hideStyleSwitcher = props?.hideStyleSwitcher ?? false;
    this.hideLegendControl = props?.hideLegendControl ?? false;
  }
}
