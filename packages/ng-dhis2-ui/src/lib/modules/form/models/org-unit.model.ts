export enum OrgUnitLevel {
    SHEHIA = 'SHEHIA',
    FACILITY = 'FACILITY',
    HAMLET = 'HAMLET',
    STREET = 'STREET',
    WARD = 'WARD',
    COUNCIL = 'COUNCIL',
    REGION = 'REGION',
    NATIONAL = 'NATIONAL',
    VILLAGE = 'VILLAGE',
}

export type OrgUnitLevelKeyword =
    | 'COUNTRY'
    | 'REGION'
    | 'COUNCIL'
    | 'DISTRICT'
    | 'WARD'
    | 'SHEHIA'
    | 'VILLAGE'
    | 'HAMLET'
    | 'FACILITY'
    | 'HOSPITAL'
    | 'HEALTH_CENTRE'
    | 'DISPENSARY'
    | 'CLINIC'
    | 'UNKNOWN';

export type OrgUnitSemanticType =
    | 'COUNTRY'
    | 'REGION'
    | 'COUNCIL'
    | 'DISTRICT'
    | 'WARD'
    | 'SHEHIA'
    | 'VILLAGE'
    | 'HAMLET'
    | 'FACILITY'
    | 'HOSPITAL'
    | 'HEALTH_CENTRE'
    | 'DISPENSARY'
    | 'CLINIC'
    | 'UNKNOWN'
    | string;

export enum LevelSelectorMode {
    RELATIVE = 'relative',
    ABSOLUTE = 'absolute',
    KEYWORD = 'keyword',
}

export enum LevelMatchMode {
    STRICT = 'strict',
    SOFT = 'soft',
}

export interface RelativeLevelSelector {
    mode: LevelSelectorMode.RELATIVE;
    offset: number;
    maxOffset?: number;
}

export interface AbsoluteLevelSelector {
    mode: LevelSelectorMode.ABSOLUTE;
    level: number;
}

export interface KeywordLevelSelector {
    mode: LevelSelectorMode.KEYWORD;
    keyword: string;
}

export type LevelSelector =
    | RelativeLevelSelector
    | AbsoluteLevelSelector
    | KeywordLevelSelector;

export interface OrgUnitTypeKeywordRule {
    type: OrgUnitSemanticType;
    keywords: string[];
    baseConfidence?: number;
}

export interface CustomOrgUnitConfig {
    field: string;
    orgUnit: string;
    levelSelector?: LevelSelector;
    level?: OrgUnitLevel;
    confidence?: number;
    typeRules?: OrgUnitTypeKeywordRule[];
    levelMatchMode?: LevelMatchMode;
}

// START: OrgUnit Implementation
// export interface CustomOrgUnitRootConfig {
//     field: string;
//     orgUnit: string;
//     levelSelector?: LevelSelector;
//     confidence?: number;
// }

export interface CustomOrgUnitRootConfig {
    field: string;
    orgUnit: string;
    levelSelector?: LevelSelector;
    level?: OrgUnitLevel;
    confidence?: number;
    typeRules?: OrgUnitTypeKeywordRule[];
    levelMatchMode?: LevelMatchMode;
}

export interface KeywordLevelMap {
    [keyword: string]: number;
}

export const ORG_UNIT_LEVEL_TO_KEYWORD: Record<
    OrgUnitLevel,
    OrgUnitLevelKeyword
> = {
    [OrgUnitLevel.NATIONAL]: 'COUNTRY',
    [OrgUnitLevel.REGION]: 'REGION',
    [OrgUnitLevel.COUNCIL]: 'COUNCIL',
    [OrgUnitLevel.WARD]: 'WARD',
    [OrgUnitLevel.SHEHIA]: 'SHEHIA',
    [OrgUnitLevel.VILLAGE]: 'VILLAGE',
    [OrgUnitLevel.HAMLET]: 'HAMLET',
    [OrgUnitLevel.FACILITY]: 'FACILITY',
    [OrgUnitLevel.STREET]: 'UNKNOWN',
};

export interface OrgUnitTypeMatch {
    type: OrgUnitSemanticType;
    confidence: number;
}

export const DEFAULT_KEYWORD_TO_LEVEL: KeywordLevelMap = {
    COUNTRY: 1,
    REGION: 2,

    COUNCIL: 3,
    DISTRICT: 3,

    WARD: 4,
    VILLAGE: 5,
    HAMLET: 6,

    SHEHIA: 4,

    FACILITY: 4,
    HOSPITAL: 4,
    HEALTH_CENTRE: 4,
    DISPENSARY: 4,
    CLINIC: 4,

    UNKNOWN: 0,
};

export const FACILITY_KEYWORDS = [
    'Hospital',
    'Dispensary',
    'Health Center',
    'Health Centre',
    'Health Clinic',
    'Health Facility',
    'Health Post',
    'Medical Center',
    'Medical Centre',
    'Polyclinic',
    'Clinic',
    'Facility',
    'Health'
];

export const GLOBAL_TYPE_RULES: OrgUnitTypeKeywordRule[] = [
    {
        type: 'COUNTRY',
        keywords: ['United Republic of Tanzania', 'Tanzania Mainland', 'Tanzania'],
        baseConfidence: 95,
    },
    {
        type: 'REGION',
        keywords: ['Region', 'Mkoa'],
        baseConfidence: 90,
    },
    {
        type: 'COUNCIL',
        keywords: [
            'District Council',
            'Town Council',
            'Municipal Council',
            'City Council',
            'District',
            'Council',
            'Jiji',
            'Manispaa',
        ],
        baseConfidence: 85,
    },
    {
        type: 'DISTRICT',
        keywords: ['District', 'Wilaya'],
        baseConfidence: 80,
    },
    {
        type: 'WARD',
        keywords: ['Ward', 'Kata'],
        baseConfidence: 80,
    },
    {
        type: 'SHEHIA',
        keywords: ['Shehia'],
        baseConfidence: 90,
    },
    {
        type: 'VILLAGE',
        keywords: ['Village', 'Kijiji'],
        baseConfidence: 80,
    },
    {
        type: 'HAMLET',
        keywords: ['Kitongoji', 'Hamlet'],
        baseConfidence: 80,
    },
    {
        type: 'FACILITY',
        keywords: FACILITY_KEYWORDS,
        baseConfidence: 90,
    },
    {
        type: 'HOSPITAL',
        keywords: [
            'Hospital',
            'District Hospital',
            'Regional Hospital',
            'Referral Hospital',
            'Zonal Hospital',
            'National Hospital',
        ],
        baseConfidence: 92,
    },
    {
        type: 'HEALTH_CENTRE',
        keywords: ['Health Center', 'Health Centre'],
        baseConfidence: 91,
    },
    {
        type: 'DISPENSARY',
        keywords: ['Dispensary'],
        baseConfidence: 91,
    },
];

export const LOWERCASE_FACILITY_KEYWORDS = FACILITY_KEYWORDS.map((k) =>
    k.toLowerCase()
);

// export interface CustomOrgUnitConfig {
//     field: string;
//     orgUnit: string;
//     level: OrgUnitLevel;
//     confidence: number;
// }
