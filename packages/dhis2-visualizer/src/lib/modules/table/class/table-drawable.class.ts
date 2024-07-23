import { LegendSet } from "../models/legend-set.model";
import { TableConfiguration } from "../models/table-config.model";
import { TableDashboardItem } from "../models/table-dashboard-item.model";

/**
 * Interface for the table drawable.
 */
export abstract class TableDrawable {
    public useByDataItemLegend = ''
    /**
     * 
     * @param favoriteObject 
     * @param visualizationLayout 
     * @param type 
     */
    public abstract getTableConfiguration(
        favoriteObject: any,
        visualizationLayout: any,
        type: string
    ): TableConfiguration;


    /**
     * 
     * @param favoriteObject 
     * @param favoriteType 
     */
    public abstract checkForEventDataType(
        favoriteObject: any,
        favoriteType: any
    ): boolean;

    /**
     * 
     * @param analyticsObject 
     * @param tableConfiguration 
     * @param legendSets 
     */
    public abstract drawTable(
        analyticsObject: any,
        tableConfiguration: TableConfiguration,
        legendSets: LegendSet[],
        tableDashboardItem: TableDashboardItem
    ): any;

    /**
     * 
     * @param analyticsObjectHeaders 
     * @param name 
     */
    public abstract getTitleIndex(
        analyticsObjectHeaders: any,
        name: string
    ): any;

    /**
     * 
     * @param analyticsObject 
     * @param array 
     * @param item 
     */
    public abstract calculateColSpan(
        analyticsObject: any, array: any, item: any
    ): any;

    /**
     * 
     * @param initialAnalytics 
     * @param itemIdentifier 
     * @param preDefinedItems 
     */
    public abstract prepareSingleCategories(
        initialAnalytics: any,
        itemIdentifier: any,
        preDefinedItems: any
    ): any;

    /**
     * 
     * @param analyticsObject 
     */
    public abstract sanitizeIncomingAnalytics(
        analyticsObject: any
    ): any;


    /**
     * 
     * @param analyticsObject 
     * @param metadataType 
     */
    public abstract getMetadataArray(
        analyticsObject: any, metadataType: string
    ): any;

    /**
     * 
     * @param analyticsObject 
     * @param dataItems 
     */
    public abstract getDataValue(
        analyticsObject: any, dataItems: any
    ): any;

    /**
     * 
     * @param legendItems 
     * @param value 
     */
    public abstract getDataValueColor(
        legendItems: any, value: any
    ): any;

    /**
     * 
     * @param dataItem 
     * @param legendClasses 
     * @param legendSets 
     * @param configuration 
     * @param metaData 
     */
    public abstract getLegendSets(
        dataItem: any,
        legendClasses: any,
        legendSets: any,
        configuration: any,
        metaData: any
    ): any;


    /**
     * 
     * @param stating_length 
     * @param array 
     */
    public abstract checkZeros(
        stating_length: any, array: any
    ): any;
}

