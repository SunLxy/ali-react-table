
import { AbstractTreeNode, ArtColumn, ArtColumnMergePath } from "../interfaces"
import { pathIndexMetaSymbol, protoMetaSymbol } from "./makeRecursiveMapper"

export const groupMetaSymbol = Symbol('groupMetaSymbol')
export const groupLevelMetaSymbol = Symbol('groupLevelMetaSymbol')
export const groupColumnNameMetaSymbol = Symbol('groupColumnNameMetaSymbol')


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
        return { ...item }
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
          [groupColumnNameMetaSymbol]: firstGroupItem.name
        } as undefined as T)
      } else {
        const newKeys = valueKey + "_" + textValue + "_" + newParentKey + "_" + level;
        openKeys.push(newKeys)
        newArray.push({
          ...parentObj,
          children: groupItemList,
          groupTitle: textValue,
          [groupColumnNameMetaSymbol]: firstGroupItem.name,
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

export class GroupUtils {
  static groupMetaSymbol = groupMetaSymbol;
  static groupLevelMetaSymbol = groupLevelMetaSymbol;
  static protoMetaSymbol = protoMetaSymbol;
  static pathIndexMetaSymbol = pathIndexMetaSymbol;
  static groupColumnNameMetaSymbol = groupColumnNameMetaSymbol;
  /**分组数据(转换成二维数组)*/
  static groupBy = groupBy;
  /**设置分组下标*/
  static setGroupIndex = <T extends ArtColumnMergePath = ArtColumnMergePath>(columns: T[]): T[] => {
    return columns.map((ite, groupIndex) => {
      if (ite?.[protoMetaSymbol]) {
        ite[protoMetaSymbol].groupIndex = groupIndex
      }
      return ({ ...ite, groupIndex })
    })
  }

  /**移除分组下标*/
  static removeGroupIndex = <T extends ArtColumnMergePath = ArtColumnMergePath>(columns: T[]): T[] => {
    return columns.map((ite) => {
      const { groupIndex, ...rest } = ite;
      if (ite?.[protoMetaSymbol]) {
        delete ite[protoMetaSymbol].groupIndex
      }
      return { ...rest }
    }) as T[]
  }

  /**一个数组中进行移动数据*/
  static replaceColumns = (columns: ArtColumnMergePath[], startPath: string, movePath: string) => {
    /**移动的数据下标*/
    /**需要移动的数据下标*/
    const startColumn = columns.find((column) => column[pathIndexMetaSymbol] === startPath);
    const moveIndex = columns.findIndex((column) => column[pathIndexMetaSymbol] === movePath);
    const newColumns = columns.filter((column) => column[pathIndexMetaSymbol] !== startPath);
    if (moveIndex === 0) {
      newColumns.unshift(startColumn)
    } else if (moveIndex === columns.length - 1) {
      newColumns.push(startColumn)
    } else {
      newColumns.splice(moveIndex, 0, startColumn)
    }
    return [...newColumns]
  }

  /**两个个数组中进行移动数据*/
  static replaceColumns2 = (startColumns: ArtColumnMergePath[], moveColumns: ArtColumnMergePath[], startPath: string, movePath: string, isAdd1: boolean) => {
    const startColumn = startColumns.find((column) => column[pathIndexMetaSymbol] === startPath);
    const moveIndex = moveColumns.findIndex((column) => column[pathIndexMetaSymbol] === movePath);
    const newStartColumns = startColumns.filter((column) => column[pathIndexMetaSymbol] !== startPath);
    const newMoveColumns = [...moveColumns]
    if (isAdd1) {
      newMoveColumns.splice(moveIndex + 1, 0, startColumn)
    } else {
      newMoveColumns.splice(moveIndex, 0, startColumn)
    }
    return {
      moveColumns: [...newMoveColumns],
      startColumns: [...newStartColumns],
    }
  }
}
