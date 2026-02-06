import { AbstractTreeNode, isLeafNode } from "../ali-react-table"
import type { PositionKeysMapType } from "../interfaces"

/** 对树状结构的数据进行排序.
 * layeredFilter 是一个递归的过程，针对树上的每一个父节点，该函数都会重新对其子节点数组（children) 进行过滤.
 * */
export function layeredFilter<T extends AbstractTreeNode>(array: T[], positionKeysMap: PositionKeysMapType, compare: (x: T) => boolean): T[] {
  return dfs(array, 0)

  function dfs(rows: T[], depth: number = 0): T[] {
    if (!Array.isArray(array)) {
      return array
    }
    const positionItem = positionKeysMap?.[depth];
    const childField = positionItem?.childField || 'children';
    return rows
      .map((row) => {
        if (isLeafNode(row, { childField })) {
          return row
        }
        return { ...row, [childField]: dfs(row[childField] as T[], depth + 1) }
      })
      .filter((item) => {
        if (isLeafNode(item, { childField })) {
          return compare(item)
        }
        return item[childField]?.length
      })
  }
}
