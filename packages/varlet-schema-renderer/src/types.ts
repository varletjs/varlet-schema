export enum BuiltInSchemaNodeNames {
  PAGE = 'Page',
  TEXT = 'Text'
}

export enum BuiltInSchemaNodeBindingTypes {
  EXPRESSION_BINDING = 'Expression',
  RENDER_BINDING = 'Render',
  V_NODE_BINDING = 'VNode'
}

export type SchemaNodeProps = Record<string, SchemaNodeBinding>
export type SchemaNodeSlots = Record<string, SchemaNodeSlot>
export type SchemaNodeBinding = any

export interface SchemaNodeSlot {
  children: (SchemaNode | SchemaTextNode)[]
}

export interface SchemaNode {
  name: string
  id?: string
  props?: SchemaNodeProps
  slots?: SchemaNodeSlots
  children?: (SchemaNode | SchemaTextNode)[]
  if?: SchemaNodeBinding
  for?: SchemaNodeBinding
}

export interface SchemaTextNode extends SchemaNode {
  name: BuiltInSchemaNodeNames.TEXT | 'Text'
  value: SchemaNodeBinding
}

export interface SchemaPageNode extends SchemaNode {
  name: BuiltInSchemaNodeNames.PAGE | 'Page'
  code?: string
  compatibleCode?: string
  css?: string
}

export interface ScopeVariables {
  $item?: Record<string, any>
  $index?: Record<string, any>
  $slotProps?: Record<string, any>
  $renderArgs?: Record<string, any[]>
}

export type RawSlots = {
  [name: string]: unknown
}

export type RawProps = Record<string, any>

export type SchemaNodeVisitor = (value: any, key: string | number, target: any) => void
