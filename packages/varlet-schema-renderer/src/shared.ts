import { isPlainObject, isArray, isString } from '@varlet/shared'
import {
  BuiltInSchemaNodeNames,
  BuiltInSchemaNodeBindingTypes,
  type SchemaTextNode,
  type SchemaPageNode,
  type SchemaNode
} from './types'

export function isSchemaPageNode(schemaNode: unknown): schemaNode is SchemaPageNode {
  return (schemaNode as SchemaPageNode).name === BuiltInSchemaNodeNames.PAGE
}

export function isSchemaTextNode(schemaNode: unknown): schemaNode is SchemaTextNode {
  return (schemaNode as SchemaTextNode).name === BuiltInSchemaNodeNames.TEXT
}

export function isExpressionBinding(value: unknown): boolean {
  return isPlainObject(value) && value.type === BuiltInSchemaNodeBindingTypes.EXPRESSION_BINDING
}

export function isObjectBinding(value: unknown): boolean {
  return isPlainObject(value) && !isExpressionBinding(value) && !isRenderBinding(value) && !isVNodeBinding(value)
}

export function isRenderBinding(value: unknown): boolean {
  return isPlainObject(value) && value.type === BuiltInSchemaNodeBindingTypes.RENDER_BINDING && value.id
}

export function isVNodeBinding(value: unknown): boolean {
  return isPlainObject(value) && value.type === BuiltInSchemaNodeBindingTypes.V_NODE_BINDING
}

export function cloneSchemaNode<T extends SchemaNode | JSX.Element>(schemaNode: T): T {
  return JSON.parse(JSON.stringify(schemaNode))
}

export function normalizeClasses(value: unknown): string[] {
  return isArray(value) ? value : isString(value) ? value.split(' ') : []
}
