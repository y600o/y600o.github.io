import React, {useEffect,useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {useRegisterSW} from 'virtual:pwa-register/react';
import {readBills,exportWorkbook} from './excel';
import {type Bill,type Settings,type SummaryGroup,freshSettings,validateSettings,makeReport,parseMoney,money,colorFor,discoverCategories,normalizeCategoryOrder,assignGroup,reportFileName} from './model';
import {DEFAULT_OPTIONS} from './config';
import './style.css';
import './groups.css';

function loadSettings():Settings {
  try{const raw=localStorage.getItem(DEFAULT_OPTIONS.storageKey);return raw?validateSettings(JSON.parse(raw)):freshSettings()}catch{return freshSettings()}
}
function download(blob:Blob,name:string){
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
function OrderButtons({label,index,total,onMove}:{label:string;index:number;total:number;onMove:(direction:number)=>void}){
  return <div className="actions"><button className="text-button" aria-label={`${label}上移`} disabled={index===0} onClick={()=>onMove(-1)}>上移</button><button className="text-button" aria-label={`${label}下移`} disabled={index===total-1} onClick={()=>onMove(1)}>下移</button></div>;
}
function GroupEditor({group,index,total,onChange,onDelete,onMove}:{group:SummaryGroup;index:number;total:number;onChange:(group:SummaryGroup)=>void;onDelete:()=>void;onMove:(direction:number)=>void}){
  const [name,setName]=useState(group.name);useEffect(()=>setName(group.name),[group.name]);
  return <div className="group-card">
    <form className="group-name-form" onSubmit={e=>{e.preventDefault();onChange({...group,name:name.trim()})}}>
      <label>汇总组名称<input aria-label={`${group.name}组名称`} value={name} maxLength={DEFAULT_OPTIONS.maxCategoryLength} onChange={e=>setName(e.target.value)} required/></label>
      <button type="submit" className="secondary-button" disabled={name.trim()===group.name}>保存名称</button>
    </form>
    <div className="group-card-actions"><label className="group-color">文字颜色<input aria-label={`${group.name}组文字颜色`} type="color" value={group.color} onChange={e=>onChange({...group,color:e.target.value})}/></label><OrderButtons label={`${group.name}汇总组`} index={index} total={total} onMove={onMove}/><button className="text-button muted" onClick={onDelete}>删除组</button></div>
    <p className="hint">成员：{group.members.length?group.members.join('、'):'暂无，请在下方分配类别'}</p>
  </div>;
}
function App(){
  const [settings,setSettings]=useState(loadSettings);
  const [bills,setBills]=useState<Bill[]>([]);const [filename,setFilename]=useState('');
  const [outputName,setOutputName]=useState('');
  const [stats,setStats]=useState({rowCount:0,excluded:0});const [start,setStart]=useState('');const [end,setEnd]=useState('');
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [notice,setNotice]=useState('');
  const [budgetEnabled,setBudgetEnabled]=useState(DEFAULT_OPTIONS.budgetEnabled);const [budget,setBudget]=useState(DEFAULT_OPTIONS.budget);
  const [source,setSource]=useState('');const [secondary,setSecondary]=useState('');const [noteContains,setNoteContains]=useState('');const [target,setTarget]=useState('');
  const [editing,setEditing]=useState<string|null>(null);const [categoryDraft,setCategoryDraft]=useState('');const [groupDraft,setGroupDraft]=useState('');
  const [resetConfirm,setResetConfirm]=useState(false);const [cached,setCached]=useState(false);
  const {offlineReady:[offlineReady],needRefresh:[needRefresh],updateServiceWorker}=useRegisterSW({onRegisteredSW(_url,registration){if(registration?.active)setCached(true)},onRegisterError(){setNotice('离线缓存暂未完成，请联网重新打开页面。')}});
  // 只保存配置，不持久保存账单。
  useEffect(()=>{try{localStorage.setItem(DEFAULT_OPTIONS.storageKey,JSON.stringify(settings))}catch{setNotice('本机存储不可用，请导出设置备份。')}},[settings]);
  function save(next:Settings){
    try{const valid=validateSettings(next);setSettings(normalizeCategoryOrder(bills,valid));setError('')}catch(e){setError((e as Error).message)}
  }
  const result=useMemo(()=>{if(!filename)return {report:null,error:''};try{return {report:makeReport(bills,start,end,settings),error:''}}catch(e){return {report:null,error:(e as Error).message}}},[bills,start,end,settings,filename]);
  const categories=useMemo(()=>discoverCategories(bills,settings),[bills,settings]);
  const sources=[...new Set(bills.map(b=>b.category))];const secondaries=[...new Set(bills.filter(b=>b.category===source).map(b=>b.secondary).filter(Boolean))];
  let budgetCents:number|undefined;let budgetError='';
  if(budgetEnabled){try{budgetCents=parseMoney(budget);if(budgetCents<0)budgetError='预算不能小于零'}catch{budgetError='请输入非负预算，最多两位小数'}}
  const report=result.report;
  function clearMapping(){setSource('');setSecondary('');setNoteContains('');setTarget('');setEditing(null)}
  function move<T>(items:T[],index:number,direction:number):T[]{const next=[...items];[next[index],next[index+direction]]=[next[index+direction],next[index]];return next}
  async function importFile(file:File){
    setError('');setNotice('');setBusy(true);setBills([]);setFilename('');setStats({rowCount:0,excluded:0});setStart('');setEnd('');
    try{
      if(!file.name.toLowerCase().endsWith('.xlsx'))throw new Error('请选择 .xlsx 文件');
      if(file.size>DEFAULT_OPTIONS.maxBillFileBytes)throw new Error(`文件超过 ${DEFAULT_OPTIONS.maxBillFileBytes/1024/1024} MB，请精简后重试`);
      const data=await readBills(await file.arrayBuffer());setBills(data.bills);setStats(data);setFilename(file.name);
      setSettings(prev=>normalizeCategoryOrder(data.bills,prev));
      const dates=data.bills.map(b=>b.date).sort();setStart(dates[0]||'');setEnd(dates.at(-1)||'');
      if(!data.bills.length)setNotice('文件已读取，没有“类型＝报销”的记录。');
    }catch(e){setError((e as Error).message)}finally{setBusy(false)}
  }
  function submitMapping(e:React.FormEvent){
    e.preventDefault();const rule={id:editing||crypto.randomUUID(),source:source.trim(),secondary:secondary.trim(),noteContains:noteContains.trim(),target:target.trim()};
    const next={...settings,mappings:editing?settings.mappings.map(m=>m.id===editing?rule:m):[...settings.mappings,rule]};
    try{validateSettings(next);save(next);clearMapping()}catch(e){setError((e as Error).message)}
  }
  async function restoreSettings(file:File){
    try{if(file.size>DEFAULT_OPTIONS.maxSettingsFileBytes)throw new Error('设置文件过大');const next=validateSettings(JSON.parse(await file.text()));save(next);setNotice('设置已恢复（版本 2）');clearMapping();setResetConfirm(false)}catch(e){setError(`无法恢复设置：${(e as Error).message}`)}
  }
  function resetSettings(){save(freshSettings());setBudgetEnabled(DEFAULT_OPTIONS.budgetEnabled);setBudget(DEFAULT_OPTIONS.budget);clearMapping();setCategoryDraft('');setGroupDraft('');setResetConfirm(false);setNotice('已恢复代码中的默认设置')}
  async function exportFile(){
    if(!report?.entries.length||budgetError)return;setBusy(true);setError('');
    try{download(await exportWorkbook(report,settings,budgetEnabled?budgetCents:undefined),reportFileName(outputName));setNotice('Excel 已生成。在 iPhone 上可从下载列表打开，并通过分享存入“文件”。')}catch(e){setError((e as Error).message)}finally{setBusy(false)}
  }
  return <><header className="topbar"><div className="nav"><a className="brand" href="#"><img src={`${import.meta.env.BASE_URL}icon.svg`} alt=""/><span>出差报表</span></a><span className="nav-note">钱迹账单转换</span><a href="/tools/">返回工具箱</a></div></header>
    <main>
      <div className="page-heading"><div><p className="eyebrow">TRAVEL EXPENSES</p><h1>把账单整理成出差报表</h1></div><span className="status">{offlineReady||cached?'可离线使用':'账单仅在本机处理'}</span></div>
      <aside className="intro">仅统计钱迹中“类型＝报销”的记录，收入和个人支出不计入。同一天同类别自动合并。导入文件不会上传，关闭页面后需重新导入。</aside>
      {needRefresh&&<div className="message">有新版本。请先导出当前报表，再更新页面。<button onClick={()=>updateServiceWorker(true)}>更新</button></div>}
      {error&&<div role="alert" className="message error">{error}</div>}{notice&&<div role="status" className="message">{notice}</div>}
      <div className="workspace"><div className="controls">
        <section className="panel"><div className="section-heading"><span className="step">01</span><h2>账单与日期</h2></div>
          <label className={`upload ${busy?'disabled':''}`}><span className="upload-icon">＋</span><strong>{busy?'正在处理…':filename||'选择钱迹导出的账单'}</strong><span>点击选择 .xlsx 文件，最大 {DEFAULT_OPTIONS.maxBillFileBytes/1024/1024} MB</span><input aria-label="导入钱迹账单" type="file" accept=".xlsx" disabled={busy} onChange={e=>{const f=e.target.files?.[0];if(f)void importFile(f);e.target.value=''}}/></label>
          {filename&&<p className="metadata">已读取 {stats.rowCount} 笔 · 报销 {bills.length} 笔 · 排除 {stats.excluded} 笔收入及个人支出</p>}
          <div className="two-fields"><label>开始日期<input type="date" value={start} disabled={!bills.length||busy} onChange={e=>setStart(e.target.value)}/></label><label>结束日期<input type="date" value={end} disabled={!bills.length||busy} onChange={e=>setEnd(e.target.value)}/></label></div><p className="hint">包含开始和结束日期当天的所有报销。</p>
        </section>
        <section className="panel"><div className="section-heading"><span className="step">02</span><h2>类别映射与明细顺序</h2></div>
          <p className="hint">车辆写在备注中时，为每辆车添加“备注包含”规则。二级分类和备注都留空时匹配整个一级分类。</p>
          <div className="rules">{settings.mappings.map(m=><div className="rule" key={m.id}><div><span className="rule-source">{m.source}{m.secondary&&` / ${m.secondary}`}{m.noteContains&&` · 备注包含“${m.noteContains}”`}</span><strong>{m.target}</strong></div><div className="actions"><button className="text-button" onClick={()=>{setEditing(m.id);setSource(m.source);setSecondary(m.secondary);setNoteContains(m.noteContains);setTarget(m.target)}}>编辑</button><button className="text-button muted" onClick={()=>{save({...settings,mappings:settings.mappings.filter(x=>x.id!==m.id)});if(editing===m.id)clearMapping()}}>删除</button></div></div>)}</div>
          <form onSubmit={submitMapping} className="mapping-form">
            <div className="two-fields"><label>原始一级分类<input list="source-options" value={source} onChange={e=>{setSource(e.target.value);setSecondary('')}} placeholder="例如：汽车/加油" required maxLength={DEFAULT_OPTIONS.maxCategoryLength}/></label><label>原始二级分类 <span className="optional">可选</span><input list="secondary-options" value={secondary} onChange={e=>setSecondary(e.target.value)} placeholder="例如：过路费" maxLength={DEFAULT_OPTIONS.maxCategoryLength}/></label></div>
            <datalist id="source-options">{sources.map(s=><option key={s} value={s}/>)}</datalist><datalist id="secondary-options">{secondaries.map(s=><option key={s} value={s}/>)}</datalist>
            <label>备注包含 <span className="optional">可选</span><input value={noteContains} onChange={e=>setNoteContains(e.target.value)} placeholder="例如：一号车" maxLength={DEFAULT_OPTIONS.maxCategoryLength}/></label>
            <label>映射后的类别<input list="target-options" value={target} onChange={e=>setTarget(e.target.value)} placeholder="例如：一号车加油" required maxLength={DEFAULT_OPTIONS.maxCategoryLength}/></label><datalist id="target-options">{categories.map(c=><option key={c} value={c}/>)}</datalist>
            <div className="actions"><button className="secondary-button" type="submit">{editing?'保存修改':'添加映射'}</button>{editing&&<button type="button" className="text-button" onClick={clearMapping}>取消编辑</button>}</div>
          </form>
          <details className="rule-help"><summary>规则优先级</summary><p className="hint">二级分类＋备注条件优先，其次为仅备注条件、仅二级分类、仅一级分类。同优先级规则同时匹配到不同目标时，会提示冲突并停止导出。</p></details>
          <div className="summary-order"><p className="label-title">明细类别顺序</p><p className="hint">每天按此顺序排列，同一天同类别金额合并为一条。</p>
            {categories.map((c,i)=><div className="order-row" key={c}><span>{i+1}. {c}</span><OrderButtons label={`${c}明细`} index={i} total={categories.length} onMove={d=>save({...settings,categoryOrder:move(categories,i,d)})}/></div>)}
            <div className="add-category"><input aria-label="新增类别名称" value={categoryDraft} placeholder="新增类别，例如住宿" maxLength={DEFAULT_OPTIONS.maxCategoryLength} onChange={e=>setCategoryDraft(e.target.value)}/><button className="secondary-button" disabled={!categoryDraft.trim()} onClick={()=>{const c=categoryDraft.trim();if(!categories.includes(c)){const order=[...categories];const index=order.indexOf(DEFAULT_OPTIONS.newCategoryBefore);order.splice(index<0?order.length:index,0,c);save({...settings,categoryOrder:order})}setCategoryDraft('')}}>添加</button></div>
          </div>
        </section>
        <section className="panel"><div className="section-heading"><span className="step">03</span><h2>颜色与汇总组</h2></div>
          <p className="hint">把各车辆的加油类别分配到“加油”组，过路费分配到“过路费”组。未归组类别计入“其他花费”。</p>
          <div className="groups">{settings.groups.map((g,i)=><GroupEditor key={g.id} group={g} index={i} total={settings.groups.length} onChange={next=>save({...settings,groups:settings.groups.map(x=>x.id===next.id?next:x)})} onDelete={()=>save({...settings,groups:settings.groups.filter(x=>x.id!==g.id)})} onMove={d=>save({...settings,groups:move(settings.groups,i,d)})}/>)}</div>
          <form className="add-category" onSubmit={e=>{e.preventDefault();const name=groupDraft.trim();const next={...settings,groups:[...settings.groups,{id:crypto.randomUUID(),name,members:[],color:DEFAULT_OPTIONS.fallbackColor}]};try{validateSettings(next);save(next);setGroupDraft('')}catch(e){setError((e as Error).message)}}}><input aria-label="新增汇总组名称" value={groupDraft} onChange={e=>setGroupDraft(e.target.value)} placeholder="新增汇总组，例如住宿" maxLength={DEFAULT_OPTIONS.maxCategoryLength}/><button className="secondary-button" type="submit" disabled={!groupDraft.trim()}>添加组</button></form>
          <p className="label-title">类别归组与文字颜色</p><p className="hint">每个类别只属于一个组。颜色默认继承组，可单独覆盖。</p>
          {categories.map(c=>{const group=settings.groups.find(g=>g.members.includes(c));const override=Object.hasOwn(settings.colors,c);return <div className="category-assignment" key={c}><div className="assignment-title"><span>{c}</span><div className="color-control"><input type="color" aria-label={`${c}文字颜色`} value={colorFor(settings,c)} onChange={e=>save({...settings,colors:{...settings.colors,[c]:e.target.value}})}/><span>{colorFor(settings,c)}</span></div></div><div className="assignment-controls"><select aria-label={`${c}所属汇总组`} value={group?.id||''} onChange={e=>save(assignGroup(settings,c,e.target.value))}><option value="">其他花费（未归组）</option>{settings.groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select>{override?<button className="text-button" onClick={()=>{const colors={...settings.colors};delete colors[c];save({...settings,colors})}}>恢复继承</button>:<span className="color-mode">{group?'继承组颜色':'默认颜色'}</span>}</div></div>})}
        </section>
        <section className="panel"><div className="section-heading"><span className="step">04</span><h2>预算与结余</h2></div><label className="check-label"><input type="checkbox" checked={budgetEnabled} onChange={e=>setBudgetEnabled(e.target.checked)}/>计算结余</label>{budgetEnabled&&<label className="budget-field">出差预算（元）<input type="text" inputMode="decimal" value={budget} onChange={e=>setBudget(e.target.value)} placeholder="例如：8000.00"/>{budgetError&&<span className="field-error">{budgetError}</span>}</label>}</section>
        <div className="settings-tools"><button className="text-button" onClick={()=>download(new Blob([JSON.stringify(settings,null,2)],{type:'application/json'}),DEFAULT_OPTIONS.settingsFileName)}>导出设置</button><label className="file-button">恢复设置<input aria-label="恢复设置文件" type="file" accept=".json,application/json" onChange={e=>{const f=e.target.files?.[0];if(f)void restoreSettings(f);e.target.value=''}}/></label><button className="text-button" onClick={()=>setResetConfirm(true)}>恢复默认设置</button><span>设置自动保存在本机 · v2</span></div>
        {resetConfirm&&<div className="message" role="alert"><p>恢复默认设置会替换当前映射、明细顺序、汇总组、颜色和预算。可先导出设置备份。</p><div className="actions"><button className="secondary-button" onClick={resetSettings}>确认恢复默认</button><button className="text-button" onClick={()=>setResetConfirm(false)}>取消</button></div></div>}
      </div><div className="preview-column"><section className="panel preview"><div className="section-heading"><h2>报表预览</h2></div>
        {report&&<p className="metadata">原始报销 {report.entries.length} 笔 · 合并明细 {report.detailCount} 条</p>}
        {!filename?<div className="empty"><span className="empty-symbol">▤</span><h3>先导入一份钱迹账单</h3><p>选择日期后，这里会显示合并后的每日明细和汇总组。</p></div>:result.error?<div role="alert" className="message error">{result.error}</div>:!report?.entries.length?<div className="empty"><h3>这个范围没有报销记录</h3><p>调整日期范围，或确认钱迹账单的类型为“报销”。</p></div>:<>
          <div className="report-meta"><span>{start} 至 {end}</span><span>{report.days.length} 天</span></div><div className="total-banner"><span>报销总额</span><strong>¥ {money(report.totalCents)}</strong></div>
          <div className="daily-list">{report.days.map(day=><div className="day" key={day.date}><div className="day-header"><h3>{day.date.replaceAll('-','.')}</h3><span>{day.count} 笔 → {day.entries.length} 条</span></div><div className="detail-header"><span>明细</span><span>金额（元）</span></div>{day.entries.map(e=><div className="detail-row" key={e.mapped} style={{color:colorFor(settings,e.mapped)}}><span>{e.mapped}</span><span>{money(e.cents)}</span></div>)}<div className="day-total"><span>当日小结</span><strong>{money(day.cents)}</strong></div></div>)}</div>
          <div className="report-summary">{report.summaries.map(s=><div key={s.id} style={{color:s.color}}><span>{s.name}合计</span><strong>{money(s.cents)}</strong></div>)}<div><span>其他花费</span><strong>{money(report.otherCents)}</strong></div><div className="grand-total"><span>总计</span><strong>{money(report.totalCents)}</strong></div>{budgetEnabled&&!budgetError&&budgetCents!==undefined&&<><div><span>预算</span><strong>{money(budgetCents)}</strong></div><div className={budgetCents<report.totalCents?'negative':''}><span>结余</span><strong>{money(budgetCents-report.totalCents)}</strong></div></>}</div>
        </>}
        <label className="budget-field">输出文件名称<input aria-label="输出文件名称" value={outputName} onChange={e=>setOutputName(e.target.value)} maxLength={DEFAULT_OPTIONS.maxReportFileNameLength} placeholder={DEFAULT_OPTIONS.reportFilePrefix}/></label><p className="hint">留空使用每日消费记录.xlsx，自动添加 .xlsx 后缀。最终文件名：{reportFileName(outputName)}</p>
        <button className="export-button" disabled={busy||!report?.entries.length||!!budgetError} onClick={()=>void exportFile()}>{busy?'正在处理…':'导出 Excel 报表'}</button><p className="hint">同日同类别合并，按明细顺序导出；包含每日小结、汇总组及可选结余。</p>
      </section><details className="panel help"><summary>在 iPhone 上使用</summary><ol><li>使用 Safari 打开本工具，点分享，选择“添加到主屏幕”。</li><li>从钱迹导出账单并存入“文件”，然后在这里选择该 XLSX。</li><li>导出报表后，从 Safari 下载列表打开；通过分享保存到“文件”或发给报销接收人。</li><li>页面提示“可离线使用”后，可断网打开并转换。离线状态下也需要重新选择原始账单。</li></ol><p className="hint">清理网站数据或更换手机会清除设置，建议定期导出设置备份。升级后若出现新版本提示，先保存报表，再点“更新”。</p></details></div></div>
      <footer>出差报表 · 本地转换，无需账户 · <a href="https://y600o.github.io/" target="_blank" rel="noreferrer">y600</a></footer>
    </main></>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
