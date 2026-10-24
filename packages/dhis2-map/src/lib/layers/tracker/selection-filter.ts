function quote(value:unknown){return `'${String(value??'').replace(/\\/g,'\\\\').replace(/'/g,"\\'")}'`;}
export class SelectionFilterUtil { static getCustomFilter(selections:any[]=[]){return selections.map(selection=>selection.dimension==='tea'?(selection.items||[]).map((item:any)=>`A<${selection.id}>==${quote(item.code)}`).join('||'):'').filter(Boolean).map(value=>`(${value})`).join('&&');} }
