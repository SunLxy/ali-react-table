import cx from 'classnames'
import React, { Fragment } from 'react'
import { ExpansionCell, icons, InlineFlexCell } from '../../common-views'
import { ArtColumn } from '../../interfaces'
import { internals } from '../../internals'
import { collectNodes, isLeafNode, mergeCellProps, layeredGroup } from '../../utils'
import { TablePipeline } from '../pipeline'
import { groupMetaSymbol, groupLevelMetaSymbol } from "../../utils/group"
// export const groupMetaSymbol = Symbol('groupMetaSymbol')
// export const groupLevelMetaSymbol = Symbol('groupLevelMetaSymbol')

const groupingMetaSymbol = Symbol('row-grouping-meta')

function attachGroupingMeta(row: any) {
  return { [groupingMetaSymbol]: { expandable: !isLeafNode(row) }, ...row }
}

function getGroupingMeta(row: any): { isGroupHeader: boolean; expandable: boolean } {
  if (row[groupingMetaSymbol] == null) {
    return { isGroupHeader: false, expandable: false }
  }
  return { isGroupHeader: true, expandable: row[groupingMetaSymbol].expandable }
}

function rowGroupingRowPropsGetter(row: any) {
  if (getGroupingMeta(row).isGroupHeader) {
    return { className: 'alternative art_custom_group_lock_tr' }
  }
}

export interface DragRowGroupingFeatureOptions {
  indentSize?: number
}

export function dragRowGrouping(opts: DragRowGroupingFeatureOptions = {}) {
  const { indentSize = 0 } = opts

  return (pipeline: TablePipeline) => {
    const stateKey = 'dragGrouping'
    const indents = pipeline.ctx.indents

    const primaryKey = pipeline.ensurePrimaryKey('dragGrouping') as string
    if (typeof primaryKey !== 'string') {
      throw new Error('dragGrouping 仅支持字符串作为 primaryKey')
    }

    const openKeys: string[] = pipeline.getStateAtKey(stateKey) ?? []

    let openKeySet = new Set(openKeys)

    const onChangeOpenKeys = (nextKeys, key, action) => {
      pipeline.setStateAtKey(stateKey, nextKeys, { key, action })
    }

    const toggle = (rowKey: string) => {
      const expanded = openKeySet.has(rowKey)
      if (expanded) {
        onChangeOpenKeys(
          openKeys.filter((key) => key !== rowKey),
          rowKey,
          'collapse',
        )
      } else {
        onChangeOpenKeys([...openKeys, rowKey], rowKey, 'expand')
      }
    }

    const columns = pipeline.getColumns() // 获取列
    /**对列中的分组数据进行获取*/
    const groupColumns = columns.filter((column) => typeof column.groupIndex === 'number').sort((a, b) => a.groupIndex - b.groupIndex)

    return pipeline
      .mapDataSource(processPreData)
      .mapDataSource(processDataSource)
      .mapColumns(processColumns)
      .appendRowPropsGetter(rowGroupingRowPropsGetter)

    function processPreData(dataSource: any[]) {
      return layeredGroup(dataSource, groupColumns, primaryKey, []);
    }

    function processDataSource(input: any[]) {
      const result: any[] = []
      dfs(input, 0)
      function dfs(nodes: any[], depth: number) {
        if (nodes == null) {
          return
        }
        for (const node of nodes) {
          const rowKey = node[primaryKey]
          if (Array.isArray(node.children)) {
            const expanded = !openKeySet.has(rowKey)
            result.push({ ...attachGroupingMeta(node) })
            if (expanded)
              dfs(node.children, depth + 1)
          } else {
            result.push({ ...node })
          }
        }
      }
      return result
    }
    function processColumns(columns: ArtColumn[]) {
      if (columns.length === 0) {
        return columns
      }
      const columnFlatCount = collectNodes(columns, 'leaf-only').length
      const [firstCol, ...others] = columns
      if (typeof firstCol.groupIndex !== 'number' && !firstCol.isCheckBox) {
        return columns
      }
      const render = (value: any, row: any, rowIndex: number) => {
        const content = internals.safeRender(firstCol, row, rowIndex)
        const meta = getGroupingMeta(row)

        if (!meta.isGroupHeader || !meta.expandable) {
          return firstCol.render?.(value, row, rowIndex);
        }
        const expanded = !openKeySet.has(row[primaryKey])
        const expandCls = expanded ? 'expanded' : 'collapsed'
        const indent = indents.iconIndent + row[groupLevelMetaSymbol] * indents.iconWidth + 12

        return (
          <ExpansionCell style={{ left: indent }} className={cx('expansion-cell', 'art_custom_group_lock_td_body', expandCls)}>
            <div className='art_custom_group_lock_td_body-content' style={{ left: indent }}>
              <icons.CaretRight className={cx('expansion-icon', expandCls)} style={{ marginRight: indents.iconGap }} />
              {row.groupTitle ?? content}
            </div>
          </ExpansionCell>
        )
      }

      const getCellProps = (value: any, row: any, rowIndex: number) => {
        const meta = getGroupingMeta(row)
        if (!meta.isGroupHeader) {
          return
        }
        const { expandable } = meta
        const rowKey = row[primaryKey]
        const expanded = !openKeySet.has(rowKey)
        let onClick: any
        if (expandable) {
          onClick = (e: React.MouseEvent) => {
            e.stopPropagation()
            toggle(rowKey)
            // if (expanded) {
            //   onChangeOpenKeys(
            //     openKeys.filter((key) => key !== rowKey),
            //     rowKey,
            //     'collapse',
            //   )
            // } else {
            //   onChangeOpenKeys([...openKeys, rowKey], rowKey, 'expand')
            // }
          }
        }

        const prevProps = firstCol.getCellProps?.(value, row, rowIndex)
        return mergeCellProps(prevProps, {
          onClick,
          style: { cursor: expandable ? 'pointer' : undefined },
        })
      }

      return [
        {
          ...firstCol,
          width: firstCol.isCheckBox ? firstCol.width : indentSize,
          render,
          getCellProps(value, row, rowIndex) {
            return mergeCellProps(getCellProps(value, row, rowIndex), {
              className: "art_custom_group_lock_td",
            })
          },
          lock: true,
          headerCellProps: {
            ...firstCol.headerCellProps,
            className: "art_custom_group_lock_th" + (firstCol?.headerCellProps?.className ?? ''),
          },
          getSpanRect(value: any, row: any, rowIndex: number) {
            if (getGroupingMeta(row).isGroupHeader) {
              return { top: rowIndex, bottom: rowIndex + 1, left: 0, right: columnFlatCount }
            } else {
              return { top: rowIndex, bottom: rowIndex + 1, left: 0, right: groupColumns.length + (firstCol.isCheckBox ? 1 : 0) }
            }
          },
          isDragColumn: true
        },
        ...others.map((it) => {
          const newIte = { ...it }
          if (typeof it.groupIndex === 'number') {
            newIte.width = indentSize;
            newIte.lock = true;
            newIte.getCellProps = function (value, row, rowIndex) {
              return mergeCellProps(it.getCellProps?.(value, row, rowIndex) || {}, {
                className: "art_custom_group_lock_td"
              })
            }
            newIte.render = () => {
              return <Fragment />
            }
            newIte.headerCellProps = {
              ...it.headerCellProps,
              className: "art_custom_group_lock_th" + (it?.headerCellProps?.className ?? ''),
            }
          }
          return newIte
        }),
      ]
    }
  }
}
