import React, { useEffect } from "react"
import {
  useDragBodyInstance, DragBodyInstanceProvider,
  useDragItemInstance, useDragBodyInstanceProvider
} from "../pipeline/dragInstance"
import { StyleArtPlaceArea, StyleArtPlaceAreaItem } from "./styles"

const PlaceAreaItem = (props: any) => {
  const dragInstance = useDragBodyInstanceProvider()
  const [itemInstance] = useDragItemInstance()

  useEffect(() => {
    const om = dragInstance.register(itemInstance)
    return () => om()
  }, [props.itemData])

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

  </StyleArtPlaceAreaItem>
}

export const PlaceArea = () => {
  const [dragInstance] = useDragBodyInstance(undefined, { direction: 'horizontal' })

  return <DragBodyInstanceProvider value={dragInstance}>
    <StyleArtPlaceArea
      onDragEnter={dragInstance.onDragEnter}
      onDragLeave={dragInstance.onDragLeave}
      onDrop={dragInstance.onDrop}
      onDragOver={dragInstance.onDragOver}
    >

    </StyleArtPlaceArea>
  </DragBodyInstanceProvider>
}