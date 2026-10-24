import { BaseVisualizer, Visualizer } from './core';
import { CustomVisualizationTemplate } from './custom-visualization-template.model';
import { escapeHtml,parseTemplateExpressions,sanitizeTemplateHtml,validateTemplateCss } from './template-security';
export type TrackerExpressionEvaluator=(expression:string)=>unknown;
export class CustomVisualizer extends BaseVisualizer implements Visualizer {
  #trackerEvaluator?: TrackerExpressionEvaluator;
  get template(): CustomVisualizationTemplate { if (!this._config?.customTemplate) throw new Error('Template must be provided'); return this._config.customTemplate; }
  setTrackerEvaluator(evaluator: TrackerExpressionEvaluator) { this.#trackerEvaluator=evaluator; return this; }
  private analyticsValue(values: Record<string,string>): number|string {
    const headers=this._data?.headers||[]; const indexes:Record<string,number>={}; for (const key of ['value','ou','dx','pe','co']) indexes[key]=headers.findIndex((h:any)=>h?.name===key);
    const percent=values['dx']?.match(/^PERCENT<([^,<>]+),([^,<>]+)>$/);
    const sum=(target?:string)=>(this._data?.rows||[]).filter((row:string[])=>target?row.includes(target):Object.entries(values).every(([key,value])=>indexes[key]<0||row[indexes[key]]===value)).reduce((total:number,row:string[])=>total+(Number.parseFloat(row[indexes['value']])||0),0);
    if (percent) { const denominator=sum(percent[2]); return denominator===0?'0':((sum(percent[1])/denominator)*100).toFixed(1); } return sum();
  }
  private render(evaluate:(values:Record<string,string>)=>unknown) { const target=document.getElementById(this._id); if (!target) return; let html=this.template.html;
    for (const expression of parseTemplateExpressions(html)) html=html.split(expression.source).join(escapeHtml(evaluate(expression.dimensions)));
    const css=validateTemplateCss(this.template.cssStyles||''); target.replaceChildren(); if(css){const style=document.createElement('style');style.textContent=css;target.appendChild(style);} target.appendChild(sanitizeTemplateHtml(html));
  }
  draw() { if(this._data)this.render(values=>this.analyticsValue(values)); if(this._trackedEntityInstances){if(!this.#trackerEvaluator)throw new Error('A tracker expression evaluator must be provided');this.render(values=>this.#trackerEvaluator?.(values['dx']));} }
}
