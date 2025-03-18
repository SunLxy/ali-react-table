import { createRef, createContext, createElement, useRef, useContext, useEffect } from 'react';
import { ArtColumnMergePath } from "../interfaces"
import { BaseTableInstance } from "./instance"
import { pathIndexMetaSymbol, protoMetaSymbol } from "../utils/makeRecursiveMapper"

/**
 * 1. 可进行拖拽排序
 * 2. 拖拽放置其他区域
 * 3. 可在一个方法中进行数据操作
*/
// =================================最外层数据共享====================================================

export interface OnUpdatedOptions<T extends ArtColumnMergePath = ArtColumnMergePath> {
  /**拖拽开始区域实例*/
  form: DragBodyInstance;
  /**放置区域实例*/
  to?: DragBodyInstance;
  /**拖拽开始区域数据*/
  formListData: T[];
  /**放置区域数据*/
  toListData?: T[];
  /**列表数据*/
  columns?: T[]
  /**拖拽项*/
  formItem: DragItemInstance;
  /**放置项*/
  toItem?: DragItemInstance;
  /**放置下标*/
  toIndex?: number;
  /**横向位置*/
  horizontalPosition?: "left" | "right"
  /**纵向位置*/
  verticalPosition?: "top" | "bottom"
  /**当前是横向还是纵向*/
  direction?: "horizontal" | "vertical"
  /**位置*/
  position?: OnUpdatedOptions<T>['horizontalPosition'] | OnUpdatedOptions<T>['verticalPosition']
}

/**最外层包裹实例*/
export class DragInstance<T extends ArtColumnMergePath = ArtColumnMergePath> {
  /**表格实例*/
  tableInstance: BaseTableInstance
  /**实例*/
  listItemInstance: DragBodyInstance[] = []
  /**拖拽对象*/
  dragItem?: DragItemInstance
  /**放置区域所在实例*/
  toDragInstance?: DragBodyInstance
  /**拖拽所在实例*/
  formDragInstance?: DragBodyInstance
  /**更新操作*/
  onUpdated?: (parms: OnUpdatedOptions<T>) => void
  /**注册实例*/
  register = (item: DragBodyInstance) => {
    this.listItemInstance.push(item)
    return () => {
      this.listItemInstance = this.listItemInstance.filter(it => it !== item)
    }
  }

  /**过滤方法*/
  filter = <T extends ArtColumnMergePath = ArtColumnMergePath>(value: T, index: number, array: T[], itemData: T): boolean => {
    return value?.[pathIndexMetaSymbol] !== itemData?.[pathIndexMetaSymbol]
  }

  /**清理操作数据*/
  clear = () => {
    if (Array.isArray(this.listItemInstance)) {
      for (let index = 0; index < this.listItemInstance.length; index++) {
        const element = this.listItemInstance[index];
        element.clear?.()
      }
    }
    this.dragItem = undefined
    this.toDragInstance = undefined
    this.formDragInstance = undefined
  }

  /**设置分组下标*/
  setGroupIndex = <T extends ArtColumnMergePath = ArtColumnMergePath>(columns: T[]): T[] => {
    return columns.map((ite, groupIndex) => {
      if (ite?.[protoMetaSymbol]) {
        ite[protoMetaSymbol].groupIndex = groupIndex
      }
      return ({ ...ite, groupIndex })
    })
  }

  /**移除分组下标*/
  removeGroupIndex = <T extends ArtColumnMergePath = ArtColumnMergePath>(columns: T[]): T[] => {
    return columns.map((ite) => {
      const { groupIndex, ...rest } = ite;
      if (ite?.[protoMetaSymbol]) {
        delete ite[protoMetaSymbol].groupIndex
      }
      return { ...rest }
    }) as T[]
  }


  /**
   * 这个位置进行数据操作
   * 1. 如果存在放置区域则进行数据操作及其更新
   * 2. 如果不存在放置区域，则不进行数据执行
  */
  onDragEnd = () => {
    /**放置区和拖拽区相同*/
    if (this.toDragInstance && this.formDragInstance && this.toDragInstance === this.formDragInstance) {
      // 这个就是 排序操作
      const itemListData = [...(this.formDragInstance.itemListData || [])]
      const hoverIndex = this.formDragInstance.hoverIndex
      const hoverItem = this.formDragInstance.hoverItem
      const direction = this.formDragInstance.direction
      const horizontalPosition = this.formDragInstance.horizontalPosition
      const verticalPosition = this.formDragInstance.verticalPosition
      const position = direction === 'horizontal' ? horizontalPosition : verticalPosition
      /**放置区的数据*/
      let newDataList;
      // 处理数据
      // 根据这些参数 this.hoverIndex  this.direction   this.verticalPosition  this.horizontalPosition 处理数据
      if (this.dragItem && hoverItem && this.dragItem !== hoverItem && typeof hoverIndex === 'number') {
        const newList = [...itemListData]
        if (direction === 'horizontal' || direction === 'vertical') {
          if (horizontalPosition || verticalPosition) {
            newDataList = [...(newList.filter((it, index, arr) => this.filter(it, index, arr, this.dragItem?.itemData)))]
            if (hoverIndex === 0) {
              newDataList.unshift(this.dragItem.itemData)
            } else if (hoverIndex === newList.length - 1) {
              newDataList.push(this.dragItem.itemData)
            } else {
              newDataList.splice(hoverIndex, 0, this.dragItem.itemData)
            }
          }
          // if (horizontalPosition === 'left' || verticalPosition === 'top') {
          //   newDataList = [...(newList.filter((it, index, arr) => this.filter(it, index, arr, this.dragItem?.itemData)))]
          //   if (hoverIndex === 0) {
          //     newDataList.unshift(this.dragItem.itemData)
          //   } else {
          //     newDataList.splice(hoverIndex, 0, this.dragItem.itemData)
          //   }
          // } else if (horizontalPosition === 'right' || verticalPosition === 'bottom') {
          //   newDataList = [...(newList.filter((it, index, arr,) => this.filter(it, index, arr, this.dragItem?.itemData)))]
          //   if (hoverIndex === newList.length - 1) {
          //     newDataList.push(this.dragItem.itemData)
          //   } else {
          //     newDataList.splice(hoverIndex, 0, this.dragItem.itemData)
          //   }
          // }
        }
      }
      if (Array.isArray(newDataList) && this.dragItem && hoverItem) {
        let newList = [...newDataList]
        let columns = [...newDataList]
        const groupInstance = this.listItemInstance.find((it) => it.isGroup)
        const otherInstance = this.listItemInstance.find((it) => !it.isGroup)
        if (this.toDragInstance.isGroup) {
          newList = this.setGroupIndex(newList);
          columns = [...newList, ...(otherInstance?.itemListData || [])]
        } else {
          columns = [...(groupInstance?.itemListData || [])].concat([...newList])
        }
        if (this.onUpdated) {
          this.onUpdated?.({
            form: this.formDragInstance,
            formListData: [...newList],
            formItem: this.dragItem,
            columns: [...columns],
            toItem: hoverItem,
            verticalPosition,
            horizontalPosition,
            direction,
            toIndex: hoverIndex,
            position
          })
        } else {
          this.formDragInstance.updatedItemListData?.([...newList])
        }
      }
    } else if (this.toDragInstance && this.formDragInstance) {
      // 这个就是放入其他放置区
      // 处理数据
      // 根据这些参数 this.hoverIndex  this.direction   this.verticalPosition  this.horizontalPosition 处理数据
      // this.instance?.dragItem
      const itemListData = [...(this.toDragInstance.itemListData || [])]
      const newList = [...itemListData]
      const dragItem = this?.dragItem;
      let hoverIndex = this.toDragInstance.hoverIndex
      const hoverItem = this.toDragInstance.hoverItem
      const direction = this.toDragInstance.direction
      const horizontalPosition = this.toDragInstance.horizontalPosition
      const verticalPosition = this.toDragInstance.verticalPosition
      const position = direction === 'horizontal' ? horizontalPosition : verticalPosition

      // 如果放置区域不是分组区域的话，需要把分组区域的个数减去
      if (this.formDragInstance.isGroup && !this.toDragInstance.isGroup) {
        // hoverIndex
        hoverIndex = hoverIndex - this.formDragInstance.itemListData.length;
      }

      /**放置区的数据*/
      let newDataList;
      if (typeof hoverIndex === 'number' && dragItem && hoverItem) {
        if (direction === 'horizontal' || direction === 'vertical') {
          if (horizontalPosition === 'left' || verticalPosition === 'top') {
            newDataList = [...newList]
            if (hoverIndex === 0) {
              newDataList.unshift(dragItem.itemData)
            } else {
              newDataList.splice(hoverIndex, 0, dragItem.itemData)
            }
          } else if (horizontalPosition === 'right' || verticalPosition === 'bottom') {
            newDataList = [...newList]
            newDataList.splice(hoverIndex + 1, 0, this.dragItem.itemData)
          }
        }
      } else if (Array.isArray(itemListData) && itemListData.length === 0) {
        newDataList = [this.dragItem?.itemData]
      }
      /**判断是移入分组区还是移除分组区域*/
      if (Array.isArray(newDataList) && dragItem) {
        /**原拖拽区域的数据处理*/
        const oListData = [...(this.formDragInstance.itemListData || [])].filter((it) => it?.[pathIndexMetaSymbol] !== this.dragItem?.itemData?.[pathIndexMetaSymbol]) as T[]
        let formDataList = [...oListData]
        let toDataList = [...newDataList] as T[]
        let columns = []
        if (this.formDragInstance.isGroup) {
          formDataList = this.setGroupIndex(formDataList)
        }
        if (!this.formDragInstance.isGroup) {
          formDataList = this.removeGroupIndex(formDataList);
        }
        if (this.toDragInstance.isGroup) {
          // toDataList = toDataList.map((ite, groupIndex) => ({ ...ite, groupIndex }))
          toDataList = this.setGroupIndex(toDataList)
        }
        if (!this.toDragInstance.isGroup) {
          toDataList = this.removeGroupIndex(toDataList);
        }
        if (this.formDragInstance.isGroup) {
          columns = [...formDataList, ...toDataList]
        } else {
          columns = [...toDataList, ...formDataList]
        }
        if (this.onUpdated) {
          this.onUpdated?.({
            form: this.formDragInstance,
            to: this.toDragInstance,
            formListData: [...formDataList],
            toListData: [...toDataList],
            columns: [...columns],
            formItem: dragItem,
            toItem: hoverItem,
            verticalPosition,
            horizontalPosition,
            direction,
            toIndex: hoverIndex,
            position
          })
        } else {
          this.formDragInstance.updatedItemListData?.([...formDataList])
          this.toDragInstance.updatedItemListData?.([...toDataList])
        }
      }
    }
    this.clear()
  }

}

interface ProviderProps<T = DragInstance> {
  children?: React.ReactNode
  value?: T
}

export const useDragInstance = <T extends ArtColumnMergePath = ArtColumnMergePath>(instance?: DragInstance<T>): [DragInstance<T>] => {
  const ref = useRef<DragInstance>(undefined)
  if (!ref.current) {
    if (instance) {
      ref.current = instance
    } else {
      ref.current = new DragInstance()
    }
  }
  return [ref.current]
}
const ContextDragInstance = createContext(new DragInstance())
export const DragInstanceProvider = <T extends ArtColumnMergePath = ArtColumnMergePath>(props: ProviderProps<DragInstance<T>>) => {
  const [instance] = useDragInstance(props.value)
  return createElement(ContextDragInstance.Provider, { value: instance, children: props.children })
}
export const useDragInstanceProvider = <T extends ArtColumnMergePath = ArtColumnMergePath>() => useContext<DragInstance<T>>(ContextDragInstance)

// ========================================拖拽=============================================

interface DragInstanceOptions {
  direction: "horizontal" | "vertical",
}

export class DragBodyInstance<T extends ArtColumnMergePath = ArtColumnMergePath> {
  /**整个包裹节点(只有放置区域才有值)*/
  dom = createRef<HTMLDivElement>()

  dragInstance?: DragInstance;
  /**是否分组区域数据*/
  isGroup?: boolean
  list: DragItemInstance[] = []
  /**拖拽对象*/
  dragItem?: DragItemInstance
  /**当前移入的对象*/
  hoverItem?: DragItemInstance
  /**横向位置*/
  horizontalPosition?: "left" | "right"
  /**纵向位置*/
  verticalPosition?: "top" | "bottom"
  /**当前是横向还是纵向*/
  direction?: "horizontal" | "vertical"
  /**是否离开当前放置区域*/
  isLeave?: boolean
  /**所属下标位置*/
  hoverIndex?: number;
  /**数据*/
  itemListData: T[] = []

  /**更新数据*/
  updatedItemListData?: (dataList: T[]) => void

  constructor(options: DragInstanceOptions) {
    this.direction = options.direction;
  }

  /**存储子节点*/
  register = (item: DragItemInstance) => {
    this.list.push(item)
    return () => {
      this.list = this.list.filter(it => it !== item)
    }
  }

  /**开始拖拽*/
  onDragStart = (item: DragItemInstance, event: React.DragEvent<HTMLSpanElement>) => {
    this.dragItem = item;
    if (this.dragInstance) {
      this.dragInstance.dragItem = item;
      this.dragInstance.formDragInstance = this;
    }
  }

  /**结束拖拽*/
  onDragEnd = (item: DragItemInstance, event: React.DragEvent<HTMLSpanElement>) => {
    if (this.hoverItem) {
      this.removeClassList(this.hoverItem.parentDOM.current)
    }
    if (this.dragInstance?.onDragEnd) {
      this.dragInstance.onDragEnd()
    }
  }

  /**进入放置区*/
  onDragEnter: React.DragEventHandler<HTMLDivElement> = (event) => {
    this.isLeave = false
  }

  /**离开放置区*/
  onDragLeave: React.DragEventHandler<HTMLDivElement> = (event) => {
    if (this.hoverItem) {
      this.removeClassList(this.hoverItem.parentDOM.current)
    }
    this.isLeave = true
    this.hoverIndex = undefined;
    this.hoverItem = undefined
  }

  /**放置*/
  onDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    if (this.hoverItem) {
      this.removeClassList(this.hoverItem.parentDOM.current)
    }
    if (this.dragInstance) {
      this.dragInstance.toDragInstance = this;
    }
  }

  /**经过*/
  onDragOver = (event: React.DragEvent<HTMLDivElement>,) => {
    event.preventDefault();
    this.calc(event.clientX, event.clientY)
  }

  private removeClassList = (dom?: HTMLDivElement | null) => {
    if (dom) {
      dom?.classList.remove("draggover-left")
      dom?.classList.remove("draggover-right")
      dom?.classList.remove("draggover-top")
      dom?.classList.remove("draggover-bottom")
    }
  }

  /**计算所在位置*/
  calc = (x: number, y: number,) => {
    const list = this.list.sort((a, b) => a.sort - b.sort)
    /**原始位置*/
    for (let index = 0; index < list.length; index++) {
      const element = list[index];
      const box = element.parentDOM.current?.getBoundingClientRect()
      // 判断是否在某个范围
      // 判断 X 轴
      // left + 宽度 就是这个节点所在的位置范围
      const startW = (box?.left || 0);
      const endW = (box?.left || 0) + (box?.width || 0);
      // 判断 Y 轴
      // top + 高度
      const startH = (box?.top || 0);
      const endH = (box?.top || 0) + (box?.height || 0);
      if (startW <= x && endW >= x && startH <= y && endH >= y) {
        this.hoverItem = element;
        this.hoverIndex = index;
        this.removeClassList(element.parentDOM.current)
      } else {
        this.removeClassList(element.parentDOM.current)
      }
    }
    if (this.hoverItem && this.dragItem) {
      if (this.hoverItem !== this.dragItem) {
        const hoverBox = this.hoverItem.parentDOM.current?.getBoundingClientRect()
        const dragBox = this.dragItem.parentDOM.current?.getBoundingClientRect()
        // 判断左侧还是右侧
        if ((hoverBox?.left || 0) > (dragBox?.left || 0)) {
          this.horizontalPosition = "right"
        } else if ((hoverBox?.left || 0) < (dragBox?.left || 0)) {
          this.horizontalPosition = "left"
        }
        // 判断是上还是下
        if ((hoverBox?.top || 0) > (dragBox?.top || 0)) {
          this.verticalPosition = 'bottom'
        } else if ((hoverBox?.top || 0) < (dragBox?.top || 0)) {
          this.verticalPosition = 'top'
        }
        if (this.direction === 'horizontal') {
          // 一行的
          this.hoverItem?.parentDOM.current?.classList.add(`draggover-${this.horizontalPosition}`)
        } else if (this.direction === 'vertical') {
          this.hoverItem?.parentDOM.current?.classList.add(`draggover-${this.verticalPosition}`)
        }
      }
    } else if (this.hoverItem) {
      // 不在的 移动节点的所在放置区，在另一个放置区
      const hoverBox = this.hoverItem.parentDOM.current?.getBoundingClientRect()
      if (this.direction === 'horizontal') {
        const startW = (hoverBox?.left || 0);
        const endW = (hoverBox?.left || 0) + (hoverBox?.width || 0);
        const middleW = endW / 2
        if (x >= startW && endW >= x) {
          if (x >= middleW) {
            this.horizontalPosition = "right"
          } else {
            this.horizontalPosition = "left"
          }
          this.hoverItem?.parentDOM.current?.classList.add(`draggover-${this.horizontalPosition}`)
        }
      } else if (this.direction === 'vertical') {
        const startH = (hoverBox?.top || 0);
        const endH = (hoverBox?.top || 0) + (hoverBox?.height || 0);
        const middleH = endH / 2
        if (y >= startH && endH >= y) {
          if (y >= middleH) {
            this.verticalPosition = "bottom"
          } else {
            this.verticalPosition = "top"
          }
          this.hoverItem?.parentDOM.current?.classList.add(`draggover-${this.verticalPosition}`)
        }
      }
    }
    // 在这个区域，但是没有移入的项，取最后一个
    if (!this.hoverItem && this.isGroup && list.length) {
      // 放置区
      const item = list[list.length - 1]
      this.hoverIndex = list.length - 1;
      this.hoverItem = item;
      if (this.direction === 'horizontal') {
        this.horizontalPosition = "right"
      } else {
        this.verticalPosition = "bottom"
      }
    }
  }

  /**清理数据*/
  clear = () => {
    this.dragItem = undefined
    this.hoverItem = undefined
    this.horizontalPosition = undefined
    this.verticalPosition = undefined
    this.isLeave = undefined
    this.hoverIndex = undefined
  }
}

export const useDragBodyInstance = <T extends ArtColumnMergePath = ArtColumnMergePath>(instance?: DragBodyInstance<T>, options?: DragInstanceOptions): [DragBodyInstance<T>] => {
  const ref = useRef<DragBodyInstance<T>>(undefined)
  if (!ref.current) {
    if (instance) {
      ref.current = instance
    } else {
      ref.current = new DragBodyInstance<T>({ direction: 'vertical', ...options })
    }
  }
  return [ref.current]
}

const ContextDragBodyInstance = createContext(new DragBodyInstance({ direction: 'vertical' }))

export const DragBodyInstanceProvider = <T extends ArtColumnMergePath = ArtColumnMergePath>(props: ProviderProps<DragBodyInstance<T>> & { options?: DragInstanceOptions }) => {
  const [instance] = useDragBodyInstance(props.value, props.options)
  const dataInstance = useDragInstanceProvider()
  instance.dragInstance = dataInstance
  useEffect(() => {
    const register = instance?.dragInstance?.register || dataInstance.register
    const onMount = register(instance)
    return () => {
      onMount?.()
    }
  }, [])
  return createElement(ContextDragBodyInstance.Provider, { value: instance, children: props.children })
}

export const useDragBodyInstanceProvider = <T extends ArtColumnMergePath = ArtColumnMergePath>() => useContext<DragBodyInstance<T>>(ContextDragBodyInstance)

// ====================================拖拽项=================================================

/**每个拖拽项的实例*/
export class DragItemInstance {
  /**外部整个包裹节点*/
  parentDOM = createRef<HTMLTableHeaderCellElement>()
  /**存储数据*/
  itemData?: ArtColumnMergePath;
  /**排序*/
  sort: number = 0;
  /**是否分组区域数据*/
  isGroup?: boolean
}

export const useDragItemInstance = (instance?: DragItemInstance): [DragItemInstance] => {
  const ref = useRef<DragItemInstance>(undefined)
  if (!ref.current) {
    if (instance) {
      ref.current = instance
    } else {
      ref.current = new DragItemInstance()
    }
  }
  return [ref.current]
}

const ContextDragItemInstance = createContext(new DragItemInstance())
export const DragItemInstanceProvider = (props: ProviderProps<DragItemInstance>) => {
  const [instance] = useDragItemInstance(props.value)
  return createElement(ContextDragItemInstance.Provider, { value: instance, children: props.children })
}
export const useDragItemInstanceProvider = () => useContext(ContextDragItemInstance)
