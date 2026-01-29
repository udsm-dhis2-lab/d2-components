// field-cascade.types.ts

/**
 * Domain primitive types
 * ----------------------
 * These are semantic aliases over primitives.
 * They improve readability, safety, and intent.
 */

/**
 * Identifier of a form field.
 *
 * - Runtime type: string
 * - Semantic meaning: "ID of a field in the form schema"
 */
export type FieldId = string;

/**
 * Cascade types for form fields.
 *
 * Supports configuration-driven "cascading" behaviors such as:
 * - Filtering dropdown options based on the selected value of another field
 *   (e.g., path codes like "/Zanzibar/Unguja/...").
 *
 * This file intentionally contains:
 * - enums
 * - interfaces / types
 * - defaults
 *
 * Runtime logic belongs in: field-cascade.util.ts
 */

/** Discriminator for all cascade configuration kinds */
export enum CascadeKind {
  OPTIONS_PATH = 'OPTIONS_PATH',
  // Future:
  // ORG_UNIT_PATH = 'ORG_UNIT_PATH',
  // OPTIONS_MAPPING = 'OPTIONS_MAPPING',
}

/**
 * Strategy used to match the parent value against child option "path".
 *
 * Notes:
 * - PREFIX: true "under this parent path" match. Best when parent value is a full path prefix.
 * - LEAF_TOKEN: token-safe "includes" match (recommended for DHIS2-ish paths). Matches:
 *      child endsWith("/<leaf>") OR child contains("/<leaf>/")
 * - CONTAINS: raw substring match anywhere (least strict; can produce false positives).
 * - EXACT: exact path match.
 */
export enum ParentMatchMode {
  PREFIX = 'PREFIX',
  LEAF_TOKEN = 'LEAF_TOKEN',
  CONTAINS = 'CONTAINS',
  EXACT = 'EXACT',
}

/** Where to read the child option path from */
export enum OptionPathField {
  CODE = 'code',
  ID = 'id',
  VALUE = 'value'
}

/** What is stored in the parent field control value */
export enum ParentValueType {
  CODE = 'CODE',
  ID = 'ID',
}

/**
 * Base shape for any cascade config.
 * The `fieldId` indicates which field is affected (child).
 */
export interface CascadeConfigBase {
  /** Discriminator */
  kind: CascadeKind;

  /** The field whose options/value will be affected (child field) */
  fieldId: FieldId;

  /** The field whose value drives the cascade (parent field) */
  parentFieldId: FieldId;

  /**
   * If true, child field should be disabled until parent has a value.
   * Default: true
   */
  disableUntilParentSelected?: boolean;

  /**
   * If true, child field should be cleared whenever parent changes.
   * Default: true
   */
  clearOnParentChange?: boolean;

  /**
   * If true, show all child options when parent is missing.
   * If false, show none.
   * Default: false
   */
  allowAllIfParentMissing?: boolean;
}

/**
 * Cascade config for dropdown-like fields where child options include the parent path.
 * Example:
 *   parent value: "/UNSNiNqkzEM"
 *   child option: "/UNSNiNqkzEM/l9kxy7vLv6t"
 */
export interface OptionsPathCascadeConfig extends CascadeConfigBase {
  kind: CascadeKind.OPTIONS_PATH;

  /**
   * Separator used to interpret path strings.
   * Default: "/"
   */
  optionPathSeparator?: string;

  /**
   * How we match parent against child.
   * Default: LEAF_TOKEN (token-safe "includes" recommended for DHIS2-ish paths)
   */
  parentMatchMode?: ParentMatchMode;

  /**
   * Which property on the option contains the path.
   * Default: code
   */
  childPathField?: OptionPathField;

  /**
   * What is stored in the parent field's value.
   * Default: CODE
   */
  parentValueType?: ParentValueType;
}

/** Discriminated union of all supported cascade configs */
export type CascadeConfig = OptionsPathCascadeConfig;

/** Form-level configuration as an array */
export type CascadeConfigList = ReadonlyArray<CascadeConfig>;

/** Optional: fast lookup map by child fieldId */
export type CascadeConfigMap = Readonly<Record<FieldId, CascadeConfig>>;

/**
 * Centralized defaults for OPTIONS_PATH
 * (keep defaults here, merge in util).
 */
export const DEFAULT_OPTIONS_PATH_CASCADE: Required<
  Pick<
    OptionsPathCascadeConfig,
    | 'optionPathSeparator'
    | 'parentMatchMode'
    | 'childPathField'
    | 'parentValueType'
    | 'disableUntilParentSelected'
    | 'clearOnParentChange'
    | 'allowAllIfParentMissing'
  >
> = {
  optionPathSeparator: '/',
  parentMatchMode: ParentMatchMode.LEAF_TOKEN, // ✅ token-safe "includes"
  childPathField: OptionPathField.CODE,
  parentValueType: ParentValueType.CODE,
  disableUntilParentSelected: true,
  clearOnParentChange: true,
  allowAllIfParentMissing: false,
};

export type OptionsPathCascadeConfigMap = Readonly<
  Record<FieldId, OptionsPathCascadeConfig>
>;
