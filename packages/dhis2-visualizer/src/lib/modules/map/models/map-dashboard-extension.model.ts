export interface MapDashboardExtensionItem {
    id: string;
    type: string;
    height: number;
    width: number;
    x: number;
    y: number;
    favorite: boolean;
    map: MapExtension;
}

export interface MapExtension {
    id: string;
    name: string;
    displayName: string;
    basemap: string;
    displayFormName: string;
    favorite: boolean;
    mapViews: MapViewExtension[];
}

export interface MapViewExtension {
    id: string;
    name: string;
    sortOrder: number;
    favorite: boolean;
    displayName: string;
    layer: string;
    hideTitle: boolean;
    opacity: number;
    displayFormName: string;
    thematicMapType: string;
    hideSubtitle: boolean;
    legendSet: LegendSetExtension;
    dataDimensionItems: DataDimensionItemExtension[];
}

export interface DataDimensionItemExtension {
    dataDimensionItemType: string;
    indicator: LegendSetExtension;
}

export interface LegendSetExtension {
    id: string;
}
