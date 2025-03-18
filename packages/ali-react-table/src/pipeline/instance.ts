import { createContext, useContext, useRef } from "react";
import { BaseTable } from "../base-table/table"
import { DragInstance } from "./dragInstance"
import { ArtColumnMergePath, FilterItem, SortItem } from "../interfaces"

/**整体数据实例
 * 1. 列数据(原始列+处理后的渲染列)
 * 2. 列表头拖拽实现（可以进行列的排序和表格数据分组）
 * 3. 固定列的右键实现(固定列根据位置把它放入首位或者末位)
 * 4. 右键清除过滤数据
 * 5. 数据过滤
 * 6. 数据排序
 * 
 * 数据处理顺序：过滤 ====> 排序 ====> 分组
 * 多个过滤条件按照 或 的方式
 * 排序添加顺序下标(sortIndex)根据这个值进行先后顺序进行数据排序
 * 
 * 表头顺序字段：visibleIndex(当 groupIndex 值存在的时候，visibleIndex 无效，并且和 groupIndex值相同)
 * 表头分组字段：groupIndex
 * 表头字段排序字段：sortIndex，sort
*/
export class BaseTableInstance {
  /**表格实例*/
  baseTable: BaseTable;
  /**拖拽实例*/
  dragInstance: DragInstance;
  // /**原始数据*/
  // __dataList = []
  // /**过滤后的数据*/
  // __filterListData = []
  // /**排序后的数据*/
  // __sortListData = []
  // /**分组后的数据*/
  // __groupListData = []
  // /**渲染数据*/
  // __lastListData = []
  // /**原始表头数据*/
  // __columns: ArtColumnMergePath[] = []
  // /**过滤数据存储*/
  // __filter: FilterItem[] = []
  // /**字段排序数据存储*/
  // __sort: SortItem[] = []

  // /** 表头和数据变更的时候重新生成 */
  // createRest = () => {


  // }

  // /**列处理*/
  // columns = () => {

  // }

  // /**多选列添加*/
  // checkboxColumns = () => {

  // }

  // /**列过滤添加标签*/
  // filterColumns = () => {

  // }


  // /**排序列添加标签*/
  // sortColumns = () => {

  // }

  // /**列分组添加标签*/
  // groupColumns = () => {

  // }

  // // Todo 当 __dataList 变更的时候，需要对过滤存储的条件判断是否还存在，不存在则移除。__filterListData,__sortListData,__groupListData,__lastListData,数据进行重新生成
  // /**数据更新时，重新生成*/
  // dataSource = () => {
  //   // 处理表头数据

  // }

  // /**数据过滤实现*/
  // filterData = () => {
  //   // 1. 搜集表头的过滤数据
  //   // 2. 对数据进行过滤
  //   // 3. 数据存储
  //   // 收集过滤的数据，如果已经不存在当前

  // }

  // /**排序实现*/
  // sortData = () => {
  //   // 1. 搜集表头需要的排序数据
  //   // 2. 对数据(如果只排序，直接使用渲染数据进行)进行排序
  //   // 3. 数据存储
  // }

  // /**分组实现*/
  // groupData = () => {
  //   // 1. 搜集表头需要的分组数据
  //   // 2. 对数据对数据(如果只分组，直接使用渲染数据进行)进行分组
  //   // 3. 数据存储
  // }

  // /**拖拽列
  //  * 1. 只是表头拖拽(数据不变，只变表头顺序)
  //  * 2. 只是放置区域的数据拖拽(从未分组之前的数据进行重新分组)
  //  * 3. 表头拖拽放入拖拽区(从未分组之前的数据进行重新分组)
  //  * 4. 从拖拽区拖拽放入表头(从未分组之前的数据进行重新分组)
  // */
  // dragColumn = () => {

  // }


}

export const useBaseTableInstance = (baseTable?: BaseTableInstance) => {
  const ref = useRef<BaseTableInstance>(undefined)
  if (!ref.current) {
    if (baseTable) {
      ref.current = baseTable
    } else {
      ref.current = new BaseTableInstance()
    }
  }
  return [ref.current]
}

export const BaseTableContext = createContext(new BaseTableInstance());

export const useBaseTable = () => useContext(BaseTableContext);
