export interface DashboardAccess {
  read: boolean;
  update: boolean;
  externalize: boolean;
  delete: boolean;
  write: boolean;
  manage: boolean;
}

export interface SharingAccess {
  owner: string;
  userGroups: {
    [key: string]: AccessItem;
  };
  external: boolean;
  public: string;
  users: {
    [key: string]: AccessItem;
  };
}

export interface AccessItem {
  displayName: string;
  access: string;
  id: string;
}
