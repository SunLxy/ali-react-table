import styled, { css } from 'styled-components'

export const LOCK_SHADOW_PADDING = 20

const prefix = 'art-'

export const Classes = {
  /** BaseTable 表格组件的外层包裹 div */
  artTableWrapper: `${prefix}table-wrapper`,

  artTable: `${prefix}table`,
  tableHeader: `${prefix}table-header`,
  tableHeaderTop: `${prefix}table-header-top`,
  tableBody: `${prefix}table-body`,
  tableFooter: `${prefix}table-footer`,

  /** 表格行 */
  tableRow: `${prefix}table-row`,
  /** 表头行 */
  tableHeaderRow: `${prefix}table-header-row`,
  /** 单元格 */
  tableCell: `${prefix}table-cell`,
  /** 表头的单元格 */
  tableHeaderCell: `${prefix}table-header-cell`,
  virtualBlank: `${prefix}virtual-blank`,

  stickyScroll: `${prefix}sticky-scroll`,
  stickyScrollItem: `${prefix}sticky-scroll-item`,
  horizontalScrollContainer: `${prefix}horizontal-scroll-container`,

  lockShadowMask: `${prefix}lock-shadow-mask`,
  lockShadow: `${prefix}lock-shadow`,
  leftLockShadow: `${prefix}left-lock-shadow`,
  rightLockShadow: `${prefix}right-lock-shadow`,

  headerFooterLockShadowMaskWarp: `${prefix}header-footer-lock-shadow-mask-warp`,
  headerFooterLockShadowMask: `${prefix}header-footer-lock-shadow-mask`,
  headerFooterLockShadow: `${prefix}header-footer-lock-shadow`,
  headerFooterLeftLockShadow: `${prefix}header-footer-left-lock-shadow`,
  headerFooterRightLockShadow: `${prefix}header-footer-right-lock-shadow`,

  /** 数据为空时表格内容的外层 div */
  emptyWrapper: `${prefix}empty-wrapper`,

  loadingWrapper: `${prefix}loading-wrapper`,
  loadingIndicatorWrapper: `${prefix}loading-indicator-wrapper`,
  loadingIndicator: `${prefix}loading-indicator`,
} as const

const Z = {
  lock: 5,
  header: 25,
  footer: 25,
  lockShadow: 15,
  groupLock: 20,
  scrollItem: 30,
  loadingIndicator: 40,
} as const

export type BaseTableCSSVariables = Partial<{
  /** 表格一行的高度，注意该属性将被作为 CSS variable，不能使用数字作为简写 */
  '--row-height': string
  /** 表格的字体颜色 */
  '--color': string
  /** 表格背景颜色 */
  '--bgcolor': string
  /** 鼠标悬停时的背景色 */
  '--hover-bgcolor': string
  /** 单元格高亮时的背景色 */
  '--highlight-bgcolor': string
  /**主题样式*/
  '--primary-color': string;
  /**拖拽放置区域提示信息字体颜色*/
  '--placeholder-color': string;
  /** 表头中一行的高度，注意该属性将被作为 CSS variable，不能使用数字作为简写 */
  '--header-row-height': string
  /** 表头中的字体颜色 */
  '--header-color': string
  /** 表头的背景色 */
  '--header-bgcolor': string
  /** 表头上鼠标悬停时的背景色 */
  '--header-hover-bgcolor': string
  /** 表头上单元格高亮时的背景色 */
  '--header-highlight-bgcolor': string

  /** 单元格 padding */
  '--cell-padding': string
  /** 单元格垂直 padding */
  '--cell-padding-v': string
  /** 单元格水平 padding */
  '--cell-padding-h': string
  /** 字体大小 */
  '--font-size': string
  /** 表格内字体的行高 */
  '--line-height': string
  /** 锁列阴影，默认为 rgba(152, 152, 152, 0.5) 0 0 6px 2px */
  '--lock-shadow': string
  '--lock-shadow-color': string;

  /** 单元格的边框颜色 */
  '--border-color': string
  /** 单元格边框，默认为 1px solid var(--border-color) */
  '--cell-border': string
  /** 单元格上下边框，默认为 var(--cell-border) */
  '--cell-border-horizontal': string
  /** 单元格左右边框，默认为 var(--cell-border) */
  '--cell-border-vertical': string
  /** 表头单元格边框，默认为 1px solid var(--border-color) */
  '--header-cell-border': string
  /** 表头单元格上下边框，默认为 var(--header-cell-border) */
  '--header-cell-border-horizontal': string
  /** 表头单元格左右边框，默认为 var(--header-cell-border) */
  '--header-cell-border-vertical': string
}>

const outerBorderStyleMixin = css`
  border-top: var(--cell-border-horizontal);
  border-right: var(--cell-border-vertical);
  border-bottom: var(--cell-border-horizontal);
  border-left: var(--cell-border-vertical);
  td.first,
  th.first {
    border-left: none;
  }
  td.last,
  th.last {
    border-right: none;
  }

  thead tr.first th,
  tbody tr.first td {
    border-top: none;
  }
  &.has-footer tfoot tr.last td {
    border-bottom: none;
  }
  &:not(.has-footer) tbody tr.last td {
    border-bottom: none;
  }
`

export const StyledArtTableWrapper = styled.div`
  --row-height: 48px;
  --color: #333;
  --bgcolor: white;
  --hover-bgcolor: var(--hover-color, #f5f5f5);
  --highlight-bgcolor: #eee;
  --primary-color:#1677ff;
  --placeholder-color:#ccc;

  --header-row-height: 32px;
  --header-color: #5a6c84;
  --header-bgcolor: #e9edf2;
  --header-hover-bgcolor: #ddd;
  --header-highlight-bgcolor: #e4e8ed;

  --cell-padding: 8px 12px;
  --cell-padding-v: 8px;
  --cell-padding-h: 12px;

  --font-size: 12px;
  --line-height: 1.28571;
  --lock-shadow: rgba(152, 152, 152, 0.5) 0 0 6px 2px;
  --lock-shadow-color: rgba(152, 152, 152, 0.5);

  --border-color: #dfe3e8;
  --cell-border: 1px solid var(--border-color);
  --cell-border-horizontal: var(--cell-border);
  --cell-border-vertical: var(--cell-border);
  --header-cell-border: 1px solid var(--border-color);
  --header-cell-border-horizontal: var(--header-cell-border);
  --header-cell-border-vertical: var(--header-cell-border);

  box-sizing: border-box;
  * {
    box-sizing: border-box;
  }
  cursor: default;
  color: var(--color);
  font-size: var(--font-size);
  line-height: var(--line-height);
  position: relative;
  overflow-anchor: none;

  // 表格外边框由 art-table-wrapper 提供，而不是由单元格提供
  &.use-outer-border {
    ${outerBorderStyleMixin};
  }
  &.use-art-table-border .art-table{
    .${Classes.tableHeader},
    .${Classes.tableBody},
    .${Classes.tableFooter}{
      border-right: var(--cell-border-vertical);
      border-left: var(--cell-border-vertical);
      td.first,
      th.first {
        border-left: none;
      }
      td.last,
      th.last {
        border-right: none;
      }
    }
  }

  .no-scrollbar {
    // firefox 中移除滚动条
    scrollbar-width: none;

    // 其他浏览器中移除滚动条
    ::-webkit-scrollbar {
      display: none;
    }
  }

  .${Classes.tableHeader} {
    overflow-x: auto;
    overflow-y: hidden;
    background: var(--header-bgcolor);
  }

  .${Classes.tableBody}, .${Classes.tableFooter} {
    overflow-x: auto;
    overflow-y: hidden;
    background: var(--bgcolor);
  }

  &.sticky-header .${Classes.tableHeader} {
    position: sticky;
    top: 0;
    z-index: ${Z.header};
  }
  &.sticky-header .${Classes.tableHeaderTop} {
    position: sticky;
    top: 0;
    left: 0;
    z-index: ${Z.scrollItem};
    background: var(--header-bgcolor);
    width: 100%;
  }
  &.use-outer-border  .${Classes.tableHeaderTop} {
    border-bottom: var(--cell-border-horizontal);
  }

  &.sticky-footer .${Classes.tableFooter} {
    position: sticky;
    bottom: 0;
    z-index: ${Z.footer};
  }

  table {
    width: 100%;
    table-layout: fixed;
    border-collapse: separate;
    border-spacing: 0;
    display: table;
    margin: 0;
    padding: 0;
  }

  // 在 tr 上设置 .no-hover 可以禁用鼠标悬停效果
  tr:not(.no-hover):hover > td {
    background: var(--hover-bgcolor);
  }
  // 在 tr 设置 highlight 可以为底下的 td 设置为高亮色
  // 而设置 .no-highlight 的话则可以禁用高亮效果；
  tr:not(.no-highlight).highlight > td {
    background: var(--highlight-bgcolor);
  }

  th {
    font-weight: normal;
    text-align: left;
    padding: var(--cell-padding);
    height: var(--header-row-height);
    color: var(--header-color);
    background: var(--header-bgcolor);
    border: none;
    border-right: var(--header-cell-border-vertical);
    border-bottom: var(--header-cell-border-horizontal);
  }
  tr.first th {
    border-top: var(--header-cell-border-horizontal);
  }
  th.first {
    border-left: var(--header-cell-border-vertical);
  }

  td {
    padding: var(--cell-padding);
    background: var(--bgcolor);
    height: var(--row-height);
    border: none;
    border-right: var(--cell-border-vertical);
    border-bottom: var(--cell-border-horizontal);
  }
  td.first {
    border-left: var(--cell-border-vertical);
  }
  tr.first td {
    border-top: var(--cell-border-horizontal);
  }
  &.has-header tbody tr.first td {
    border-top: none;
  }
  &.has-footer tbody tr.last td {
    border-bottom: none;
  }

  .lock-left,
  .lock-right {
    z-index: ${Z.lock};
  }

  //#region 锁列阴影
  .lock-left-last,
  .lock-left:has(+ :not(.lock-left)){
    border-right: var(--cell-border-vertical);
  }

  .art-table-header-cell.lock-left-last {
    border-right: var(--header-cell-border-vertical);
  }
  .art-table-cell:not(.lock-right) + .lock-right {
    border-left:var(--cell-border-vertical);
  }
  .art-table-header-cell:not(.lock-right) + .lock-right {
    border-left:var(--header-cell-border-vertical);
  }

  .art-table-cell:has(+.lock-right-first),
  .art-table-header-cell:has(+.lock-right-first){
    border-right: 0;
  }

  .art_custom_group_lock_tr .art_custom_group_lock_td.lock-left:after{
    display: none !important;
  }

  &.show-left-shadow .lock-left-last.lock-left:after,
  &.show-left-shadow .lock-left:has(+ :not(.lock-left)):after{
    position: absolute;
    box-shadow: inset 10px 0 8px -8px var(--lock-shadow-color);
    top: 0;
    right: 0;
    bottom: -1px;
    width: 30px;
    transform: translateX(100%);
    transition: box-shadow 0.3s;
    content: "";
    pointer-events: none;
  }

  &.show-right-shadow .lock-right-first.lock-right:after{
    position: absolute;
    top: 0;
    bottom: -1px;
    left: 0;
    width: 30px;
    transform: translateX(-100%);
    transition: box-shadow  0.3s;
    content: "";
    pointer-events: none;
    box-shadow: inset -10px 0 8px -8px var(--lock-shadow-color);
  }
  //#endregion

  .art_custom_group_lock_tr .art_custom_group_lock_td{
    z-index:${Z.groupLock};
    justify-content: flex-start!important;
    text-align: left !important;
    font-weight: 600;
    border-right: 0px;
    & > .art_custom_group_lock_td_body{
      position: absolute;
      left: 0px;
      top: 0px;
      bottom: 0px;
      right: 0px;
      .art_custom_group_lock_td_body-content{
        position: sticky;
        display: flex;
        height: 100%;
        align-items: center;
        justify-content: flex-start;
      }
    }
  }

  //#region 空表格展现
  .${Classes.emptyWrapper} {
    pointer-events: none;
    color: #99a3b3;
    font-size: 12px;
    text-align: center;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .empty-image {
      width: 50px;
      height: 50px;
    }

    .empty-tips {
      margin-top: 16px;
      line-height: 1.5;
    }
  }
  //#endregion

  //#region 粘性滚动条
  .${Classes.stickyScroll} {
    overflow: auto;
    position: sticky;
    bottom: 0;
    z-index: ${Z.scrollItem};
    margin-top: -17px;
  }

  .${Classes.stickyScrollItem} {
    // 必须有高度才能出现滚动条
    height: 1px;
    visibility: hidden;
  }
  //#endregion

  //#region 加载样式
  .${Classes.loadingWrapper} {
    position: relative;

    .${Classes.loadingIndicatorWrapper} {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      pointer-events: none;
    }

    .${Classes.loadingIndicator} {
      position: sticky;
      z-index: ${Z.loadingIndicator};
      transform: translateY(-50%);
    }
  }
  //#endregion
`


const draggableStyleMixin = css`
  position: relative;
  &[draggable=true]{
    cursor: move !important;
    div,span,svg{
      cursor: move !important;
    }
  }
  &.dragging {
    opacity: 0.5;
  }

  &.draggover-left{
    &::before{
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      width: 2px;
      left: 0;
      background-color: var(--primary-color,#1677ff);
    }
  }

  &.draggover-right{
    &::after{
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      width: 2px;
      right: 0;
      background-color: var(--primary-color,#1677ff);
    }
  }

  &.draggover-top{
    &::before{
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background-color: var(--primary-color,#1677ff);
    }
  }
  &.draggover-bottom{
    &::after{
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background-color:var(--primary-color,#1677ff);
    }
  }
`

export const StyleArtTableTh = styled.th`
  ${draggableStyleMixin}
`

export const StyleArtTableHeaderTopLayoutLeft = styled.div`
  display: flex;
  align-items: center;
  box-sizing: border-box;
  &:not(:empty){
    padding-right: 12px;
  }
`

export const StyleArtTableHeaderTopLayoutMiddle = styled.div`
  flex: 1;
  box-sizing: border-box;
`

export const StyleArtTableHeaderTopLayoutRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  box-sizing: border-box;
`

export const StyleArtTableHeaderTopLayout = styled.div`
  display: flex;
  align-items: center;
  justify-content:space-between;
  box-sizing: border-box;
  padding: 4px 0px;
`

export const StyleArtPlaceAreaItem = styled.div`
  display: inline-flex;
  padding: 7px 12px;
  border-radius: 12px;
  box-sizing: border-box;
  border:var(--cell-border-horizontal);
  ${draggableStyleMixin}
`

export const StyleArtPlaceArea = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  box-sizing: border-box;
  min-height: 32px;
  .place-area-placeholder{
    color: var(--placeholder-color,#ccc);
  }
`
