import { DEFAULT_SETTINGS, DEFAULT_OPTIONS } from './config';

export interface Mapping { id:string; source:string; secondary:string; noteContains:string; target:string }
export interface SummaryGroup { id:string; name:string; members:string[]; color:string }
export interface Settings { version:2; mappings:Mapping[]; categoryOrder:string[]; groups:SummaryGroup[]; colors:Record<string,string> }
export interface Bill { row:number; id:string; date:string; time:string; category:string; secondary:string; note:string; cents:number; currency:string }
export interface Entry extends Bill { mapped:string }
export interface DailyCategory { mapped:string; cents:number; count:number }
export interface Report {
  entries:Entry[];
  days:{date:string; entries:DailyCategory[]; cents:number; count:number}[];
  summaries:{id:string; name:string; members:string[]; color:string; cents:number}[];
  otherCents:number; totalCents:number; detailCount:number;
}
export const freshSettings=():Settings=>structuredClone(DEFAULT_SETTINGS);
export function colorFor(settings:Settings,category:string):string {
  if(Object.hasOwn(settings.colors,category))return settings.colors[category];
  return settings.groups.find(g=>g.members.includes(category))?.color||DEFAULT_OPTIONS.fallbackColor;
}
export function parseMoney(value:unknown):number {
  const text=String(value??'').trim();
  if(!/^-?\d+(\.\d{1,2})?$/.test(text))throw new Error('金额必须是最多两位小数的数字');
  const negative=text.startsWith('-');const [whole,fraction='']=text.replace(/^-/,'').split('.');
  const cents=Number(whole)*100+Number(fraction.padEnd(2,'0'));
  if(!Number.isSafeInteger(cents))throw new Error('金额超出可计算范围');
  return negative?-cents:cents;
}
export function validDate(date:string):boolean {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return false;
  const d=new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===date;
}
export function mappedCategory(bill:Bill,settings:Settings):string {
  const matches=settings.mappings.filter(m=>m.source===bill.category&&(!m.secondary||m.secondary===bill.secondary)&&(!m.noteContains||bill.note.includes(m.noteContains)));
  const score=(m:Mapping)=>(m.noteContains?2:0)+(m.secondary?1:0);
  const priority=Math.max(-1,...matches.map(score));const best=matches.filter(m=>score(m)===priority);
  if(new Set(best.map(m=>m.target)).size>1)throw new Error(`第 ${bill.row} 行：备注映射规则冲突（${best.map(m=>m.target).join('、')}），请修改规则`);
  return best[0]?.target||bill.secondary||bill.category;
}
function text(value:unknown,label:string,optional=false):string {
  if(typeof value!=='string'||(!optional&&!value.trim()))throw new Error(`${label}不能为空且必须为文本`);
  if(value.length>DEFAULT_OPTIONS.maxCategoryLength)throw new Error(`${label}不能超过 ${DEFAULT_OPTIONS.maxCategoryLength} 个字符`);
  return value.trim();
}
function names(value:unknown,label:string):string[]{
  if(!Array.isArray(value))throw new Error(`${label}格式不正确`);
  const result=value.map(v=>text(v,label));if(new Set(result).size!==result.length)throw new Error(`${label}不能重复`);return result;
}
function validColor(value:unknown):value is string{return typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value)}
export function validateSettings(value:unknown):Settings {
  const raw=value as Record<string,unknown>;
  if(!raw||typeof raw!=='object'||raw.version!==2||!Array.isArray(raw.mappings)||!raw.colors||typeof raw.colors!=='object'||Array.isArray(raw.colors))throw new Error('设置文件格式不正确，仅支持版本 2');
  const keys=new Set<string>();const ids=new Set<string>();
  const mappings:Mapping[]=raw.mappings.map((item,i)=>{
    if(!item||typeof item!=='object')throw new Error('映射格式不正确');
    const m=item as Record<string,unknown>;const rule={id:typeof m.id==='string'&&m.id?m.id:`rule-${i}`,source:text(m.source,'原始分类'),secondary:text(m.secondary,'二级分类',true),noteContains:text(m.noteContains,'备注条件',true),target:text(m.target,'映射类别')};
    if(ids.has(rule.id))throw new Error('映射规则标识重复');ids.add(rule.id);
    const key=JSON.stringify([rule.source,rule.secondary,rule.noteContains]);if(keys.has(key))throw new Error('同一条件存在重复映射，请保留一条规则');keys.add(key);return rule;
  });
  const colors:Record<string,string>={};
  for(const [key,color] of Object.entries(raw.colors)){const category=text(key,'颜色类别');if(!validColor(color))throw new Error('类别颜色格式不正确');Object.defineProperty(colors,category,{value:color,enumerable:true,writable:true,configurable:true})}
    const categoryOrder=names(raw.categoryOrder,'明细顺序');if(!Array.isArray(raw.groups))throw new Error('汇总组格式不正确');
    const groupNames=new Set<string>(),groupIds=new Set<string>(),members=new Set<string>();
    const groups=raw.groups.map((item,i)=>{
      if(!item||typeof item!=='object')throw new Error('汇总组格式不正确');const g=item as Record<string,unknown>;
      const group={id:typeof g.id==='string'&&g.id?g.id:`group-${i}`,name:text(g.name,'汇总组名称'),members:names(g.members,'汇总成员'),color:g.color as string};
      if(!validColor(group.color))throw new Error('汇总组颜色格式不正确');
      if(groupNames.has(group.name)||groupIds.has(group.id))throw new Error('汇总组名称或标识不能重复');groupNames.add(group.name);groupIds.add(group.id);
      for(const member of group.members){if(members.has(member))throw new Error(`“${member}”只能属于一个汇总组`);members.add(member)}return group;
    });
  return {version:2,mappings,categoryOrder,groups,colors};
}
/** 保留已保存顺序，新类别插在默认车辆类别前。冲突交由报表提示。 */
export function discoverCategories(bills:Bill[],settings:Settings):string[]{
  const result=[...settings.categoryOrder];
  const add=(category:string)=>{if(result.includes(category))return;const index=result.indexOf(DEFAULT_OPTIONS.newCategoryBefore);result.splice(index<0?result.length:index,0,category)};
  [...settings.mappings.map(m=>m.target),...settings.groups.flatMap(g=>g.members),...Object.keys(settings.colors)].forEach(add);
  for(const b of [...bills].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)||a.row-b.row)){
    let category:string;try{category=mappedCategory(b,settings)}catch{continue}
    add(category);
  }
  return result;
}
export function normalizeCategoryOrder(bills:Bill[],settings:Settings):Settings{return {...settings,categoryOrder:discoverCategories(bills,settings)}}
export function assignGroup(settings:Settings,category:string,groupId:string):Settings {
  return {...settings,groups:settings.groups.map(g=>({...g,members:g.id===groupId?[...g.members.filter(c=>c!==category),category]:g.members.filter(c=>c!==category)}))};
}
const safe=(cents:number)=>{if(!Number.isSafeInteger(cents))throw new Error('合计超出可计算范围');return cents};
export function makeReport(bills:Bill[],start:string,end:string,settings:Settings):Report {
  if(!validDate(start)||!validDate(end))throw new Error('请选择完整的开始和结束日期');if(start>end)throw new Error('开始日期不能晚于结束日期');
  const s=validateSettings(settings);
  const entries=bills.filter(b=>b.date>=start&&b.date<=end).map(b=>({...b,mapped:mappedCategory(b,s)})).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)||a.row-b.row);
  const foreign=entries.filter(b=>b.currency!==DEFAULT_OPTIONS.currency);
  if(foreign.length)throw new Error(`第 ${foreign.map(b=>b.row).join('、')} 行为非人民币记录（${[...new Set(foreign.map(b=>b.currency||'未填写币种'))].join('、')}），请调整范围后导出`);
  const order=discoverCategories(entries,s);const ranks=new Map(order.map((c,i)=>[c,i]));
  const totals=new Map<string,number>();const daily=new Map<string,Map<string,DailyCategory>>();let totalCents=0;
  for(const e of entries){
    const categories=daily.get(e.date)||new Map<string,DailyCategory>();daily.set(e.date,categories);
    const category=categories.get(e.mapped)||{mapped:e.mapped,cents:0,count:0};category.cents=safe(category.cents+e.cents);category.count++;categories.set(e.mapped,category);
    totalCents=safe(totalCents+e.cents);totals.set(e.mapped,safe((totals.get(e.mapped)||0)+e.cents));
  }
  const days=[...daily].map(([date,categories])=>{
    const items=[...categories.values()].sort((a,b)=>(ranks.get(a.mapped)??Infinity)-(ranks.get(b.mapped)??Infinity));
    return {date,entries:items,cents:items.reduce((a,e)=>safe(a+e.cents),0),count:items.reduce((a,e)=>a+e.count,0)};
  });
  const summaries=s.groups.map(g=>({...g,cents:g.members.reduce((a,c)=>safe(a+(totals.get(c)||0)),0)}));
  const grouped=new Set(s.groups.flatMap(g=>g.members));
  const otherCents=[...totals].filter(([c])=>!grouped.has(c)).reduce((a,[,cents])=>safe(a+cents),0);
  return {entries,days,summaries,otherCents,totalCents,detailCount:days.reduce((a,d)=>a+d.entries.length,0)};
}
export const money=(cents:number)=>(cents/100).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});
/** 自定义名称替换文件系统不允许的字符，统一追加一个 XLSX 后缀。 */
export function reportFileName(name:string):string {
  const fallback=DEFAULT_OPTIONS.reportFilePrefix;
  const cleaned=name.trim().replace(/(?:\.xlsx)+$/i,'').replace(/[<>:"/\\|?*\u0000-\u001f]/g,'_').replace(/[. ]+$/,'').slice(0,DEFAULT_OPTIONS.maxReportFileNameLength).replace(/[. ]+$/,'');
  const safeName=cleaned||fallback;
  return `${/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(safeName)?`_${safeName}`:safeName}.xlsx`;
}
