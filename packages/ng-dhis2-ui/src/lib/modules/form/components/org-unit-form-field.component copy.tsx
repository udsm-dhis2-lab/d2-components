// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// @flow
import { Provider } from '@dhis2/app-runtime';
import { colors } from '@dhis2/ui';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDynamicStyles } from '../../../shared';
import { OrganisationUnitTree, CircularLoader, InputField } from '@dhis2/ui';
import { D2Window } from '@iapps/d2-web-sdk';
import { debounce } from 'lodash';
import { Chip } from '@dhis2/ui';
import { Tooltip } from '@dhis2/ui';
import {
  CustomOrgUnitConfig,
  CustomOrgUnitRootConfig,
  DEFAULT_KEYWORD_TO_LEVEL,
  KeywordLevelMap,
  LevelMatchMode,
  LevelSelector,
  LevelSelectorMode,
  ORG_UNIT_LEVEL_TO_KEYWORD,
  OrgUnitLevel,
  OrgUnitSemanticType,
  OrgUnitTypeKeywordRule,
} from '../models/org-unit.model';

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

type OrgUnit = {
  id: string;
  name: string;
  displayName?: string;
  code?: string;
  path: string;
  type?: string;
  confidence?: number;
  level: number;
  children: OrgUnitResponse[];
  ancestors: OrgUnitResponse[];
};

type OrgUnitResponse = {
  id: string;
  name: string;
  displayName?: string;
  code?: string;
  path: string;
  level: number;
  children: OrgUnitResponse[];
  ancestors: OrgUnitResponse[];
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

// function resolveTargetLevels(
//   rootLevel: number,
//   levelSelector: LevelSelector | undefined,
//   keywordToLevel: KeywordLevelMap = DEFAULT_KEYWORD_TO_LEVEL
// ): number[] {
//   if (!levelSelector) {
//     return [rootLevel + 1];
//   }

//   if (levelSelector.mode === 'relative') {
//     const { offset, maxOffset } = levelSelector;

//     if (offset <= 0) {
//       return [];
//     }

//     const start = rootLevel + offset;
//     const end = maxOffset && maxOffset > offset ? rootLevel + maxOffset : start;

//     const levels: number[] = [];
//     for (let level = start; level <= end; level += 1) {
//       levels.push(level);
//     }
//     return levels;
//   }

//   if (levelSelector.mode === 'absolute') {
//     return [levelSelector.level];
//   }

//   if (levelSelector.mode === 'keyword') {
//     const numeric = keywordToLevel[levelSelector.keyword];
//     return numeric ? [numeric] : [];
//   }

//   return [];
// }

function resolveTargetLevels(
  rootLevel: number,
  levelSelector: LevelSelector | undefined,
  keywordToLevel: KeywordLevelMap = DEFAULT_KEYWORD_TO_LEVEL
): number[] {
  if (!levelSelector) {
    return [rootLevel + 1];
  }

  switch (levelSelector.mode) {
    case LevelSelectorMode.RELATIVE: {
      const { offset, maxOffset } = levelSelector;

      if (offset <= 0) {
        return [];
      }

      const start = rootLevel + offset;
      const end =
        maxOffset && maxOffset > offset ? rootLevel + maxOffset : start;

      const levels: number[] = [];
      for (let level = start; level <= end; level += 1) {
        levels.push(level);
      }
      return levels;
    }

    case LevelSelectorMode.ABSOLUTE:
      return [levelSelector.level];

    case LevelSelectorMode.KEYWORD: {
      const numeric = keywordToLevel[levelSelector.keyword];
      return numeric ? [numeric] : [];
    }

    default:
      return [];
  }
}

function filterOrgUnitsByLevels(
  orgUnits: readonly OrgUnit[] | null | undefined,
  allowedLevels: readonly number[] | null | undefined
): OrgUnit[] {
  if (
    !orgUnits ||
    orgUnits.length === 0 ||
    !allowedLevels ||
    allowedLevels.length === 0
  ) {
    return [];
  }

  const allowedLevelSet = new Set<number>(allowedLevels);
  const filteredOrgUnits: OrgUnit[] = [];

  for (let i = 0; i < orgUnits.length; i++) {
    const orgUnit = orgUnits[i];
    if (!orgUnit || typeof orgUnit.level !== 'number') {
      continue;
    }

    if (!allowedLevelSet.has(orgUnit.level)) {
      continue;
    }

    const { children, ancestors, ...flatData } = orgUnit;

    filteredOrgUnits.push({
      ...flatData,
      children: [],
      ancestors: [],
    });
  }

  return filteredOrgUnits;
}

const normalize = (value: string): string =>
  value.normalize('NFKC').trim().toLowerCase();

const resolveOrgUnitTypeFromConfig = (
  config?: CustomOrgUnitConfig
): OrgUnitSemanticType => {
  if (!config) return 'UNKNOWN';
  if (config.level) return config.level;
  if (config.levelSelector?.mode === 'keyword') {
    return config.levelSelector.keyword;
  }
  return 'UNKNOWN';
};

// export const getOrgUnitTypeMatch = (
//   name: string,
//   config?: CustomOrgUnitConfig
// ): { type: OrgUnitSemanticType; confidence: number } | null => {
//   if (!name) return null;

//   const cleanedName = normalize(name);
//   if (cleanedName.length < 3) return null;

//   const rules: OrgUnitTypeKeywordRule[] = [
//     ...(config?.typeRules ?? []),
//     // ...GLOBAL_TYPE_RULES,
//   ];

//   let bestMatch: { type: OrgUnitSemanticType; confidence: number } | null =
//     null;

//   for (const rule of rules) {
//     const lowerKeywords = rule.keywords.map((k) => k.toLowerCase());

//     const matched = lowerKeywords.some((kw) => cleanedName.includes(kw));

//     if (!matched) continue;

//     const base = rule.baseConfidence ?? config?.confidence ?? 0;

//     if (!bestMatch || base > bestMatch.confidence) {
//       bestMatch = {
//         type: rule.type,
//         confidence: base,
//       };
//     }
//   }

//   if (!bestMatch) {
//     const levelType = resolveOrgUnitTypeFromConfig(config);
//     if (levelType !== 'UNKNOWN') {
//       return {
//         type: levelType,
//         confidence: config?.confidence ?? 0,
//       };
//     }
//   }

//   return bestMatch;
// };

export const getOrgUnitTypeMatch = (
  orgUnit: OrgUnit,
  config?: CustomOrgUnitConfig | CustomOrgUnitRootConfig
): { type: OrgUnitSemanticType; confidence: number } | null => {
  const rawName = orgUnit.displayName || orgUnit.name || '';
  if (!rawName) return null;

  const cleanedName = normalize(rawName);
  if (cleanedName.length < 3) return null;

  const rules: OrgUnitTypeKeywordRule[] = [
    ...(config?.typeRules ?? []),
    // You can re-enable global rules if desired:
    // ...GLOBAL_TYPE_RULES,
  ];

  const minConfidence = config?.confidence ?? 0;
  const levelMatchMode = config?.levelMatchMode ?? LevelMatchMode.SOFT;

  const semanticLevel = config?.level;
  const strictNumericLevel = semanticLevel
    ? getNumericLevelForSemanticLevel(semanticLevel)
    : undefined;

  let bestMatch: { type: OrgUnitSemanticType; confidence: number } | null =
    null;

  for (const rule of rules) {
    const lowerKeywords = rule.keywords.map((k) => k.toLowerCase());
    const matched = lowerKeywords.some((kw) => cleanedName.includes(kw));
    if (!matched) continue;

    // ----- LEVEL HANDLING -----
    if (
      typeof strictNumericLevel === 'number' &&
      typeof orgUnit.level === 'number'
    ) {
      const sameLevel = orgUnit.level === strictNumericLevel;

      if (levelMatchMode === LevelMatchMode.STRICT && !sameLevel) {
        // hard reject this candidate
        continue;
      }
      // for SOFT we adjust confidence below
    }

    // Base confidence: rule > config > default
    let confidence = rule.baseConfidence ?? config?.confidence ?? 80;

    // Small bump if multiple keywords match
    const keywordHits = lowerKeywords.filter((kw) =>
      cleanedName.includes(kw)
    ).length;
    confidence += Math.min(keywordHits - 1, 3) * 2;

    // Soft mode: prefer same level but don't require it
    if (
      levelMatchMode === LevelMatchMode.SOFT &&
      typeof strictNumericLevel === 'number' &&
      typeof orgUnit.level === 'number'
    ) {
      if (orgUnit.level === strictNumericLevel) {
        confidence += 5; // nice, level matches
      } else {
        confidence = Math.max(confidence - 5, 0); // still allowed, just a bit lower
      }
    }

    if (confidence < minConfidence) continue;

    if (!bestMatch || confidence > bestMatch.confidence) {
      bestMatch = {
        type: rule.type,
        confidence,
      };
    }
  }

  // Fallback: use level / keyword-based semantic type
  if (!bestMatch) {
    const levelType = resolveOrgUnitTypeFromConfig(config);
    if (levelType !== 'UNKNOWN') {
      return {
        type: levelType,
        confidence: config?.confidence ?? 0,
      };
    }
  }

  return bestMatch;
};

// export const getFacilityMatch = (
//   name: string,
//   config?: CustomOrgUnitConfig
// ): { type: OrgUnitSemanticType | 'UNKNOWN'; confidence: number } | null => {
//   const match = getOrgUnitTypeMatch(name, config);

//   if (!match || match.type !== 'FACILITY') {
//     return null;
//   }

//   return match;
// };

export const getFacilityMatch = (
  orgUnit: OrgUnit,
  config?: CustomOrgUnitConfig | CustomOrgUnitRootConfig
): { type: OrgUnitSemanticType | 'UNKNOWN'; confidence: number } | null => {
  const match = getOrgUnitTypeMatch(orgUnit, config);

  if (!match || match.type !== 'FACILITY') {
    return null;
  }

  return match;
};

export const flattenChildren = (
  rootUnits: OrgUnitResponse[]
): OrgUnitResponse[] => {
  const result: OrgUnitResponse[] = [];
  const stack: OrgUnitResponse[] = [...rootUnits];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    result.push(current);

    if (Array.isArray(current.children) && current.children.length > 0) {
      stack.push(...current.children);
    }
  }

  return result;
};

export const buildReadableFullName = (unit: OrgUnitResponse): string => {
  const ancestors = (unit.ancestors || [])
    .map((a) => a.displayName?.trim())
    .filter(Boolean);

  const currentName = (unit.displayName || unit.name || '').trim();

  const pathParts: string[] = [];
  for (const name of [...ancestors, currentName]) {
    if (name && name !== pathParts[pathParts.length - 1]) {
      pathParts.push(name);
    }
  }

  return pathParts.join(' / ');
};

function getNumericLevelForSemanticLevel(
  level: OrgUnitLevel,
  keywordToLevel: KeywordLevelMap = DEFAULT_KEYWORD_TO_LEVEL
): number | undefined {
  const keyword = ORG_UNIT_LEVEL_TO_KEYWORD[level];
  return keyword ? keywordToLevel[keyword] : undefined;
}

export const OrgUnitFormField = (props: Props) => {
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

  const [configuredRootInfo, setConfiguredRootInfo] = useState<OrgUnit[]>([]);
  const [configuredRootsLoading, setConfiguredRootsLoading] = useState(false);

  const [useCustomRoots, setUseCustomRoots] = useState(
    customOrgUnitRoots && customOrgUnitRoots.length ? true : false
  );

  type RootData = {
    rootOrgUnit: OrgUnitResponse;
    descendants: OrgUnitResponse[];
  };

  const ORGUNIT_ROOT_CACHE = new Map<string, RootData>();

  useEffect(() => {
    if (!customOrgUnitRoots || !customOrgUnitRoots.length) {
      return;
    }

    const fieldKey = field || key;

    const matchingConfigs =
      customOrgUnitRoots.filter((entry) => entry.field === fieldKey) || [];

    if (!matchingConfigs.length) {
      return;
    }

    let isCancelled = false;

    setUseCustomRoots(true);
    setConfiguredRootsLoading(true);

    const fetchOrgUnitsForConfig = async (
      orgUnitConfig: CustomOrgUnitRootConfig
    ): Promise<OrgUnit[]> => {
      try {
        if (isCancelled) {
          return [];
        }

        const baseFields =
          'id,displayName,name,code,path,level,ancestors[displayName]';

        let rootData = ORGUNIT_ROOT_CACHE.get(orgUnitConfig.orgUnit);

        if (!rootData) {
          const rootUrl =
            `organisationUnits/${orgUnitConfig.orgUnit}.json` +
            `?fields=${encodeURIComponent(baseFields)}` +
            `&paging=false`;

          const rootResponse = await d2.httpInstance.get(rootUrl);
          if (isCancelled) return [];

          const rootOrgUnit = rootResponse.data as OrgUnitResponse;

          const descendantsUrl =
            'organisationUnits.json' +
            `?paging=false` +
            `&fields=${encodeURIComponent(baseFields)}` +
            `&filter=path:like:${encodeURIComponent(rootOrgUnit.path + '/')}`;

          const descendantsResponse = await d2.httpInstance.get(descendantsUrl);
          if (isCancelled) return [];

          const descendantsData = descendantsResponse?.data as
            | { organisationUnits?: OrgUnitResponse[] }
            | undefined;

          const descendants: OrgUnitResponse[] =
            descendantsData?.organisationUnits ?? [];

          rootData = { rootOrgUnit, descendants };
          ORGUNIT_ROOT_CACHE.set(orgUnitConfig.orgUnit, rootData);
        }

        const { rootOrgUnit, descendants } = rootData;

        const allDescendants: OrgUnitResponse[] = [rootOrgUnit, ...descendants];

        const targetLevels = resolveTargetLevels(
          rootOrgUnit.level,
          orgUnitConfig.levelSelector
        );

        const hasLevelFilter =
          Array.isArray(targetLevels) && targetLevels.length > 0;

        const isStrict = orgUnitConfig.levelMatchMode === LevelMatchMode.STRICT;

        const baseCandidates: OrgUnit[] =
          hasLevelFilter && isStrict
            ? filterOrgUnitsByLevels(allDescendants, targetLevels)
            : allDescendants;

        type CandidateWithMatch = {
          orgUnit: OrgUnit;
          match: { type: string; confidence: number } | null;
        };

        const candidatesWithMatches: CandidateWithMatch[] = baseCandidates.map(
          (orgUnit) => {
            const match = getOrgUnitTypeMatch(orgUnit, orgUnitConfig);
            return { orgUnit, match };
          }
        );

        const hasKeywordMatch = candidatesWithMatches.some(
          (c) => c.match !== null
        );

        if (isStrict && !hasLevelFilter && !hasKeywordMatch) {
          const rootWithMeta: OrgUnit = {
            ...rootOrgUnit,
            type: 'UNKNOWN',
            confidence: 0,
            children: [],
            ancestors: [],
          } as OrgUnit;

          return [rootWithMeta];
        }

        const effectiveCandidates: CandidateWithMatch[] = hasKeywordMatch
          ? candidatesWithMatches.filter((c) => c.match !== null)
          : candidatesWithMatches;

        const flatOrgUnits: OrgUnit[] = effectiveCandidates.map(
          ({ orgUnit, match }) => ({
            id: orgUnit.id,
            name: buildReadableFullName(orgUnit),
            code: orgUnit.code,
            path: orgUnit.path,
            level: orgUnit.level,
            type: match?.type ?? 'UNKNOWN',
            confidence: match?.confidence ?? 0,
            children: [],
            ancestors: [],
          })
        );

        flatOrgUnits.sort((a, b) => {
          const confA = a.confidence ?? 0;
          const confB = b.confidence ?? 0;

          if (confB !== confA) return confB - confA;
          return a.name.localeCompare(b.name);
        });

        return flatOrgUnits;
      } catch (error) {
        console.warn(
          `[OrgUnitFormField] Failed to fetch orgUnit ${orgUnitConfig.orgUnit}:`,
          error
        );
        return [];
      }
    };

    Promise.allSettled(matchingConfigs.map(fetchOrgUnitsForConfig))
      .then((settledResults) => {
        if (isCancelled) return;

        const allOrgUnits = settledResults
          .filter(
            (result): result is PromiseFulfilledResult<OrgUnit[]> =>
              result.status === 'fulfilled'
          )
          .flatMap((result) => result.value);

        setConfiguredRootInfo(allOrgUnits);
        setConfiguredRootsLoading(false);
      })
      .catch((unexpectedError) => {
        if (isCancelled) return;

        console.warn(
          `[OrgUnitFormField] Unexpected error while resolving custom roots:`,
          unexpectedError
        );
        setConfiguredRootsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [customOrgUnitRoots, key, field, d2.httpInstance]);

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
