import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ExcelJS from 'exceljs';
import {freshSettings as currentDefaults,makeReport,mappedCategory,parseMoney,validateSettings,colorFor,assignGroup,normalizeCategoryOrder,reportFileName,type Bill,type Settings} from '../src/model';
import {readBills,parseDateTime,createWorkbook} from '../src/excel';
// 引擎回归使用固定配置，不随用户修改业务默认值而改变金额基准。
const freshSettings=():Settings=>({version:2,mappings:[
 {id:'fuel',source:'汽车/加油',secondary:'',noteContains:'',target:'加油'},
 {id:'toll',source:'交通',secondary:'过路费',noteContains:'',target:'过路费'},
],categoryOrder:['加油','过路费'],groups:[
 {id:'fuel',name:'加油',members:['加油'],color:'#ff0000'},
 {id:'toll',name:'过路费',members:['过路费'],color:'#0070c0'},
],colors:{}});
const bill=(overrides:Partial<Bill>={}):Bill=>({row:2,id:'one',date:'2026-09-24',time:'00:00:00',category:'三餐',secondary:'',note:'',cents:100,currency:'CNY',...overrides});
async function inputWorkbook(rows:unknown[][]){const w=new ExcelJS.Workbook();const s=w.addWorksheet('账单');s.addRow(['时间','分类','二级分类','类型','金额','币种']);rows.forEach(r=>s.addRow(r));const b=await w.xlsx.writeBuffer();return new Uint8Array(b).buffer}
test('只导入报销，排除收入、支出；接受文本和 Excel 日期',async()=>{
 const parsed=await readBills(await inputWorkbook([
 ['2026-09-24 00:00:00','三餐','','报销',1.01,'CNY'],
 ['2026-09-24 12:00:00','三餐','','收入',20,'CNY'],
 ['2026-09-24 12:00:00','三餐','','支出',30,'CNY'],
 [new Date('2026-09-25T23:59:59Z'),'交通','过路费','报销',2.02,'CNY'],
 ]));assert.equal(parsed.bills.length,2);assert.equal(parsed.excluded,2);assert.equal(parsed.bills[1].date,'2026-09-25');assert.equal(parsed.bills[1].time,'23:59:59');
});
test('无效表头、日期、金额不能静默漏算',async()=>{
 await assert.rejects(readBills(await inputWorkbook([['2026-02-30','三餐','','报销',1,'CNY']])),/第 2 行/);
 await assert.rejects(readBills(await inputWorkbook([['2026-09-24','三餐','','报销','abc','CNY']])),/第 2 行/);
 const w=new ExcelJS.Workbook();w.addWorksheet('错误').addRow(['金额']);const b=await w.xlsx.writeBuffer();await assert.rejects(readBills(new Uint8Array(b).buffer),/表头/);
});
test('日期范围包含两端、保持原始日期且按时间排序',()=>{
 const r=makeReport([bill({row:3,date:'2026-09-25',time:'23:59:59'}),bill(),bill({date:'2026-09-26'})],'2026-09-24','2026-09-25',freshSettings());assert.equal(r.entries.length,2);assert.equal(r.days[0].date,'2026-09-24');
 assert.throws(()=>makeReport([],'2026-09-25','2026-09-24',freshSettings()),/晚于/);
 assert.deepEqual(parseDateTime('2026.9.24 2:03:04'),{date:'2026-09-24',time:'02:03:04'});
 assert.throws(()=>parseDateTime('2026-09-24 25:00:00'));
});
test('二级映射优先、多对一映射、未映射类别与汇总顺序',()=>{
 const s=freshSettings();s.mappings.push({id:'all',source:'交通',secondary:'',noteContains:'',target:'交通费'},{id:'meal',source:'三餐',secondary:'',noteContains:'',target:'交通费'});s.groups=[{id:'toll',name:'过路费',members:['过路费'],color:'#000000'},{id:'traffic',name:'交通费',members:['交通费'],color:'#000000'}];
 assert.equal(mappedCategory(bill({category:'交通',secondary:'过路费'}),s),'过路费');assert.equal(mappedCategory(bill({category:'住宿',secondary:'酒店'}),s),'酒店');
 const r=makeReport([bill({category:'交通',secondary:'过路费',cents:50}),bill({cents:101}),bill({category:'交通',cents:102}),bill({category:'日用品',cents:20})],'2026-09-24','2026-09-24',s);
 assert.deepEqual(r.summaries.map(s=>({name:s.name,cents:s.cents})),[{name:'过路费',cents:50},{name:'交通费',cents:203}]);assert.equal(r.otherCents,20);assert.equal(r.totalCents,273);
});
test('人民币限制、空范围、金额精度和设置恢复验证',()=>{
 assert.throws(()=>makeReport([bill({currency:'USD'})],'2026-09-24','2026-09-24',freshSettings()),/非人民币/);
 assert.equal(makeReport([],'2026-09-24','2026-09-24',freshSettings()).totalCents,0);
 assert.equal(parseMoney('0.10')+parseMoney('0.20'),30);assert.equal(parseMoney('-1.01'),-101);assert.throws(()=>parseMoney('1.001'));assert.throws(()=>parseMoney(''));
 const s=freshSettings();assert.deepEqual(validateSettings(JSON.parse(JSON.stringify(s))),s);
 assert.equal(colorFor(s,'constructor'),'#000000');
 assert.throws(()=>validateSettings({...s,categoryOrder:['加油','加油']}));assert.throws(()=>validateSettings({...s,colors:{加油:'red'}}));assert.throws(()=>validateSettings({...s,mappings:[...s.mappings,s.mappings[0]]}));
});
test('Excel 导出保留公式缓存、数值、颜色和预算开关',async()=>{
 const s=freshSettings();const r=makeReport([bill({category:'汽车/加油',cents:123}),bill({row:3,category:'交通',secondary:'过路费',cents:234})],'2026-09-24','2026-09-24',s);
 const w=createWorkbook(r,s,300);const out=await w.xlsx.writeBuffer();const reread=new ExcelJS.Workbook();await reread.xlsx.load(out);const sheet=reread.worksheets[0];
 assert.equal(sheet.getCell('B2').value,'加油');assert.equal(sheet.getCell('C2').value,1.23);assert.equal(sheet.getCell('C2').numFmt,'#,##0.00');assert.equal(sheet.getCell('B2').font.color?.argb,'FFFF0000');assert.equal(sheet.getCell('B3').font.color?.argb,'FF0070C0');assert.equal(sheet.getCell('A3').value,'');
 assert.deepEqual(sheet.getCell('D3').value,{formula:'SUM(C2:C3)',result:3.57});
 const labelCells:Record<string,ExcelJS.Cell>={};sheet.eachRow(row=>{const label=row.getCell(6).value;if(typeof label==='string')labelCells[label]=row.getCell(7)});
 assert.equal((labelCells['总计'].value as ExcelJS.CellFormulaValue).result,3.57);assert.equal((labelCells['结余'].value as ExcelJS.CellFormulaValue).result,-0.57);assert.equal(labelCells['结余'].font.color?.argb,'FFC42C2C');
 const noBudget=createWorkbook(r,s).worksheets[0];assert.ok(!noBudget.getColumn(6).values.includes('预算'));
});
test('备注条件优先级、文本包含匹配及冲突提示',()=>{
 const s=freshSettings();s.mappings=[
  {id:'primary',source:'交通',secondary:'',noteContains:'',target:'交通费'},
  {id:'secondary',source:'交通',secondary:'过路费',noteContains:'',target:'过路费'},
  {id:'note',source:'交通',secondary:'',noteContains:'一号车',target:'一号车费用'},
  {id:'both',source:'交通',secondary:'过路费',noteContains:'一号车',target:'一号车过路费'},
 ];
 const b=bill({row:8,category:'交通',secondary:'过路费',note:'今天一号车出行'});
 assert.equal(mappedCategory(b,s),'一号车过路费');s.mappings.pop();assert.equal(mappedCategory(b,s),'一号车费用');
 assert.equal(mappedCategory({...b,note:'二号车'},s),'过路费');assert.equal(mappedCategory({...b,secondary:'',note:''},s),'交通费');
 s.mappings.push({id:'two',source:'交通',secondary:'',noteContains:'出行',target:'另一费用'});
 assert.throws(()=>makeReport([b],'2026-09-24','2026-09-24',s),/第 8 行.*冲突/);
 s.mappings.at(-1)!.target='一号车费用';assert.equal(mappedCategory(b,s),'一号车费用');
 s.mappings.at(-1)!.noteContains='.*';assert.equal(mappedCategory(b,s),'一号车费用');
});
test('钱迹导入保留备注供车辆匹配',async()=>{
 const w=new ExcelJS.Workbook();const s=w.addWorksheet('账单');s.addRow(['时间','分类','类型','金额','币种','备注']);s.addRow(['2026-09-24','汽车/加油','报销',10,'CNY','一号车 加油']);
 const b=await w.xlsx.writeBuffer();const parsed=await readBills(new Uint8Array(b).buffer);assert.equal(parsed.bills[0].note,'一号车 加油');
});
test('每日合并按独立顺序排列，跨日期不合并；新类别追加',()=>{
 const s=freshSettings();s.mappings=[];s.categoryOrder=['三餐','加油'];
 const bills=[bill({category:'加油',cents:100}),bill({category:'三餐',cents:200,time:'12:00:00'}),bill({category:'加油',cents:300,time:'18:00:00'}),bill({category:'加油',cents:400,date:'2026-09-25'}),bill({category:'住宿',cents:500,date:'2026-09-25'})];
 const normalized=normalizeCategoryOrder(bills,s);assert.deepEqual(normalized.categoryOrder,['三餐','加油','过路费','住宿']);
 const r=makeReport(bills,'2026-09-24','2026-09-25',normalized);assert.equal(r.entries.length,5);assert.equal(r.detailCount,4);
 assert.deepEqual(r.days[0].entries,[{mapped:'三餐',cents:200,count:1},{mapped:'加油',cents:400,count:2}]);assert.equal(r.days[1].entries.find(e=>e.mapped==='加油')!.cents,400);
 const reordered={...normalized,categoryOrder:['加油','三餐','住宿','过路费']};assert.deepEqual(makeReport(bills,'2026-09-24','2026-09-25',reordered).days[0].entries.map(e=>e.mapped),['加油','三餐']);
});
test('多车汇总组、唯一归属、颜色继承及覆盖',()=>{
 const s=freshSettings();s.mappings=['一号车','二号车'].flatMap((car,i)=>[
  {id:`fuel-${i}`,source:'汽车/加油',secondary:'',noteContains:car,target:`${car}加油`},
  {id:`toll-${i}`,source:'交通',secondary:'过路费',noteContains:car,target:`${car}过路费`},
 ]);s.groups[0].members=['一号车加油','二号车加油'];s.groups[1].members=['一号车过路费','二号车过路费'];
 s.categoryOrder=['一号车加油','二号车加油','一号车过路费','二号车过路费','三餐'];
 const bills=[bill({category:'汽车/加油',note:'一号车',cents:100}),bill({category:'汽车/加油',note:'一号车',cents:200}),bill({category:'汽车/加油',note:'二号车',cents:300}),bill({category:'交通',secondary:'过路费',note:'一号车',cents:50}),bill({category:'交通',secondary:'过路费',note:'二号车',cents:70}),bill({cents:80})];
 const r=makeReport(bills,'2026-09-24','2026-09-24',s);assert.equal(r.detailCount,5);assert.equal(r.days[0].entries[0].cents,300);assert.deepEqual(r.summaries.map(g=>g.cents),[600,120]);assert.equal(r.otherCents,80);assert.equal(r.totalCents,800);
 assert.equal(colorFor(s,'一号车加油'),'#ff0000');s.colors['一号车加油']='#123456';assert.equal(colorFor(s,'一号车加油'),'#123456');assert.equal(colorFor(s,'二号车加油'),'#ff0000');delete s.colors['一号车加油'];assert.equal(colorFor(s,'一号车加油'),'#ff0000');
 const moved=assignGroup(s,'一号车加油','toll');assert.ok(!moved.groups[0].members.includes('一号车加油'));assert.ok(moved.groups[1].members.includes('一号车加油'));validateSettings(moved);
 assert.throws(()=>validateSettings({...s,groups:s.groups.map(g=>({...g,members:[...g.members,'三餐']}))}),/只能属于一个/);
 const ungrouped=assignGroup(s,'二号车加油','');assert.equal(colorFor(ungrouped,'二号车加油'),'#000000');
 const w=createWorkbook(r,s).worksheets[0];const groupRow=w.getColumn(6).values.findIndex(v=>v==='加油合计');assert.equal((w.getCell(`G${groupRow}`).value as ExcelJS.CellFormulaValue).result,6);
});
test('仅接受 v2、备份恢复及默认对象隔离',()=>{
 const s=currentDefaults();assert.deepEqual(validateSettings(JSON.parse(JSON.stringify(s))),s);
 assert.throws(()=>validateSettings({...s,version:1}),/仅支持版本 2/);
 const modified=currentDefaults();modified.groups[0].members.push('测试');modified.colors['一号车油费']='#123456';assert.deepEqual(currentDefaults().groups[0].members,['一号车油费','二号车油费']);assert.equal(colorFor(currentDefaults(),'一号车油费'),'#ff0000');
});
test('新默认映射、司机优先、其他分类位置及预览 Excel 顺序一致',async()=>{
 const s=validateSettings(currentDefaults());
 const expected=['早餐','午餐','晚餐','司机早餐','司机午餐','司机晚餐','野外物资采买','门票','住宿','停车费','一号车油费','二号车油费','一号车过路费','二号车过路费','其他'];
 const bills=[
 ...['早餐','午餐','晚餐'].flatMap(secondary=>[bill({secondary}),bill({secondary,note:'司机'})]),
 bill({category:'购物'}),bill({category:'旅游',secondary:'景区门票'}),bill({category:'住宿'}),bill({category:'停车费'}),
 ...['一号车','二号车'].flatMap(note=>[bill({category:'汽车/加油',secondary:'油费',note}),bill({category:'交通',secondary:'过路费',note})]),bill({category:'其他'})];
 const normalized=normalizeCategoryOrder(bills,s);assert.deepEqual(normalized.categoryOrder,expected);
 const r=makeReport(bills,'2026-09-24','2026-09-24',normalized);assert.deepEqual(r.days[0].entries.map(e=>e.mapped),expected);assert.deepEqual(r.summaries.map(g=>g.cents),[200,200]);assert.equal(r.otherCents,1100);assert.equal(r.totalCents,1500);
 const w=createWorkbook(r,normalized);const out=await w.xlsx.writeBuffer();const read=new ExcelJS.Workbook();await read.xlsx.load(out);assert.deepEqual(expected.map((_,i)=>read.worksheets[0].getCell(i+2,2).value),expected);
 const manual={...normalized,categoryOrder:[...expected].reverse()};assert.deepEqual(normalizeCategoryOrder(bills,manual).categoryOrder,manual.categoryOrder);
 const next=normalizeCategoryOrder([...bills,bill({category:'水费'})],normalized);assert.equal(next.categoryOrder[next.categoryOrder.indexOf('一号车油费')-1],'水费');
});
test('自定义输出名称、默认名称、后缀及非法字符',()=>{
 assert.equal(reportFileName(''),'每日消费记录.xlsx');
 assert.equal(reportFileName('  野外调查报表.xlsx.xlsx  '),'野外调查报表.xlsx');
 assert.equal(reportFileName('报表/第一期:两车?'),'报表_第一期_两车_.xlsx');
 assert.equal(reportFileName('CON'),'_CON.xlsx');
 assert.equal(reportFileName('...'),'每日消费记录.xlsx');
});
test('Excel 全区域等线 11 号、不加粗、无底色、行高14；按显示文字调整列宽',async()=>{
 const s=freshSettings();const longName='二号车加油费用合并后的完整类别';s.mappings[0].target=longName;s.categoryOrder=[longName,'过路费'];s.groups[0].members=[longName];
 const r=makeReport([bill({category:'汽车/加油',cents:123456789}),bill({category:'汽车/加油',cents:100,date:'2026-09-25'})],'2026-09-24','2026-09-25',s);
 const w=createWorkbook(r,s,200000000);const exported=await w.xlsx.writeBuffer();const read=new ExcelJS.Workbook();await read.xlsx.load(exported);const sheet=read.worksheets[0];
 assert.equal(sheet.properties.defaultRowHeight,14);
 for(let row=1;row<=sheet.rowCount;row++){assert.equal(sheet.getRow(row).height,14);for(let col=1;col<=7;col++){const c=sheet.getCell(row,col);assert.equal(c.font.name,'等线');assert.equal(c.font.size,11);assert.ok(!c.font.bold);assert.equal(c.fill.type,'pattern');assert.equal((c.fill as ExcelJS.FillPattern).pattern,'none');assert.ok(!c.alignment.wrapText)}}
 assert.ok(sheet.getColumn(2).width!>=[...longName].length*2+2);assert.ok(sheet.getColumn(3).width!>='1,234,567.89'.length+2);assert.equal(sheet.getColumn(5).width,8.5);assert.equal(sheet.getCell('B2').font.color?.argb,'FFFF0000');
 assert.equal(sheet.getCell('A4').value,'2026.09.25');
});
const sample=process.env.QIANJI_SAMPLE;
test('真实钱迹样本：37 笔 / 6251.59 元', {skip:!sample},async()=>{
 const file=await fs.readFile(sample!);const data=await readBills(new Uint8Array(file).buffer);const r=makeReport(data.bills,'2026-09-24','2026-09-28',freshSettings());assert.equal(r.entries.length,37);assert.equal(r.detailCount,21);assert.equal(r.totalCents,625159);assert.deepEqual(r.summaries.map(s=>({name:s.name,cents:s.cents})),[{name:'加油',cents:370519},{name:'过路费',cents:29700}]);assert.equal(r.otherCents,224940);
 assert.deepEqual(r.days.map(d=>d.cents),[50900,147801,137284,152890,136284]);
 const current=makeReport(data.bills,'2026-09-24','2026-09-28',currentDefaults());assert.equal(current.entries.length,37);assert.equal(current.totalCents,625159);assert.deepEqual(current.days.map(d=>d.cents),r.days.map(d=>d.cents));assert.equal(current.summaries.reduce((sum,g)=>sum+g.cents,0)+current.otherCents,current.totalCents);
 if(process.env.WRITE_VERIFICATION==='1'){await fs.mkdir('.verification',{recursive:true});await createWorkbook(r,freshSettings(),800000).xlsx.writeFile('.verification/出差报表验收.xlsx')}
});
