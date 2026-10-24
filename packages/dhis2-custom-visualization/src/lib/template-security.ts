export type TemplateValidationCode = 'INVALID_TEMPLATE'|'INVALID_EXPRESSION'|'DISALLOWED_ELEMENT'|'DISALLOWED_ATTRIBUTE'|'UNSAFE_URL'|'UNSAFE_CSS';
export class TemplateValidationError extends Error {
  constructor(public readonly code: TemplateValidationCode, message: string) { super(message); this.name = 'TemplateValidationError'; }
}
export interface TemplateExpression { source: string; dimensions: Record<string,string> }
const dimensions = new Set(['dx','pe','ou','co']);
function validateValue(value: string) {
  let depth=0;let balanced=true;for(const character of value){if(character==='<')depth++;else if(character==='>'){depth--;if(depth<0)balanced=false;}}
  if (balanced&&depth===0&&(((value.startsWith('PERCENT<')||value.startsWith('COUNT<enrollment'))&&value.endsWith('>'))||/^[A-Za-z0-9_.-]+$/.test(value))) return;
  throw new TemplateValidationError('INVALID_EXPRESSION', `Unsupported expression value: ${value}`);
}
export function parseTemplateExpressions(template: string): TemplateExpression[] {
  const result: TemplateExpression[] = []; let cursor = 0;
  while (cursor < template.length) {
    const start = template.indexOf('{{', cursor); const stray = template.indexOf('}}', cursor);
    if (stray >= 0 && (start < 0 || stray < start)) throw new TemplateValidationError('INVALID_EXPRESSION','Unexpected expression terminator');
    if (start < 0) break;
    const end = template.indexOf('}}', start + 2); const nested = template.indexOf('{{', start + 2);
    if (end < 0 || nested >= 0 && nested < end) throw new TemplateValidationError('INVALID_EXPRESSION','Unclosed or nested expression');
    const source = template.slice(start,end+2); const values: Record<string,string> = {};
    for (const part of template.slice(start+2,end).split(';')) {
      const colon = part.indexOf(':'); const key = part.slice(0,colon).trim(); const value = part.slice(colon+1).trim();
      if (colon < 1 || !dimensions.has(key) || values[key] || !value) throw new TemplateValidationError('INVALID_EXPRESSION',`Invalid or duplicate dimension: ${key}`);
      validateValue(value); values[key] = value;
    }
    result.push({source,dimensions:values}); cursor=end+2;
  }
  return result;
}
const elements = new Set(['div','span','p','section','article','header','footer','main','h1','h2','h3','h4','h5','h6','strong','em','b','i','small','br','hr','ul','ol','li','table','thead','tbody','tfoot','tr','th','td']);
const attributes = new Set(['class','id','title','role','aria-label','aria-hidden','colspan','rowspan']);
export function sanitizeTemplateHtml(html: string, doc: Document = document): DocumentFragment {
  const parsed = new DOMParser().parseFromString(`<body>${html}</body>`,'text/html');
  for (const element of Array.from(parsed.body.querySelectorAll('*'))) {
    const tag=element.tagName.toLowerCase(); if (!elements.has(tag)) throw new TemplateValidationError('DISALLOWED_ELEMENT',`Element <${tag}> is not allowed`);
    for (const attribute of Array.from(element.attributes)) {
      const name=attribute.name.toLowerCase();
      if (name.startsWith('on')) throw new TemplateValidationError('DISALLOWED_ATTRIBUTE',`Event attribute ${name} is not allowed`);
      if (['href','src','action'].includes(name)) throw new TemplateValidationError('UNSAFE_URL',`URL attribute ${name} is not allowed`);
      if (name==='style'||!attributes.has(name)) throw new TemplateValidationError('DISALLOWED_ATTRIBUTE',`Attribute ${name} is not allowed`);
    }
  }
  const fragment=doc.createDocumentFragment(); for (const child of Array.from(parsed.body.childNodes)) fragment.appendChild(doc.importNode(child,true)); return fragment;
}
const cssProperties=new Set(['color','background-color','font-size','font-weight','font-style','font-family','text-align','line-height','letter-spacing','margin','margin-top','margin-right','margin-bottom','margin-left','padding','padding-top','padding-right','padding-bottom','padding-left','border','border-radius','display','flex','flex-direction','align-items','justify-content','gap','width','height','max-width','min-width','max-height','min-height','overflow','opacity']);
export function validateTemplateCss(css: string): string {
  if (/[<>]/.test(css)||/(?:url|expression)\s*\(|@import|javascript:|data:|behavior\s*:|-moz-binding/i.test(css)) throw new TemplateValidationError('UNSAFE_CSS','CSS contains a forbidden construct');
  const source=css.replace(/\/\*[\s\S]*?\*\//g,''); let consumed=''; const rule=/([^{}]+)\{([^{}]*)\}/g; let match: RegExpExecArray|null;
  while ((match=rule.exec(source))) { consumed+=match[0]; if (!/^[\s.#a-zA-Z0-9_,>+~:*-]+$/.test(match[1])) throw new TemplateValidationError('UNSAFE_CSS',`Invalid selector: ${match[1].trim()}`);
    for (const declaration of match[2].split(';').map(v=>v.trim()).filter(Boolean)) { const colon=declaration.indexOf(':'); const property=declaration.slice(0,colon).trim().toLowerCase(); const value=declaration.slice(colon+1).trim(); if (colon<1||!cssProperties.has(property)||!value||/[{}]/.test(value)) throw new TemplateValidationError('UNSAFE_CSS',`CSS declaration is not allowed: ${declaration}`); }
  }
  if (source.replace(/\s/g,'')!==consumed.replace(/\s/g,'')) throw new TemplateValidationError('UNSAFE_CSS','Malformed CSS'); return css;
}
export function escapeHtml(value: unknown): string { return String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
