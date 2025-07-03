
import React, { useMemo } from "react"
import styled from "styled-components"
const preCls = 'ali-simple-table-button'

const ButtonBase = styled.button`
  font-size: 12px;
  height: 32px;
  padding: 4px 15px;
  border-radius: 6px;
  outline: none;
  position: relative;
  display: inline-block;
  font-weight: 400;
  white-space: nowrap;
  text-align: center;
  background-image: none;
  background: 0 0;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  user-select: none;
  touch-action: manipulation;
  color: rgba(0, 0, 0, 0.88);
  box-sizing: border-box;
  &.${preCls}-default{
    background: var(--ali-table-overlay-inner-btn-bg,#ffffff);
    color:var(--ali-table-overlay-inner-btn-color,rgba(0, 0, 0, 0.88));
    &:hover{
      color: var(--primary-color,#1677ff);
    }
  }
  &.${preCls}-primary{
    color: #fff;
    background: var(--primary-color,#1677ff);
  }

  &.${preCls}-sm{
    font-size: 12px;
    height: 24px;
    padding: 0px 7px;
    border-radius: 4px;
  }
  &.${preCls}-bordered {
    border-color:var(--ali-table-overlay-inner-border-color,#d9d9d9);
    &:hover{
      border-color:var(--primary-color,#1677ff);
    }
  }


`
const ButtonTextBase = styled.span`
  
`

export interface ButtonProps extends Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "ref" | "type"> {
  htmlType?: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>['type']
  type?: "primary"
  size?: "sm"
  bordered?: boolean
}

export const Button = (props: ButtonProps) => {
  const { children, htmlType, type = 'default', className = '', size = 'sm', bordered = true, ...other } = props

  const cls = useMemo(() => {
    return [preCls, type && `${preCls}-${type}`, size && `${preCls}-${size}`, bordered && `${preCls}-bordered`,].filter(Boolean).join(' ')
  }, [type, size])

  return <ButtonBase {...other} type={htmlType} className={`${cls} ${className}`} >
    <ButtonTextBase>{children}</ButtonTextBase>
  </ButtonBase>
}