import { AbstractTreeNode } from '../interfaces'

export default function isLeafNode(node: AbstractTreeNode, nodeMeta?: { depth?: number; expanded?: boolean; rowKey?: string, childField?: string }) {
  if (nodeMeta?.childField) {
    return node?.[nodeMeta.childField] == null || node?.[nodeMeta.childField]?.length === 0
  }
  return node.children == null || node.children.length === 0
}
