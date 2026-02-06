import isLeafNode from './isLeafNode'
import { AbstractTreeNode, PositionKeysMapType } from '../interfaces'

/** 对树状结构的数据进行排序.
 * layeredSort 是一个递归的过程，针对树上的每一个父节点，该函数都会重新对其子节点数组（children) 进行排序.
 * */
export default function layeredSort<T extends AbstractTreeNode>(array: T[], compare: (x: T, y: T) => number, positionKeysMap?: PositionKeysMapType): T[] {
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
        return { ...row, [childField]: dfs(row.children as T[], depth + 1) }
      })
      .sort(compare)
  }
}
