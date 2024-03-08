export interface LegendSet {
    created: string;
    lastUpdated: string;
    name: string;
    href: string;
    id: string;
    displayName: string;
    publicAccess: string;
    sharing: LegendSetSharing;
    externalAccess: boolean;
    favorite: boolean;
    lastUpdatedBy: CreatedBy;
    access: Access;
    createdBy: CreatedBy;
    user: CreatedBy;
    favorites: any[];
    userGroupAccesses: any[];
    attributeValues: any[];
    legends: Legend[];
    translations: any[];
    userAccesses: any[];
}

export interface Access {
    read: boolean;
    update: boolean;
    externalize: boolean;
    delete: boolean;
    write: boolean;
    manage: boolean;
}

export interface CreatedBy {
    displayName: string;
    name: string;
    id: string;
    username: string;
}

export interface Legend {
    lastUpdated: string;
    id: string;
    created: string;
    name: string;
    endValue: number;
    color: string;
    displayName: string;
    externalAccess: boolean;
    startValue: number;
    sharing: LegendSharing;
    favorite: boolean;
    access: Access;
    favorites: any[];
    translations: any[];
    userGroupAccesses: any[];
    attributeValues: any[];
    userAccesses: any[];
    itemCount?: number;
}

export interface LegendSharing {
    external: boolean;
    users: any;
    userGroups: any;
}

export interface LegendSetSharing {
    owner: string;
    external: boolean;
    users: any;
    userGroups: any;
    public: string;
}
