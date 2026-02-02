import { ArtColumn, BaseTable, useTablePipeline, features, protoMetaSymbol, CheckBox as ACheckBox, GroupUtils } from 'ali-react-table'
import { Button, Radio, Switch, Typography, Checkbox } from 'antd'

import cx from 'classnames'
import numeral from 'numeral'
import React, { createRef, useEffect, useReducer, useRef, useState } from 'react'
import styled, { css } from 'styled-components'
import { AntdBaseTable, HippoBaseTable } from 'website/src/assets'

const DarkBaseTable: any = styled(BaseTable)`
  --bgcolor: #333;
  --header-bgcolor: #45494f;
  --hover-bgcolor: #46484a;
  --header-hover-bgcolor: #606164;
  --highlight-bgcolor: #191a1b;
  --header-highlight-bgcolor: #191a1b;
  --color: #dadde1;
  --header-color: #dadde1;
  --lock-shadow: rgb(37 37 37 / 0.5) 0 0 6px 2px;
  --border-color: #3c4045;
`

function amount(v: any) {
  if (v === '-' || v == null) {
    return '-'
  }
  return numeral(v).format('0,0')
}

function repeat<T>(arr: T[], n: number) {
  let result: T[] = []
  for (let i = 0; i < n; i++) {
    result = result.concat(arr)
  }
  return result
}

// prettier-ignore
const dataSource = [
  {
    __id: "3",
    provinceName: '湖北省',
    count: 600,
    children: [
      {
        __id: "3-1",
        provinceName: '湖北省',
        city: "城市1",
        count: 200,
        childinfo: [
          { __id: "3-1-1", provinceName: '湖北省', city: "城市1", count: 100, time: "2025-10-12" },
          { __id: "3-1-2", provinceName: '湖北省', city: "城市1", count: 100, time: "2025-10-13" },
        ]
      },
      {
        __id: "3-2",
        provinceName: '湖北省',
        city: "城市2",
        count: 200,
        childinfo: [
          { __id: "3-2-1", provinceName: '湖北省', city: "城市2", count: 100, time: "2025-10-12" },
          { __id: "3-2-2", provinceName: '湖北省', city: "城市2", count: 100, time: "2025-10-13" },
        ]
      },
      {
        __id: "3-3",
        provinceName: '湖北省',
        city: "城市3",
        count: 200,
        childinfo: [
          { __id: "3-3-1", provinceName: '湖北省', city: "城市3", count: 100, time: "2025-10-12" },
          { __id: "3-3-2", provinceName: '湖北省', city: "城市3", count: 100, time: "2025-10-13" },
        ]
      },
    ]
  },
  { __id: "4", provinceName: '湖北省', count: 100 },
  { __id: "5", provinceName: '湖北省', count: 100 },
  { __id: "6", provinceName: '湖北省', count: 100 },
]

const beautifulScrollbarStyleMixin = css`
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: #ccc;
    border: 1px solid #eaeaea;

    &:hover {
      background: #6e6e6e;
    }
  }

  ::-webkit-scrollbar-track {
    background: #eaeaea;
  }
`

const AppDivAppDiv = styled.div.withConfig({
  // @ts-ignore
  componentId: 'app-div',
})`
  display: flow-root;

  &.has-custom-scrollbar {
    .art-table-wrapper,
    .art-horizontal-scroll-container {
      ${beautifulScrollbarStyleMixin}
    }
  }

  tfoot {
    --bgcolor: var(--hover-bgcolor);
  }

  .control-grid {
    display: grid;
    grid: auto-flow / repeat(auto-fill, minmax(250px, auto));
    gap: 16px;

    .item {
      padding: 4px;
      outline: 1px dashed #ccc;
      display: flex;
      gap: 4px;
      flex-flow: column;
      align-items: start;
    }
  }
`

export function DemoApp() {
  const [newColumns,] = useState<any[]>(([
    { code: 'provinceName', name: '省份', width: 150, lock: true },
    { code: 'city', name: '城市', width: 100, },
    { code: 'time', name: '时间', width: 100, },
    { code: 'count', name: '总数', width: 100, },
  ]))
  const appDivRef = useRef<HTMLDivElement>()
  const p = useTablePipeline({ components: { Checkbox: ACheckBox } })
    .primaryKey('__id')
    .input({
      dataSource: dataSource,
      columns: newColumns
    })
    .use(features.treeMode({
      positionKeysMap: {
        0: {
          code: 'provinceName',
          childFiled: 'children'
        },
        1: {
          code: 'city',
          childFiled: 'childinfo'
        },
      }
    }))

  const dpp = { ...p.getProps() }

  return (
    <AppDivAppDiv ref={appDivRef} className={cx({ 'has-custom-scrollbar': true })}>
      <BaseTable
        className={cx('bordered', 'compact', {})}
        useArtTableBorder
        {...dpp}
        useVirtual={{ header: false, vertical: true }}
      />
    </AppDivAppDiv>
  )
}
