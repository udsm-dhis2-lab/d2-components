// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// @flow
import { Provider, useDataQuery } from '@dhis2/app-runtime';
import { colors } from '@dhis2/ui';
import React, {
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDynamicStyles } from '../../../shared';
import { OrganisationUnitTree, CircularLoader, InputField } from '@dhis2/ui';
import { D2Window } from '@iapps/d2-web-sdk';
import { debounce } from 'lodash';
import { Chip } from '@dhis2/ui';
import { Tooltip } from '@dhis2/ui';

const orgUnitFieldStyles = {
  container: {
    border: '1px solid',
    borderColor: colors.grey400,
    borderRadius: '3px',
    height: '100%',
    width: '100%',
    zIndex: 0,
    backgroundColor: 'white',
  },
  searchField: {
    height: '40px',
    overflow: 'hidden',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    boxShadow: 'none',
    border: 'none',
  },
  debounceFieldContainer: {
    padding: '8px',
    background: colors.grey100,
    borderTopLeftRadius: '3px',
    borderTopRightRadius: '3px',
  },
  orgUnitTreeContainer: {
    borderBottomLeftRadius: '3px',
    borderBottomRightRadius: '3px',
    overflow: 'auto',
  },
  orgUnitTreeLoader: {
    padding: '8px',
  },

  orgUnitFieldLabel: {
    marginBottom: '8px',
    display: 'block',
    boxSizing: 'border-box',
    fontSize: '14px',
    lineHeight: '19px',
    color: 'rgb(33, 41, 52)',
    padding: '0',
  },

  orgUnitFieldRequiredLabel: {
    paddingInlineStart: '4px',
  },
};

// type Props = {
//   key: string;
//   label?: string;
//   required?: boolean;
//   onSelectOrgUnit: (selectedOrgUnits: any) => void;
//   onBlur?: (selectedOrgUnit: Record<string, unknown>) => void;
//   selected?: string;
//   maxTreeHeight?: number;
//   disabled?: boolean;
//   customOrgUnitRoots?: string[];
//   previousOrgUnitId?: string;
// };

export type CustomOrgUnitConfig = { field: string; orgUnit: string };

type OrgUnit = {
  id: string;
  name?: string;
  code?: string;
  path: string;
  level: number;
};

type OrgUnitResponse = {
  id: string;
  name?: string;
  displayName?: string;
  code?: string;
  path: string;
  level: number;
};

type Props = {
  key: string;
  label?: string;
  field: string;
  required?: boolean;
  onSelectOrgUnit: (selectedOrgUnits: any) => void;
  onBlur?: (selectedOrgUnit: Record<string, unknown>) => void;
  selected?: string;
  maxTreeHeight?: number;
  disabled?: boolean;
  customOrgUnitRoots?: CustomOrgUnitConfig[];
  previousOrgUnitId?: string;
};

export const OrgUnitFormField = (props: Props) => {
  // const { onSelectOrgUnit, label, required, selected, disabled, key, customOrgUnitRoots } = props;
  // const d2 = (window as unknown as D2Window)?.d2Web;
  // const classes = useDynamicStyles(orgUnitFieldStyles);

  // const config = useMemo(() => {
  //   return d2.systemInfo?.toInitObject();
  // }, []);

  // TODO: Improvements
  const {
    onSelectOrgUnit,
    label,
    required,
    selected,
    disabled,
    key,
    field,
    customOrgUnitRoots,
  } = props;
  const d2 = (window as unknown as D2Window)?.d2Web;
  const classes = useDynamicStyles(orgUnitFieldStyles);

  const config = useMemo(() => d2.systemInfo?.toInitObject(), []);

  // TODO: Improvements
  // New state to hold full orgUnit info from customOrgUnitRoots
  // const [configuredRootInfo, setConfiguredRootInfo] = useState<
  //   { id: string; name: string; code?: string; path: string; level: number }[]
  // >([]);

  const [configuredRootInfo, setConfiguredRootInfo] = useState<OrgUnit[]>([]);
  const [configuredRootsLoading, setConfiguredRootsLoading] = useState(false);

  // Strike-through (fallback) current user roots
  const [useCustomRoots, setUseCustomRoots] = useState(
    customOrgUnitRoots && customOrgUnitRoots.length ? true : false
  );

  // TODO: START | Deprecated Approach that doesn't support passing ID of Organisation Unit as root
  // const rootOrgUnits = useMemo(() => {
  //   return d2.currentUser?.organisationUnits || [];
  // }, []);
  // TODO: END | Deprecated Approach that doesn't support passing ID of Organisation Unit as root

  // TODO: Improvements
  // Fetch matching configured roots on mount or when key changes:
  // useEffect(() => {
  //   const matchList =
  //     customOrgUnitRoots?.filter((entry) => entry.field === (field || key)) ||
  //     [];

  //   if (matchList?.length > 0) {
  //     setUseCustomRoots(true);

  //     Promise.all(
  //       (matchList || []).map((entry) =>
  //         d2.httpInstance
  //           .get(
  //             `organisationUnits/${entry.orgUnit}.json?fields=id,displayName,name,code,path,level`
  //           )
  //           .then((res) => {
  //             const u = res.data as OrgUnitResponse;
  //             return {
  //               id: u.id,
  //               name: u.displayName || u.name,
  //               code: u.code,
  //               path: u.path,
  //               level: u.level,
  //             };
  //           })
  //       )
  //     )
  //       .then(setConfiguredRootInfo)
  //       .catch((err) =>
  //         console.warn(
  //           `[OrgUnitFormField] Failed to fetch customOrgUnitRoots:`,
  //           err
  //         )
  //       );
  //   }
  // }, [customOrgUnitRoots, key, field, d2.httpInstance]);

  useEffect(() => {
    const matchList =
      customOrgUnitRoots?.filter((entry) => entry.field === (field || key)) ||
      [];

    if (matchList.length > 0) {
      setUseCustomRoots(true);
      setConfiguredRootsLoading(true);

      Promise.all(
        matchList.map((entry) =>
          d2.httpInstance
            .get(
              `organisationUnits/${entry.orgUnit}.json?fields=id,displayName,name,code,path,level`
            )
            .then((res) => {
              const orgUnitPayload = res.data as OrgUnitResponse;
              return {
                id: orgUnitPayload?.id,
                name: orgUnitPayload?.displayName || orgUnitPayload?.name,
                code: orgUnitPayload?.code,
                path: orgUnitPayload?.path,
                level: orgUnitPayload.level,
              };
            })
        )
      )
        .then((result) => {
          setConfiguredRootInfo(result);
          setConfiguredRootsLoading(false);
        })
        .catch((err) => {
          console.warn(
            `[OrgUnitFormField] Failed to fetch customOrgUnitRoots:`,
            err
          );
          setConfiguredRootsLoading(false);
        });
    }
  }, [customOrgUnitRoots, key, field, d2.httpInstance]);

  // const rootOrgUnits = useMemo(() => {
  //   if (customOrgUnitRoots && customOrgUnitRoots.length > 0) {
  //     return customOrgUnitRoots.map((id) => ({ id }));
  //   }
  //   return d2.currentUser?.organisationUnits || [];
  // }, [customOrgUnitRoots]);

  // const getExpandedItems = () => {
  //   if (rootOrgUnits && rootOrgUnits.length === 1) {
  //     return [`/${rootOrgUnits[0].id}`];
  //   } else if (rootOrgUnits?.length > 1) {
  //     return rootOrgUnits.map((root) => root.path);
  //   }

  //   return undefined;
  // };

  // TODO: Improvements
  // Decide which roots to render
  // const rootOrgUnits = useMemo(() => {
  //   if (useCustomRoots && configuredRootInfo.length > 0) {
  //     return configuredRootInfo.map((u) => u);
  //   }
  //   return d2.currentUser?.organisationUnits || [];
  // }, [useCustomRoots, configuredRootInfo, d2.currentUser]);

  const rootOrgUnits = useMemo(() => {
    if (useCustomRoots) {
      if (configuredRootsLoading) {
        return [];
      }
      return configuredRootInfo;
    }
    return d2.currentUser?.organisationUnits || [];
  }, [
    useCustomRoots,
    configuredRootsLoading,
    configuredRootInfo,
    d2.currentUser,
  ]);

  const getExpandedItems = () => {
    if (rootOrgUnits && rootOrgUnits.length === 1) {
      return [`/${rootOrgUnits[0].id}`];
    } else if (rootOrgUnits?.length > 1) {
      return rootOrgUnits.map((root) => root.path || `/${root.id}`);
    }
    return undefined;
  };

  const initiallyExpanded = getExpandedItems();
  const [searchText, setSearchText] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>();
  const [searchData, setSearchData] = useState<any>();
  const [selectedOrgUnit, setSelectedOrgUnit] =
    useState<Record<string, unknown>>();
  const [expanded, setExpanded] = useState<any[] | undefined>(
    initiallyExpanded
  );
  const [showOrgUnitTree, setShowOrgUnitTree] = useState<boolean>(!selected);

  useEffect(() => {
    setLoading(true);
    if (selected) {
      d2.httpInstance
        .get(
          `organisationUnits/${selected}.json?fields=id,displayName,path,code,ancestors[id,displayName]`
        )
        .then((response) => {
          if (response.data) {
            setSelectedOrgUnit(response.data);

            handleExpand({ path: response.data['path'] as string });

            setLoading(false);
          }
        });
    } else {
      setShowOrgUnitTree(true);
      setLoading(false);
    }
  }, []);

  const highlighted: string[] | undefined = useMemo(() => {
    if (selectedOrgUnit) {
      return [selectedOrgUnit['path']] as string[];
    }

    return undefined;
  }, [selectedOrgUnit]);

  const selectedOrgUnitLabel: string = useMemo(() => {
    if (selectedOrgUnit) {
      return [
        ...((selectedOrgUnit['ancestors'] as any[]) || []),
        selectedOrgUnit,
      ]
        .map((orgUnit) => orgUnit['displayName'])
        .join(' / ');
    }

    return '';
  }, [selectedOrgUnit]);

  const handleExpand = ({ path }: { path: string }) => {
    if (expanded && !expanded.includes(path)) {
      setExpanded([...expanded, path]);
    }
  };

  const handleCollapse = ({ path }: { path: string }) => {
    const pathIndex = expanded?.indexOf(path);

    if (pathIndex && pathIndex !== -1 && expanded) {
      const updatedExpanded =
        pathIndex === 0
          ? expanded.slice(1)
          : [...expanded.slice(0, pathIndex), ...expanded.slice(pathIndex + 1)];
      setExpanded(updatedExpanded);
    }
  };

  const handleOrgUnitSearch = async (query: string) => {
    setSearchLoading(true);
    try {
      const searchResponse = await d2.httpInstance.get(
        `organisationUnits.json?fields=id,displayName,path,publicAccess,access,lastUpdated,children[id,displayName,publicAccess,access,path,children::isNotEmpty]&paging=true&query=${query}&withinUserSearchHierarchy=true&pageSize=15`
      );
      setSearchData((searchResponse.data || {})['organisationUnits']);
      setSearchLoading(false);
    } catch (e) {
      setSearchLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((value) => {
      handleOrgUnitSearch(value);
    }, 500),
    []
  );

  const handleFilterChange = (event: { value: string }) => {
    setSearchText(event.value);
    debouncedSearch(event.value);
  };

  const ready = useMemo(() => {
    return searchText?.length ? !searchLoading : !loading;
  }, [searchText, searchLoading, loading]);

  const renderOrgUnitTree = () => {
    if (searchText && searchText?.length > 0) {
      if (searchLoading) {
        return (
          <div className={classes.orgUnitTreeLoader}>
            <CircularLoader small />
          </div>
        );
      }

      return (
        ready && (
          <OrganisationUnitTree
            key={`${key}-search`}
            roots={searchData?.map((orgUnit: any) => orgUnit.id) || []}
            singleSelection={true}
            expanded={expanded as any}
            handleExpand={handleExpand}
            handleCollapse={handleCollapse}
            selected={highlighted}
            onChange={(event: any) => {
              setSelectedOrgUnit(event);
              setShowOrgUnitTree(false);
              onSelectOrgUnit(event.id);
            }}
          />
        )
      );
    }
    return (
      rootOrgUnits.length > 0 && (
        <OrganisationUnitTree
          key={key}
          roots={rootOrgUnits?.map((orgUnit) => orgUnit.id) || []}
          singleSelection={true}
          expanded={expanded as any}
          handleExpand={handleExpand}
          handleCollapse={handleCollapse}
          selected={highlighted}
          onChange={(event: any) => {
            setSelectedOrgUnit(event);
            setShowOrgUnitTree(false);
            onSelectOrgUnit(event.id);
          }}
        />
      )
    );
  };

  const handleBlur = () => {
    // onBlur && onBlur(null);
  };

  return (
    config && (
      <Provider
        config={config}
        plugin={false}
        parentAlertsAdd={undefined}
        showAlertsInPlugin={false}
      >
        <div>
          {label && (
            <div className={classes.orgUnitFieldLabel}>
              <span>{label}</span>
              {required ? (
                <span className={classes.orgUnitFieldRequiredLabel}>*</span>
              ) : (
                <></>
              )}
            </div>
          )}

          {!showOrgUnitTree ? (
            selectedOrgUnit ? (
              <>
                <Tooltip content={selectedOrgUnitLabel}>
                  {disabled ? (
                    <Chip>{(selectedOrgUnit as any).displayName}</Chip>
                  ) : (
                    <Chip
                      onRemove={() => {
                        setShowOrgUnitTree(true);
                      }}
                    >
                      {(selectedOrgUnit as any).displayName}
                    </Chip>
                  )}
                </Tooltip>
              </>
            ) : (
              <div className={classes.orgUnitTreeLoader}>
                <CircularLoader small />
              </div>
            )
          ) : (
            <div className={classes.container}>
              <div className={classes.debounceFieldContainer}>
                <InputField
                  placeholder="Search"
                  value={searchText}
                  disabled={disabled}
                  onChange={handleFilterChange}
                />
              </div>
              {loading ? (
                <div className={classes.orgUnitTreeLoader}>
                  <CircularLoader small />
                </div>
              ) : (
                <div
                  className={classes.orgUnitTreeContainer}
                  style={{ maxHeight: '200px', overflowY: 'auto' }}
                >
                  {renderOrgUnitTree()}
                </div>
              )}
            </div>
          )}
        </div>
      </Provider>
    )
  );
};
