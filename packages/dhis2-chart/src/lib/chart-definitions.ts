import { ChartModel } from './chart-model';
import { ChartFamily, drawChartFamily } from './chart/helpers/draw-chart.helper';
import { LegacyChartConfiguration } from './legacy-chart-configuration';
import { resolveStacking } from './chart/transforms/presentation.transforms';
import { chartCapabilities, validateChartCapabilities } from './chart-capabilities';
import { buildScatterChartModel } from './scatter-chart.model';

export type StandardChartType =
  | 'COLUMN' | 'BAR' | 'LINE' | 'DOTTED' | 'STACKED_COLUMN'
  | 'STACKED_BAR' | 'AREA' | 'STACKED_AREA' | 'PIE' | 'RADAR' | 'SOLIDGAUGE';

export interface ChartBuildContext {
  readonly analytics: unknown;
  readonly configuration: LegacyChartConfiguration;
  /** Original object retains legacy prototype getters used by the helper. */
  readonly source?: unknown;
}

/** Policies return a fresh configuration; they never mutate caller input. */
export interface ChartPolicy {
  readonly name: string;
  apply(configuration: Readonly<Record<string, unknown>>): Readonly<Record<string, unknown>>;
}

export interface ChartDefinition<T extends string = string> {
  readonly type: T;
  readonly family: ChartFamily;
  build(context: ChartBuildContext): ChartModel;
}

export abstract class AbstractChartDefinition<T extends string = string>
  implements ChartDefinition<T> {
  abstract readonly type: T;
  abstract readonly family: ChartFamily;
  protected readonly policies: readonly ChartPolicy[] = [];

  build(context: ChartBuildContext): ChartModel {
    if (context.configuration.type.toUpperCase() !== this.type.toUpperCase()) {
      throw new Error(`Chart definition ${this.type} cannot build ${context.configuration.type}`);
    }
    const source = context.source && typeof context.source === 'object'
      ? context.source as Record<string, unknown> : context.configuration.native;
    validateChartCapabilities(this.type, source);
    const prepared = source['cumulativeValues'] === true && Array.isArray(source['yAxisType'])
      ? { ...source, yAxisType: context.configuration.yAxisType } : source;
    const configuration = this.policies.reduce<Readonly<Record<string, unknown>>>(
      (current, policy) => policy.apply(current), prepared
    );
    return drawChartFamily(context.analytics, configuration, this.family);
  }
}

/** Variants are configuration policies, not overrides of the render lifecycle. */
export class ConfigurationPolicy implements ChartPolicy {
  constructor(
    readonly name: string,
    private readonly configure: (configuration: Readonly<Record<string, unknown>>) => Readonly<Record<string, unknown>>
  ) {}
  apply(configuration: Readonly<Record<string, unknown>>) {
    return this.configure(configuration);
  }
}

function withOverrides(configuration: Readonly<Record<string, unknown>>, overrides: Record<string, unknown>) {
  return Object.assign(Object.create(Object.getPrototypeOf(configuration)), configuration, overrides);
}

export const stackingPolicy = new ConfigurationPolicy('stacking', config => withOverrides(config, {
  __resolvedStacking: resolveStacking({
    type: config['type'] as string,
    percentStackedValues: config['__percentStacking'] === true || config['percentStackedValues'] === true,
  }),
}));
export const percentStackingPolicy = new ConfigurationPolicy('percent-stacking', config =>
  withOverrides(config, { __percentStacking: config['percentStackedValues'] === true }));
export const lineStylePolicy = new ConfigurationPolicy('line-style', config =>
  withOverrides(config, { __dottedLine: true }));
export const missingValuePolicy = new ConfigurationPolicy('missing-values', config =>
  withOverrides(config, { __pieNullAsZero: true }));

export abstract class CartesianChartDefinition<T extends string = string> extends AbstractChartDefinition<T> {
  readonly family = 'cartesian' as const;
}
export abstract class CircularChartDefinition<T extends string = string> extends AbstractChartDefinition<T> {
  readonly family = 'circular' as const;
}
export abstract class PolarChartDefinition<T extends string = string> extends AbstractChartDefinition<T> {
  readonly family = 'polar' as const;
}
export abstract class GaugeChartDefinition<T extends string = string> extends AbstractChartDefinition<T> {
  readonly family = 'gauge' as const;
}

export class ColumnDefinition extends CartesianChartDefinition<'COLUMN'> { readonly type = 'COLUMN' as const; }
export class BarDefinition extends CartesianChartDefinition<'BAR'> { readonly type = 'BAR' as const; }
export class LineDefinition extends CartesianChartDefinition<'LINE'> { readonly type = 'LINE' as const; }
export class DottedDefinition extends CartesianChartDefinition<'DOTTED'> { readonly type = 'DOTTED' as const; protected override readonly policies = [lineStylePolicy]; }
export class StackedColumnDefinition extends CartesianChartDefinition<'STACKED_COLUMN'> { readonly type = 'STACKED_COLUMN' as const; protected override readonly policies = [percentStackingPolicy, stackingPolicy]; }
export class StackedBarDefinition extends CartesianChartDefinition<'STACKED_BAR'> { readonly type = 'STACKED_BAR' as const; protected override readonly policies = [percentStackingPolicy, stackingPolicy]; }
export class AreaDefinition extends CartesianChartDefinition<'AREA'> { readonly type = 'AREA' as const; }
export class StackedAreaDefinition extends CartesianChartDefinition<'STACKED_AREA'> { readonly type = 'STACKED_AREA' as const; protected override readonly policies = [percentStackingPolicy, stackingPolicy]; }
export class PieDefinition extends CircularChartDefinition<'PIE'> { readonly type = 'PIE' as const; protected override readonly policies = [missingValuePolicy]; }
export class RadarDefinition extends PolarChartDefinition<'RADAR'> { readonly type = 'RADAR' as const; }
export class SolidGaugeDefinition extends GaugeChartDefinition<'SOLIDGAUGE'> { readonly type = 'SOLIDGAUGE' as const; }
export class ScatterDefinition extends CartesianChartDefinition<'SCATTER'> {
  readonly type = 'SCATTER' as const;
  override build(context: ChartBuildContext): ChartModel {
    return buildScatterChartModel(context);
  }
}
/** Existing raw configuration spelling, retained for direct consumers. */
export class LegacyGaugeDefinition extends GaugeChartDefinition<'GAUGE'> { readonly type = 'GAUGE' as const; }

export class ChartDefinitionRegistry {
  private readonly definitions = new Map<string, ChartDefinition>();
  constructor(definitions: readonly ChartDefinition[] = []) {
    definitions.forEach(definition => this.register(definition));
  }
  register(definition: ChartDefinition): this {
    const type = definition.type?.toUpperCase();
    if (!type || type !== definition.type || !/^[A-Z][A-Z0-9_]*$/.test(type)) {
      throw new Error('Chart definition type must be a canonical uppercase identifier');
    }
    if (this.definitions.has(type)) throw new Error(`Duplicate chart definition: ${type}`);
    this.definitions.set(type, definition);
    return this;
  }
  resolve(type: string): ChartDefinition {
    const definition = this.definitions.get(type.toUpperCase());
    if (!definition) throw new Error(`Unsupported chart definition: ${type}`);
    return definition;
  }
  list(): readonly string[] { return [...this.definitions.keys()]; }
  capabilities(type: string) {
    this.resolve(type);
    return chartCapabilities.filter(entry => entry.types.includes(type.toUpperCase()));
  }
}

export function createStandardChartRegistry(): ChartDefinitionRegistry {
  return new ChartDefinitionRegistry([
    new ColumnDefinition(), new BarDefinition(), new LineDefinition(),
    new DottedDefinition(), new StackedColumnDefinition(), new StackedBarDefinition(),
    new AreaDefinition(), new StackedAreaDefinition(), new PieDefinition(), new RadarDefinition(), new SolidGaugeDefinition(),
    new LegacyGaugeDefinition(),
    new ScatterDefinition(),
  ]);
}

export const standardChartRegistry = createStandardChartRegistry();
