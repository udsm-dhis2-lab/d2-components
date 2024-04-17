export interface IndicatorsState {
    indicators: any;
}


export interface AllIndicatorsState {
    indicators: any;
    progressLoadingValue: number;
}

export interface IndicatorPropertiesState {
    indicators: {
        "lastUpdated": any;
        "id": string;
        "href": string;
        "created": any;
        "name": string;
        "shortName": string;
        "displayName": string;
        "publicAccess": string;
        "displayShortName": string;
        "externalAccess": boolean;
        "denominatorDescription": string;
        "numeratorDescription": string;
        "dimensionItem": string;
        "denominator": string;
        "numerator": string;
        "annualized": boolean;
        "decimals": number;
        "favorite": boolean
        "dimensionItemType": string;
        "access": any;
        "indicatorType": any;
        "lastUpdatedBy": any;
        "user": any;
        "favorites": any;
        "translations": any;
        "userGroupAccesses": any;
        "attributeValues": any;
        "indicatorGroups": any;
        "userAccesses": any;
        "dataSets": any,
        "legendSets": any
    } 
}

export interface IndicatorGroupsState {
    indicatorGroups: any;
}
