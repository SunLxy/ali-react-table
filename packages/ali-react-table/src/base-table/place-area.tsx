import React, { Fragment, useEffect } from "react"
import {
  useDragBodyInstance, DragBodyInstanceProvider,
  useDragItemInstance, useDragBodyInstanceProvider
} from "../pipeline/dragInstance"
import { StyleArtPlaceArea, StyleArtPlaceAreaItem } from "./styles"
import type { ArtColumnMergePath } from "../interfaces"


interface PlaceAreaItemProps {
  column: ArtColumnMergePath
  sort: number
}

const PlaceAreaItem = (props: PlaceAreaItemProps) => {
  const { column, sort } = props
  const dragInstance = useDragBodyInstanceProvider()
  const [itemInstance] = useDragItemInstance()
  itemInstance.itemData = column
  itemInstance.isGroup = true;
  itemInstance.sort = sort;

  useEffect(() => {
    const om = dragInstance.register(itemInstance)
    return () => om()
  }, [props.column])

  const onDragStart: React.DragEventHandler<HTMLSpanElement> = (event) => {
    itemInstance.parentDOM.current?.classList.add('dragging')
    dragInstance.onDragStart(itemInstance, event)
  }

  const onDragEnd: React.DragEventHandler<HTMLSpanElement> = (event) => {
    itemInstance.parentDOM.current?.classList.remove('dragging')
    itemInstance.parentDOM.current?.removeAttribute('draggable');
    dragInstance.onDragEnd(itemInstance, event)
  }

  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (event) => {
    itemInstance.parentDOM.current?.setAttribute('draggable', "true")
  }

  const onMouseLeave: React.MouseEventHandler<HTMLDivElement> = (event) => {
    itemInstance.parentDOM.current?.removeAttribute('draggable')
  }

  return <StyleArtPlaceAreaItem
    onDragEnd={onDragEnd}
    onDragStart={onDragStart}
    ref={itemInstance.parentDOM}
    onMouseMove={onMouseMove}
    onMouseLeave={onMouseLeave}
  >
    {column.title ?? column.name ?? column.code}
  </StyleArtPlaceAreaItem>
}
export interface PlaceAreaProps {
  columns: ArtColumnMergePath[]
}

export const PlaceArea = (props: PlaceAreaProps) => {
  const { columns = [] } = props
  const [dragInstance] = useDragBodyInstance(undefined, { direction: 'horizontal' })
  dragInstance.itemListData = columns;
  dragInstance.isGroup = true;

  return <DragBodyInstanceProvider value={dragInstance}>
    <StyleArtPlaceArea
      onDragEnter={dragInstance.onDragEnter}
      onDragLeave={dragInstance.onDragLeave}
      onDrop={dragInstance.onDrop}
      onDragOver={dragInstance.onDragOver}
      ref={dragInstance.dom}
    >
      {columns.map((item, index) => {
        if (item.visible === false) {
          return <Fragment key={`${item.code}_${index}`} />
        }
        return <PlaceAreaItem sort={index} column={item} key={`${item.code}_${index}`} />
      })}
      <div className="place-area-placeholder">拖动列标题至此以进行列分组</div>
    </StyleArtPlaceArea>
  </DragBodyInstanceProvider>
}