// field-cascade.util.ts

import {
  CascadeKind,
  CascadeConfigMap,
  DEFAULT_OPTIONS_PATH_CASCADE,
  FieldId,
  OptionPathField,
  OptionsPathCascadeConfig,
  ParentMatchMode,
  ParentValueType,
} from '../types/field-cascade.types';

export class FieldCascadeUtil {
  static buildConfigByChildFieldId(
    configs: readonly OptionsPathCascadeConfig[]
  ): CascadeConfigMap {
    const map: Record<FieldId, OptionsPathCascadeConfig> = Object.create(null);

    for (let i = 0; i < (configs?.length ?? 0); i += 1) {
      const cfg = configs[i];
      if (!cfg?.fieldId) continue;
      map[cfg.fieldId as FieldId] = cfg;
    }

    return Object.freeze(map) as CascadeConfigMap;
  }

  static normalizePath(raw: unknown, separator = '/'): string {
    const input = String(raw ?? '').trim();
    if (!input) return '';

    if (!input.includes(separator + separator) && !input.endsWith(separator)) {
      return input;
    }

    let out = '';
    let prevWasSep = false;

    for (let i = 0; i < input.length; i += 1) {
      const ch = input[i];
      const isSep = ch === separator;

      if (isSep) {
        if (!prevWasSep) out += ch;
        prevWasSep = true;
      } else {
        out += ch;
        prevWasSep = false;
      }
    }

    if (out === separator) return separator;
    return out.endsWith(separator) ? out.slice(0, -1) : out;
  }

  static getPathLeaf(raw: unknown, separator = '/'): string {
    const normalized = FieldCascadeUtil.normalizePath(raw, separator);
    if (!normalized) return '';

    const parts = normalized.split(separator).filter(Boolean);
    return parts.length ? parts[parts.length - 1] : normalized;
  }

  static containsLeafToken(
    childPath: string,
    parentLeaf: string,
    separator = '/'
  ): boolean {
    if (!childPath || !parentLeaf) return false;

    const token = `${separator}${parentLeaf}`;
    return (
      childPath.endsWith(token) || childPath.includes(token + separator)
    );
  }

  /**
   * Safe property getter for "unknown object shapes" (keeps TS happy).
   */
  static getProp(obj: object, key: string): unknown {
    return (obj as Record<string, unknown>)[key];
  }

  /**
   * Reads the child option path from configured field (code/id) and normalizes it.
   * Works with any option object type (including interfaces without index signatures).
   */
  static getChildOptionPath(
    option: object,
    pathField: OptionPathField,
    separator = '/'
  ): string {
    const raw = FieldCascadeUtil.getProp(option, pathField);
    return FieldCascadeUtil.normalizePath(raw, separator);
  }

  static getParentEffectiveValue(
    merged: typeof DEFAULT_OPTIONS_PATH_CASCADE & Partial<OptionsPathCascadeConfig>,
    parentValue: string | null | undefined
  ): string {
    const raw = String(parentValue ?? '').trim();
    if (!raw) return '';

    if (merged.parentValueType === ParentValueType.ID) {
      return raw;
    }

    return FieldCascadeUtil.normalizePath(raw, merged.optionPathSeparator);
  }

  static matchesChildToParent(
    childPathRaw: string,
    parentEffectiveRaw: string,
    mode: ParentMatchMode,
    separator = '/'
  ): boolean {
    const childPath = FieldCascadeUtil.normalizePath(childPathRaw, separator);
    const parentEffective = FieldCascadeUtil.normalizePath(
      parentEffectiveRaw,
      separator
    );

    if (!childPath || !parentEffective) return false;

    switch (mode) {
      case ParentMatchMode.PREFIX: {
        // Allow exact node match and boundary-safe prefix
        if (childPath === parentEffective) return true;

        const prefix = parentEffective.endsWith(separator)
          ? parentEffective
          : parentEffective + separator;

        return childPath.startsWith(prefix);
      }

      default: {
        const leaf = FieldCascadeUtil.getPathLeaf(parentEffective, separator);
        return FieldCascadeUtil.containsLeafToken(childPath, leaf, separator);
      }
    }
  }

  static shouldDisableChildField(
    cascade: OptionsPathCascadeConfig | undefined,
    parentValue: string | null | undefined
  ): boolean {
    if (!cascade || cascade.kind !== CascadeKind.OPTIONS_PATH) return false;

    const merged = { ...DEFAULT_OPTIONS_PATH_CASCADE, ...cascade };

    if (!merged.disableUntilParentSelected) return false;

    const parentEffective = FieldCascadeUtil.getParentEffectiveValue(
      merged,
      parentValue
    );

    if (!parentEffective) return true;

    if (merged.parentValueType === ParentValueType.CODE) {
      return (
        FieldCascadeUtil.getPathLeaf(parentEffective, merged.optionPathSeparator)
          .length === 0
      );
    }

    return false;
  }

  static filterChildOptionsByParentPath<TOption extends object>(
    childOptions: readonly TOption[],
    cascade: OptionsPathCascadeConfig | undefined,
    parentValue: string | null | undefined
  ): TOption[] {
    if (!cascade || cascade.kind !== CascadeKind.OPTIONS_PATH) {
      return (childOptions ?? []) as TOption[];
    }

    const merged = { ...DEFAULT_OPTIONS_PATH_CASCADE, ...cascade };

    const parentEffective = FieldCascadeUtil.getParentEffectiveValue(
      merged,
      parentValue
    );

    if (!parentEffective) {
      return merged.allowAllIfParentMissing
        ? ((childOptions ?? []) as TOption[])
        : [];
    }

    const out: TOption[] = [];
    const sep = merged.optionPathSeparator;
    const mode = merged.parentMatchMode;
    const pathField = merged.childPathField;

    for (let i = 0; i < (childOptions?.length ?? 0); i += 1) {
      const opt = childOptions[i];
      const childPath = FieldCascadeUtil.getChildOptionPath(opt, pathField, sep);
      if (!childPath) continue;

      if (
        FieldCascadeUtil.matchesChildToParent(
          childPath,
          parentEffective,
          mode,
          sep
        )
      ) {
        out.push(opt);
      }
    }

    return out;
  }

  static filterOptionsByCascade(
    options: readonly any[],
    config: OptionsPathCascadeConfig | undefined,
    parentValue: string | null | undefined
  ): any[] {
    if (!config || config.kind !== CascadeKind.OPTIONS_PATH) {
      return [...(options ?? [])];
    }

    const merged = { ...DEFAULT_OPTIONS_PATH_CASCADE, ...config };

    const parentEffective = FieldCascadeUtil.getParentEffectiveValue(
      merged,
      parentValue
    );

    if (!parentEffective) {
      return merged.allowAllIfParentMissing ? [...(options ?? [])] : [];
    }

    const sep = merged.optionPathSeparator;

    return (options ?? []).filter((opt: any) => {
      const childPath = FieldCascadeUtil.getChildOptionPath(
        (opt ?? {}) as object,
        merged.childPathField,
        sep
      );

      return (
        !!childPath &&
        FieldCascadeUtil.matchesChildToParent(
          childPath,
          parentEffective,
          merged.parentMatchMode,
          sep
        )
      );
    });
  }
}
