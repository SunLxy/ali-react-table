import { AbstractTreeNode } from '../interfaces'

export default function isLeafNode(node: AbstractTreeNode, nodeMeta?: { depth: number; expanded: boolean; rowKey: string, childFiled?: string }) {
  if (nodeMeta?.childFiled) {
    return node?.[nodeMeta.childFiled] == null || node?.[nodeMeta.childFiled]?.length === 0
  }
  return node.children == null || node.children.length === 0
}
