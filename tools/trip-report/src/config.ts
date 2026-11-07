import type { Settings } from './model';

/** 业务默认选项集中在这里。修改后构建并发布，在页面点“恢复默认设置”应用。 */
export const DEFAULT_SETTINGS: Settings = {
  version: 2,
  // secondary 留空匹配整个一级分类；noteContains 留空不限制备注。
  // 多车示例：{ id:'car-1-fuel', source:'汽车/加油', secondary:'', noteContains:'一号车', target:'一号车加油' }
  mappings: [
    { id:'car-1-fuel', source:'汽车/加油', secondary:'油费', noteContains:'一号车', target:'一号车油费' },
    { id:'car-2-fuel', source:'汽车/加油', secondary:'油费', noteContains:'二号车', target:'二号车油费' },
    { id:'car-1-toll', source:'交通', secondary:'过路费', noteContains:'一号车', target:'一号车过路费' },
    { id:'car-2-toll', source:'交通', secondary:'过路费', noteContains:'二号车', target:'二号车过路费' },
    { id:'breakfast', source:'三餐', secondary:'早餐', noteContains:'', target:'早餐' },
    { id:'breakfast-driver', source:'三餐', secondary:'早餐', noteContains:'司机', target:'司机早餐' },
    { id:'lunch', source:'三餐', secondary:'午餐', noteContains:'', target:'午餐' },
    { id:'lunch-driver', source:'三餐', secondary:'午餐', noteContains:'司机', target:'司机午餐' },
    { id:'dinner', source:'三餐', secondary:'晚餐', noteContains:'', target:'晚餐' },
    { id:'dinner-driver', source:'三餐', secondary:'晚餐', noteContains:'司机', target:'司机晚餐' },
    { id:'buy', source:'购物', secondary:'', noteContains:'', target:'野外物资采买' },
    { id:'ticket', source:'旅游', secondary:'景区门票', noteContains:'', target:'门票' },

  ],
  // 每日明细默认顺序；新类别插入一号车油费之前，可在页面手动调整。
  categoryOrder: ['早餐','午餐','晚餐','司机早餐','司机午餐','司机晚餐','野外物资采买','门票','一号车油费','二号车油费','一号车过路费','二号车过路费','其他'],
  // 汇总组按数组顺序输出；同一类别只能属于一个组。
  // 多车时可将 members 改为 ['一号车加油', '二号车加油']。
  groups: [
    { id:'fuel', name:'加油', members:['一号车油费', '二号车油费'], color:'#ff0000' },
    { id:'toll', name:'过路费', members:['一号车过路费', '二号车过路费'], color:'#0070c0' },
  ],
  // 明细颜色覆盖。未指定时继承所属组颜色，未归组时使用黑色默认值。
  colors: {},
};
export const DEFAULT_OPTIONS = {
  budgetEnabled:false, // 默认是否计算结余
  budget:'', // 默认预算（元），字符串；例如 '8000.00'
  fallbackColor:'#000000',
  negativeBalanceColor:'#c42c2c',
  billType:'报销',
  currency:'CNY',
  storageKey:'trip-report-settings-v1', // 本机存储键保持稳定；仅接受版本 2 配置
  newCategoryBefore:'一号车油费', // 新类别按首次出现顺序插入此类别前；找不到时追加
  maxBillFileBytes:30*1024*1024,
  maxSettingsFileBytes:1024*1024,
  maxCategoryLength:80,
  reportFilePrefix:'每日消费记录', // 默认输出文件名（不包含 .xlsx 后缀）
  maxReportFileNameLength:120, // 输出文件名称上限，不包含 .xlsx 后缀
  settingsFileName:'出差报表设置.json',
};
export const EXCEL_OPTIONS = {
  sheetName:'每日消费记录',fontName:'等线',fontSize:11,bold:false,
  rowHeight:14, // Excel 行高单位：磅
  numberFormat:'#,##0.00',
  // 列宽按最终内容估算；中文等宽字符按 2 个字符宽度计算。
  columnPadding:2,minColumnWidth:6,spacerColumnWidth:8.5, // 空白分隔列固定宽度
};
