// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
export class HeaderBarApp {
  name!: string;
  namespace!: string;
  defaultAction!: string;
  displayName!: string;
  icon!: string;
  description!: string;

  constructor(module: Record<string, unknown>) {
    this.name = module['name'] as string;
    this.namespace = module['namespace'] as string;
    this.defaultAction = this.getPath(module['defaultAction'] as string);
    this.icon = this.getPath(module['icon'] as string);
    this.displayName = module['displayName'] as string;
    this.description = module['description'] as string;
  }

  getPath(item: string) {
    if (item?.startsWith('../')) {
      return '../../' + item;
    }
    return item;
  }
}
