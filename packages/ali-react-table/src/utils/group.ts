
import { AbstractTreeNode, ArtColumn } from "../interfaces"

export const groupMetaSymbol = Symbol('groupMetaSymbol')
export const groupLevelMetaSymbol = Symbol('groupLevelMetaSymbol')

function groupBy<T extends AbstractTreeNode>(array: T[], key: string) {
  const newList: Array<T[]> = []
  const keyMap: Map<string | number | boolean, number> = new Map([])
  for (let index = 0; index < array.length; index++) {
    const itemData = array[index];
    const value = itemData[key];
    if (keyMap.has(value)) {
      const ind = keyMap.get(value);
      newList[ind].push(itemData)
    } else {
      const length = newList.length
      keyMap.set(value, length)
      newList[length] = [itemData]
    }
  }
  return newList;
}

const getValue = (value) => {
  if (typeof value === "string") {
    return value
  }
  if (typeof value === "number") {
    return value.toString()
  }
  if (typeof value === "boolean") {
    return value.toString()
  }
  if (value === undefined) {
    return `${undefined}`
  }
  if (value === null) {
    return `${null}`
  }
  return value
}

/** 对树状结构的数据进行分组.
 * layeredGroup 是一个递归的过程，
 * */
export function layeredGroup<T extends AbstractTreeNode>(
  array: T[],
  oldGroup: ArtColumn[],
  primaryKey: string | ((row: any) => string),
  openKeys: string[],
  parentKey: string = '',
  level: number = 0,
  parentObj = {}
): T[] {
  const group = [...oldGroup]
  // 每次取第一个进行分组，剩余的进行二次循环
  const firstGroupItem = group.shift()
  if (firstGroupItem) {
    const newParentKey = parentKey ? parentKey + "_" + firstGroupItem.code : firstGroupItem.code
    const groupData = groupBy<T>(array, firstGroupItem.code)
    const lg = groupData.length
    const newArray: T[] = []

    for (let index = 0; index < lg; index++) {
      const itemList = groupData[index];
      const groupItemList = (itemList || []).map((item: T) => {
        return { ...item, ___default_level: level }
      })
      const value = groupItemList[0][firstGroupItem.code]
      const textValue = getValue(value)
      const rowKey = typeof primaryKey === "function" ? primaryKey(groupItemList[0]) : primaryKey
      const valueKey = groupItemList[0][rowKey]

      if (group.length) {
        const list = layeredGroup<T>(groupItemList, group, primaryKey, openKeys, newParentKey, level + 1, { ...parentObj, [firstGroupItem.code]: value, })
        const newKeys = valueKey + "_" + textValue + "_" + newParentKey + "_" + level;
        openKeys.push(newKeys)
        newArray.push({
          ...parentObj,
          children: list,
          groupTitle: textValue,
          [firstGroupItem.code]: value,
          [rowKey]: newKeys,
          [groupLevelMetaSymbol]: level,
          [groupMetaSymbol]: true,
        } as undefined as T)
      } else {
        const newKeys = valueKey + "_" + textValue + "_" + newParentKey + "_" + level;
        openKeys.push(newKeys)
        newArray.push({
          ...parentObj,
          children: groupItemList,
          groupTitle: textValue,
          [firstGroupItem.code]: value,
          [rowKey]: newKeys,
          [groupLevelMetaSymbol]: level,
          [groupMetaSymbol]: true,
        } as undefined as T)
      }
    }
    return newArray
  }
  return array
}
