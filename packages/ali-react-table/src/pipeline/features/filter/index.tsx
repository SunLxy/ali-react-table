import React, { Fragment, useRef } from "react"
import { TablePipeline, ArtColumn, isLeafNode, collectNodes, internals } from "../../../ali-react-table"
import { layeredFilter } from "../../../utils"
import { FilterItem, ValueType } from "../../../interfaces"
import styled from "styled-components"
import { HTMLAttributes, useMemo, useState } from "react"
import RcTooltip from "rc-tooltip"
import "rc-tooltip/assets/bootstrap.css"
import { CheckBoxGroup } from "../../../components/CheckBox"


const ListGroupBase = styled.div`
  max-height: 300px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  min-width: 200px;
`
const InputBase = styled.input`
  outline: none;
  border: 1px solid #d9d9d9;
  width: 100%;
  border-radius: 4px;
  padding: 5px;
  &::placeholder {
    color: #ccc;
  }
`

const ListGroupHeaderBase = styled.div`
  padding: 14px;
  box-sizing: border-box;
  padding-bottom: 0px;
`

const ListGroupBodyBase = styled.div`
  padding: 8px 10px;
  box-sizing: border-box;
  overflow: auto;
  flex: 1;
`
const ListGroupFooterBase = styled.div`
  border-top: 1px solid #d9d9d9;
  padding: 8px 10px;
  box-sizing: border-box;
`
const Svg = styled.svg`
  margin-left: 5px;
  margin-right: 5px;
`
const FilterHeaderCell = styled.div`
  display: flex;
  align-items: center;
`

function FilterIcon(props: HTMLAttributes<HTMLOrSVGElement>) {
  return <Svg
    viewBox="64 64 896 896"
    focusable="false"
    data-icon="filter"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path
      d="M349 838c0 17.7 14.2 32 31.8 32h262.4c17.6 0 31.8-14.3 31.8-32V642H349v196zm531.1-684H143.9c-24.5 0-39.8 26.7-27.5 48l221.3 376h348.8l221.3-376c12.1-21.3-3.2-48-27.7-48z" />
  </Svg>
}


export interface FilterHeaderCellProps {
  /** 在添加排序相关的内容之前 表头原有的渲染内容 */
  children?: React.ReactNode
  /** 当前列的配置 */
  column?: ArtColumn
  /** 选中的回调 */
  onSave?(items: any[]): void
  /**列表数据*/
  items?: string[]
  /**选中数据*/
  value?: ValueType[]
  /**格式化*/
  formate?: (value: string) => React.ReactNode
  /**是否模糊搜索*/
  isFuzzySearch?: boolean
  /**渲染*/
  Tooltip: typeof RcTooltip
}

function DefaultFilterHeaderCell(props: FilterHeaderCellProps) {
  const { children, value, items = [], onSave, formate, column, isFuzzySearch = true, Tooltip = RcTooltip } = props
  // 通过 justify-content 来与 col.align 保持对齐方向一致
  const justifyContent = column.align === 'right' ? 'flex-end' : column.align === 'center' ? 'center' : 'flex-start'

  const [tempValue, setTempValue] = useState(value)
  const activeStyle = useMemo(() => {
    if (Array.isArray(value) && value.length) {
      return { color: "#1677ff" }
    }
    return { color: "#bfbfbf" }
  }, [props.value])
  const onVisibleChange = (visible: boolean) => {
    if (!visible) {
      if (tempValue !== value) {
        onSave?.([...tempValue])
      }
    }
  }
  const searchValue = useMemo(() => {
    if (Array.isArray(tempValue)) {
      // @ts-ignore
      const fix = tempValue.find((it) => it?.isSearch)
      if (fix) {
        // @ts-ignore
        return fix?.text || ""
      }
    }
    return ''
  }, [tempValue])

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = `${event.target.value || ""}`.trim()
    if (value) {
      // @ts-ignore
      const fix = tempValue.find((it) => it?.isSearch)
      if (fix) {
        const newtempValue = (tempValue || []).map((it) => {
          // @ts-ignore
          if (it?.isSearch) {
            return { isSearch: true, text: value }
          }
          return it
        })
        setTempValue(() => [...newtempValue])
      } else {
        setTempValue((v) => [...v, { isSearch: true, text: value }])
      }
    } else {
      // @ts-ignore
      const newtempValue = (tempValue || []).filter((it) => !(it?.isSearch))
      setTempValue(() => [...newtempValue])
    }
  }

  return <FilterHeaderCell
    style={{ justifyContent }}
    onClick={(event) => {
      event.stopPropagation();
      event.preventDefault()
    }}
  >
    {children}
    <Tooltip
      onVisibleChange={onVisibleChange}
      placement="bottom"
      trigger={['click']}
      overlayStyle={{ opacity: 1 }}
      overlayInnerStyle={{
        background: "#fff",
        color: "#000",
        padding: 0,
      }}
      overlay={(<ListGroupBase>
        {isFuzzySearch ? <ListGroupHeaderBase>
          <InputBase placeholder="请输入模糊搜索值" value={searchValue} onChange={onChange} />
        </ListGroupHeaderBase> : <Fragment />}
        <ListGroupBodyBase>
          <CheckBoxGroup
            formate={formate}
            items={items}
            value={tempValue}
            onChange={(list) => setTempValue(list)}
          />
        </ListGroupBodyBase>
      </ListGroupBase>)}
    >
      <FilterIcon style={activeStyle} />
    </Tooltip>
  </FilterHeaderCell>
}

export interface FilterFeatureOptions {
  /** 更新过滤字段列表的回调函数 */
  onChangeFilter?(nextFilter: FilterItem[], code: string): void
  filterItems?: FilterItem[]

}

export type ArtColumnFeaturesFilter =
  ((itemData: any, value: FilterItem['value'], column: ArtColumn) => boolean)
  | {
    /**表格行数据*/
    items?: string[]
    /**过滤数据*/
    onFilter?: (itemData: any, value: FilterItem['value'], column: ArtColumn) => boolean
  }

export function filter(options: FilterFeatureOptions = {}) {

  return (pipeline: TablePipeline) => {
    const Tooltip = pipeline.ctx.components.Tooltip
    /**获取过滤参数  */
    const inputFilter: FilterItem[] = pipeline.getStateAtKey("filter") || options?.filterItems || []
    const dataSource = pipeline.getDataSource() // 获取数据
    const columns = pipeline.getColumns() //获取列
    pipeline.columns(processColumns(columns)) // 处理表头渲染过滤渲染
    pipeline.dataSource(processDataSource(dataSource)) // 处理渲染数据


    const onChangeValues = (code: string, values: ValueType[]) => {
      const list = (pipeline.getStateAtKey("filter") || []).filter((ite: FilterItem) => ite.code !== code);
      const newList = [...list].concat({ code, value: values })
      options?.onChangeFilter?.(newList, code)
      pipeline.setStateAtKey('filter', newList)
    }

    return pipeline

    /**列表数据处理*/
    function processDataSource(dataSource: any[]) {

      const filterColumnsMap = new Map(
        collectNodes(columns, 'leaf-only')
          .filter((col) => !!col.features?.filter)
          .map((col) => [col.code, col]),
      )

      return layeredFilter(dataSource, (item) => {
        let newItem = { ...item }
        for (let index = 0; index < inputFilter.length; index++) {
          const element = inputFilter[index];
          const column = filterColumnsMap.get(element.code)
          const filter = column?.features?.filter?.onFilter || column?.features?.filter
          if (typeof filter === "function") {
            newItem = filter(newItem, element.value, column)
          } else if (column) {
            const value = newItem[element.code]
            const newValue = (element.value || [])
            const finxd = (element.value || []).findIndex((ite: any) => {
              /**直接输入的值*/
              if (ite?.isSearch && ite?.text) {
                return `${value}`.includes(ite.text)
              }
              if (ite === undefined || ite === null) {
                return value === undefined || value === null
              }
              return ite === value
            })
            // 找不到相等数据的时候
            if (finxd < 0 && newValue.length) {
              newItem = false
              break;
            }
          }
        }
        return !!newItem
      })
    }

    /**列处理*/
    function processColumns(columns: ArtColumn[]) {
      return columns.map(dfs)
      function dfs(col: ArtColumn): ArtColumn {
        const result = { ...col }
        const filterTable = col.code && col.features?.filter;
        if (filterTable) {
          /**格式化*/
          const formate = col?.features?.filter?.formate
          const isFuzzySearch = col?.features?.filter?.isFuzzySearch
          let items = filterTable?.items || []
          if (!filterTable?.items) {
            items = Array.from(new Set(dataSource.map((ite) => {
              const value = ite[col.code]
              if (value === undefined || value === null) {
                return undefined
              }
              return value
            })))
          }
          const valueItem = inputFilter.find(ite => ite.code === col.code)
          // isFuzzySearch
          result.title = (<DefaultFilterHeaderCell
            Tooltip={Tooltip}
            isFuzzySearch={isFuzzySearch}
            value={valueItem?.value || []}
            formate={formate}
            onSave={(values) => onChangeValues(col.code, values)}
            items={items}
            column={col}
          >
            {internals.safeRenderHeader(col)}
          </DefaultFilterHeaderCell>)
        }
        if (!isLeafNode(col)) {
          result.children = col.children.map(dfs)
        }
        return result
      }
    }
  }

}