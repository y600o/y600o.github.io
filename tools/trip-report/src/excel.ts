import ExcelJS from 'exceljs';
import { type Bill, type Report, type Settings, parseMoney, validDate, colorFor } from './model';
import { DEFAULT_OPTIONS, EXCEL_OPTIONS } from './config';
export function parseDateTime(value: unknown): {date:string;time:string} {
  let text:string;
  if(value instanceof Date){if(Number.isNaN(value.getTime()))throw new Error('日期无效');text=value.toISOString().replace('T',' ').slice(0,19)}
  else if(typeof value==='number'){
    if(!Number.isFinite(value)||value<1||value>2958465)throw new Error('Excel 日期无效');
    const date=new Date(Date.UTC(1899,11,30)+Math.round(value*86400000));text=date.toISOString().replace('T',' ').slice(0,19);
  }else text=String(value??'').trim();
  const match=text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if(!match)throw new Error('时间格式无法识别');
  const [,y,m,d,h='00',min='00',sec='00']=match;
  const date=`${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
  if(!validDate(date)||Number(h)>23||Number(min)>59||Number(sec)>59)throw new Error('日期或时间无效');
  return {date,time:`${h.padStart(2,'0')}:${min}:${sec}`};
}
function scalar(cell:ExcelJS.Cell):unknown {
  const v=cell.value;
  if(v&&typeof v==='object'&&!(v instanceof Date)){
    if('formula'in v || 'sharedFormula'in v) return (v as ExcelJS.CellFormulaValue).result;
    if('richText'in v) return v.richText.map(x=>x.text).join('');
    if('text'in v) return v.text;
  }
  return v;
}
export async function readBills(buffer:ArrayBuffer):Promise<{bills:Bill[];rowCount:number;excluded:number}> {
  const workbook=new ExcelJS.Workbook();
  try{await workbook.xlsx.load(buffer)}catch{throw new Error('文件无法读取，请选择钱迹导出的未加密 .xlsx 文件')}
  const required=['时间','分类','类型','金额','币种'];
  const candidates=workbook.worksheets.filter(s=>required.every(h=>s.getRow(1).values && Array.from(s.getRow(1).values as unknown[]).some(v=>String(v??'').trim()===h)));
  const sheet=candidates.find(s=>s.name==='账单')||candidates[0];
  if(!sheet)throw new Error(`未找到钱迹账单表头，需要：${required.join('、')}`);
  const headers=new Map<string,number>();sheet.getRow(1).eachCell((c,col)=>{const h=String(scalar(c)??'').trim();if(headers.has(h))throw new Error(`表头“${h}”重复`);headers.set(h,col)});
  const value=(r:ExcelJS.Row,h:string)=>headers.has(h)?scalar(r.getCell(headers.get(h)!)):'';
  const bills:Bill[]=[];const errors:string[]=[];let rowCount=0,excluded=0;
  sheet.eachRow((r,row)=>{
    if(row===1||!r.values||Array.from(r.values as unknown[]).every(v=>v==null||v===''))return;
    rowCount++;
    const type=String(value(r,'类型')??'').trim();
    if(!type){errors.push(`第 ${row} 行：类型不能为空`);return}
    if(type!==DEFAULT_OPTIONS.billType){excluded++;return}
    try{
      let rawTime=value(r,'时间');
      if(typeof rawTime==='number'&&workbook.properties.date1904)rawTime+=1462;
      const datetime=parseDateTime(rawTime);const cents=parseMoney(value(r,'金额'));
      const category=String(value(r,'分类')??'').trim();if(!category)throw new Error('分类不能为空');
      bills.push({row,id:String(value(r,'ID')??row),...datetime,category,secondary:String(value(r,'二级分类')??'').trim(),note:String(value(r,'备注')??''),cents,currency:String(value(r,'币种')??'').trim().toUpperCase()});
    }catch(e){errors.push(`第 ${row} 行：${(e as Error).message}`)}
  });
  if(errors.length)throw new Error(errors.slice(0,20).join('\n')+(errors.length>20?`\n另有 ${errors.length-20} 行错误`:''));
  return {bills,rowCount,excluded};
}
function sumFormula(rows:number[]):string {
  if(!rows.length)return '0';
  const ranges:string[]=[];let start=rows[0],end=start;
  for(const r of rows.slice(1)){if(r===end+1){end=r}else{ranges.push(start===end?`C${start}`:`C${start}:C${end}`);start=end=r}}
  ranges.push(start===end?`C${start}`:`C${start}:C${end}`);
  // SUM accepts at most 255 arguments; join smaller SUMs to keep large exports valid.
  const groups:string[]=[];for(let i=0;i<ranges.length;i+=200)groups.push(`SUM(${ranges.slice(i,i+200).join(',')})`);
  return groups.join('+');
}
export function createWorkbook(report:Report,settings:Settings,budgetCents?:number):ExcelJS.Workbook {
  if(!report.entries.length)throw new Error('没有可导出的报销记录');
  const workbook=new ExcelJS.Workbook();workbook.creator='出差报表';workbook.calcProperties.fullCalcOnLoad=true;
  const sheet=workbook.addWorksheet(EXCEL_OPTIONS.sheetName,{properties:{defaultRowHeight:EXCEL_OPTIONS.rowHeight},views:[{state:'frozen',ySplit:1}],pageSetup:{paperSize:9,orientation:'portrait',fitToPage:true,fitToWidth:1,fitToHeight:0}});
  const baseFont={name:EXCEL_OPTIONS.fontName,size:EXCEL_OPTIONS.fontSize,bold:EXCEL_OPTIONS.bold};
  for(let col=1;col<=7;col++)sheet.getColumn(col).font={...baseFont};
  sheet.addRow(['日期','明细','金额','小结']);
  let row=2;const categoryRows=new Map<string,number[]>();const dailyRows:number[]=[];const otherRows:number[]=[];
  for(const day of report.days){
    const first=row;
    for(const [i,e] of day.entries.entries()){
      const r=sheet.getRow(row);r.values=[i===0?day.date.replaceAll('-','.'):'',e.mapped,e.cents/100];
      const color=colorFor(settings,e.mapped).slice(1).toUpperCase();
      for(const col of [2,3])r.getCell(col).font={...baseFont,color:{argb:`FF${color}`}};
      const rows=categoryRows.get(e.mapped)||[];rows.push(row);categoryRows.set(e.mapped,rows);
      if(!settings.groups.some(g=>g.members.includes(e.mapped)))otherRows.push(row);
      row++;
    }
    const last=row-1;sheet.getCell(`D${last}`).value={formula:`SUM(C${first}:C${last})`,result:day.cents/100};dailyRows.push(last);row++;
  }
  row+=2;
  const summary=(label:string,formula:string,cents:number,color=DEFAULT_OPTIONS.fallbackColor)=>{
    sheet.getCell(`F${row}`).value=label;sheet.getCell(`G${row}`).value={formula,result:cents/100};
    for(const col of ['F','G'])sheet.getCell(`${col}${row}`).font={...baseFont,color:{argb:`FF${color.slice(1).toUpperCase()}`}};
    row++;
  };
  for(const s of report.summaries){
    const rows=s.members.flatMap(c=>categoryRows.get(c)||[]).sort((a,b)=>a-b);
    summary(`${s.name}合计`,sumFormula(rows),s.cents,s.color);
  }
  summary('其他花费',sumFormula(otherRows),report.otherCents);row++;
  const totalRow=row;summary('总计',`SUM(D2:D${dailyRows.at(-1)})`,report.totalCents);
  if(budgetCents!==undefined){
    if(!Number.isSafeInteger(budgetCents)||budgetCents<0)throw new Error('预算必须是非负金额');
    const budgetRow=row;sheet.getCell(`F${row}`).value='预算';sheet.getCell(`G${row}`).value=budgetCents/100;row++;
    summary('结余',`G${budgetRow}-G${totalRow}`,budgetCents-report.totalCents,budgetCents<report.totalCents?DEFAULT_OPTIONS.negativeBalanceColor:DEFAULT_OPTIONS.fallbackColor);
  }
  // 统一包含表头、空白行和汇总的整个使用范围；颜色只保留文字颜色。
  for(let index=1;index<=row;index++){
    const r=sheet.getRow(index);r.height=EXCEL_OPTIONS.rowHeight;
    for(let col=1;col<=7;col++){
      const cell=r.getCell(col);const color=cell.font?.color;
      cell.font={...baseFont,color:color?.argb?color:{argb:`FF${DEFAULT_OPTIONS.fallbackColor.slice(1).toUpperCase()}`}};
      cell.fill={type:'pattern',pattern:'none'};cell.border={};
      cell.alignment={vertical:'middle',wrapText:false};
      if([3,4,7].includes(col)&&typeof cell.value!=='string')cell.numFmt=EXCEL_OPTIONS.numberFormat;
    }
  }
  for(let col=1;col<=7;col++){
    const column=sheet.getColumn(col);
    if(col===5){column.width=EXCEL_OPTIONS.spacerColumnWidth;continue}
    let longest=0;
    column.eachCell(cell=>{
      const v=cell.value;const value=v&&typeof v==='object'&&'formula'in v?v.result:v;
      const display=typeof value==='number'?value.toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2}):String(value??'');
      const width=[...display].reduce((a,ch)=>a+(ch.codePointAt(0)!>255?2:1),0);
      longest=Math.max(longest,width);
    });
    column.width=Math.max(EXCEL_OPTIONS.minColumnWidth,longest+EXCEL_OPTIONS.columnPadding);
  }
  sheet.pageSetup.printArea=`A1:G${row}`;sheet.pageSetup.printTitlesRow='1:1';
  return workbook;
}
export async function exportWorkbook(report:Report,settings:Settings,budgetCents?:number):Promise<Blob>{
  const buffer=await createWorkbook(report,settings,budgetCents).xlsx.writeBuffer();
  return new Blob([new Uint8Array(buffer)],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}
