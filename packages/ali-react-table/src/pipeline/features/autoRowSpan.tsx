import type { SpanRect } from '../../interfaces'
import { internals } from '../../internals'
import { isLeafNode, makeRecursiveMapper } from '../../utils'
import { TablePipeline } from '../pipeline'

function isIdentity(x: any, y: any, prevRow: any, row: any, keys?: string[]) {
  if (Array.isArray(keys) && keys.length) {
    const prevValues = keys.map((key) => prevRow[key]).join('_')
    const values = keys.map((key) => row[key]).join('_')
    return prevValues === values
  }
  return x === y
}

export function autoRowSpan() {
  return function autoRowSpanStep(pipeline: TablePipeline) {
    const dataSource = pipeline.getDataSource()

    return pipeline.mapColumns(
      makeRecursiveMapper((col, { startIndex, endIndex }) => {
        // 如果是分组列节点，不做处理
        if (!col.features?.autoRowSpan || typeof col.groupIndex === 'number' || col.isDragColumn) {
          return col
        }

        if (!isLeafNode(col)) {
          return col
        }
        /**判断哪些值相等才进行合并*/
        const keys = col.features.autoRowSpanKeys as string[]
        const shouldMergeCell = typeof col.features.autoRowSpan === 'function' ? col.features.autoRowSpan : isIdentity

        const spanRects: SpanRect[] = []
        let lastBottom = 0
        let prevValue: any = null
        let prevRow: any = null

        for (let rowIndex = 0; rowIndex < dataSource.length; rowIndex++) {
          const row = dataSource[rowIndex]
          const value = internals.safeGetValue(col, row, rowIndex)

          if (rowIndex === 0 || !shouldMergeCell(prevValue, value, prevRow, row, keys)) {
            const spanRect: SpanRect = {
              top: lastBottom,
              bottom: rowIndex,
              left: startIndex,
              right: endIndex,
            }
            for (let i = lastBottom; i < rowIndex; i++) {
              spanRects.push(spanRect)
            }
            lastBottom = rowIndex
          }
          prevValue = value
          prevRow = row
        }

        for (let i = lastBottom; i < dataSource.length; i++) {
          spanRects.push({
            top: lastBottom,
            bottom: dataSource.length,
            left: startIndex,
            right: endIndex,
          })
        }

        return {
          ...col,
          getSpanRect(value: any, row: any, rowIndex: number) {
            return spanRects[rowIndex]
          },
        }
      }),
    )
  }
}
