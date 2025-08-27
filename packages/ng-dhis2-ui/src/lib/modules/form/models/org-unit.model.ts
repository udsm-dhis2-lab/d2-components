export enum OrgUnitLevel {
    FACILITY = "FACILITY",
    HAMLET = "HAMLET",
    STREET = "STREET",
    WARD = "WARD",
    COUNCIL = "COUNCIL",
    REGION = "REGION",
    NATIONAL = "NATIONAL",
}

export interface CustomOrgUnitConfig {
    field: string;
    orgUnit: string;
    level: OrgUnitLevel;
    confidence: number;
}