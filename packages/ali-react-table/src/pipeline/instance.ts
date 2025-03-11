import { createContext, useContext, useRef } from "react";
import { TablePipeline } from "./pipeline"

/**整体数据实例
 * 1. 列数据(原始列+处理后的渲染列)
 * 2. 列表头拖拽实现（可以进行列的排序和表格数据分组）
 * 3. 固定列的邮件实现(固定列根据位置把它放入首位或者末位)
 * 4. 右键清除过滤数据
*/
export class BaseTableInstance {
  /**管道*/
  pipeline?: TablePipeline;

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
