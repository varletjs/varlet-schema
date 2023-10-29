import {
  defineComponent,
  h,
  renderList,
  ref,
  isRef,
  unref,
  toRefs,
  isProxy,
  isReactive,
  isReadonly,
  reactive,
  computed,
  readonly,
  watch,
  watchEffect,
  watchSyncEffect,
  watchPostEffect,
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  Fragment,
  getCurrentInstance,
  type Component,
  type PropType,
  type VNode
} from 'vue'
import { isArray } from '@varlet/shared'
import { createAxle } from '@varlet/axle'
import {
  normalizeClasses,
  cloneSchemaNode,
  isExpressionBinding,
  isObjectBinding,
  isRenderBinding,
  isSchemaTextNode,
  isVNodeBinding
} from './shared'
import {
  BuiltInSchemaNodeBindingTypes,
  type SchemaPageNode,
  type SchemaNode,
  type ScopeVariables,
  type RawProps,
  type RawSlots,
  type SchemaNodeProps
} from './types'

const STYLE_ID_PREFIX = 'schema-renderer-style'
const SCOPE_VARIABLES = ['$item', '$index', '$slotProps', '$renderArgs']

const axle = createAxle({})

export const Renderer = defineComponent({
  props: {
    schema: {
      type: Object as PropType<SchemaPageNode>,
      required: true,
      default: () => ({})
    },

    components: {
      type: Object as PropType<Record<string, Component>>,
      default: () => ({})
    }
  },

  setup(props) {
    const ctx = {
      h,
      ref,
      reactive,
      computed,
      readonly,
      watch,
      watchEffect,
      watchSyncEffect,
      watchPostEffect,
      isRef,
      unref,
      toRefs,
      isProxy,
      isReactive,
      isReadonly,
      onBeforeMount,
      onMounted,
      onBeforeUpdate,
      onUpdated,
      onBeforeUnmount,
      onUnmounted,
      exec,
      axle
    }

    const { uid } = getCurrentInstance()!
    const code = props.schema.compatibleCode ?? props.schema.code ?? 'function setup() { return {} }'
    const setup = exec(code)
    const setupCtx = setup()
    Object.assign(ctx, setupCtx)

    onMounted(mountCss)
    onUnmounted(unmountCss)
    watch(() => props.schema.css, updateCss)

    function exec(expression: string, context?: any) {
      // @ts-ignore
      return window.evalWith(expression, context ?? ctx)
    }

    function mountCss() {
      if (!props.schema.css) {
        return
      }

      const style = document.createElement('style')
      style.innerHTML = props.schema.css
      style.id = `${STYLE_ID_PREFIX}-${uid}`

      document.head.appendChild(style)
    }

    function unmountCss() {
      const style = document.querySelector(`#${STYLE_ID_PREFIX}-${uid}`)

      if (style) {
        document.head.removeChild(style)
      }
    }

    function updateCss() {
      unmountCss()
      mountCss()
    }

    function createNewScopeVariables(oldScopeVariables: ScopeVariables, partialScopeVariables: ScopeVariables) {
      return {
        ...oldScopeVariables,
        ...partialScopeVariables
      }
    }

    function includesScopeVariable(expression: string) {
      return SCOPE_VARIABLES.some((scopedVariable) => expression.includes(scopedVariable))
    }

    function resolveScopedExpression(expression: string, scopeVariables: ScopeVariables) {
      return exec(expression, { ...ctx, ...scopeVariables })
    }

    function getExpressionBindingValue(expression: string, scopeVariables: ScopeVariables) {
      if (!includesScopeVariable(expression)) {
        return exec(expression)
      }

      return resolveScopedExpression(expression, scopeVariables)
    }

    function getObjectBindingValue(value: any, scopeVariables: ScopeVariables) {
      return Object.keys(value).reduce((newValue, key) => {
        newValue[key] = getBindingValue(value[key], scopeVariables)

        return newValue
      }, {} as Record<string, any>)
    }

    function getBindingValue(value: any, scopeVariables: ScopeVariables): any {
      if (isRenderBinding(value)) {
        return (...args: any[]) => {
          const newScopeVariables = createNewScopeVariables(scopeVariables, {
            $renderArgs: {
              ...scopeVariables.$renderArgs,
              [value.id!]: args
            }
          })

          const conditionedSchemaNodes = withCondition(value.value, newScopeVariables)

          return h(
            Fragment,
            conditionedSchemaNodes.map((schemaNode) => renderSchemaNode(schemaNode, newScopeVariables))
          )
        }
      }

      if (isVNodeBinding(value)) {
        const condition = getBindingValue(value.value.if, scopeVariables) ?? true

        return condition ? renderSchemaNode(value.value, scopeVariables) : undefined
      }

      if (isExpressionBinding(value)) {
        return getExpressionBindingValue(value.compatibleValue ?? value.value, scopeVariables)
      }

      if (isObjectBinding(value)) {
        return getObjectBindingValue(value, scopeVariables)
      }

      if (isArray(value)) {
        return value.map((value) => getBindingValue(value, scopeVariables))
      }

      return value
    }

    function renderVNode(schemaNode: SchemaNode, scopeVariables: ScopeVariables) {
      const propsBinding = getPropsBinding(schemaNode, scopeVariables)
      const classes = normalizeClasses(propsBinding.class)
      const props = { ...propsBinding, class: classes }

      if (isSchemaTextNode(schemaNode)) {
        const { value } = schemaNode

        return h('span', props, getBindingValue(value, scopeVariables))
      }

      return h(getComponent(schemaNode.name), props, renderSchemaNodeSlots(schemaNode, scopeVariables))
    }

    function getComponent(schemaNodeName: string) {
      return props.components[schemaNodeName]
    }

    function parsePropsVModel(schemaNodeProps: SchemaNodeProps = {}) {
      const newSchemaNodeProps = Object.entries(schemaNodeProps).reduce((newSchemaNodeProps, [key, value]) => {
        if (!key.startsWith('v-model')) {
          newSchemaNodeProps[key] = value
          return newSchemaNodeProps
        }

        // v-model must be expression binding
        const stateKey = key.startsWith('v-model:') ? key.replace('v-model:', '') : 'modelValue'
        const updateKey = `onUpdate:${stateKey}`
        newSchemaNodeProps[stateKey] = value
        newSchemaNodeProps[updateKey] = {
          type: BuiltInSchemaNodeBindingTypes.EXPRESSION_BINDING,
          value: `(value) => { ${value.value} = value }`
        }

        return newSchemaNodeProps
      }, {} as SchemaNodeProps)

      return newSchemaNodeProps
    }

    function getPropsBinding(schemaNode: SchemaNode, scopeVariables: ScopeVariables) {
      const rawProps = Object.entries(parsePropsVModel(schemaNode.props ?? {})).reduce((rawProps, [key, value]) => {
        rawProps[key] = getBindingValue(value, scopeVariables)

        return rawProps
      }, {} as RawProps)

      return rawProps
    }

    function withCondition(schemaNodes: SchemaNode[], scopeVariables: ScopeVariables): SchemaNode[] {
      return schemaNodes.filter((schemaNode) => !!getBindingValue(schemaNode.if ?? true, scopeVariables))
    }

    function renderSchemaNode(schemaNode: SchemaNode, scopeVariables: ScopeVariables): VNode {
      if (!schemaNode.hasOwnProperty('for')) {
        return renderVNode(schemaNode, scopeVariables)
      }

      const bindingValue = getBindingValue(schemaNode.for, scopeVariables)

      return h(
        Fragment,
        null,
        renderList(bindingValue, (item, index) => {
          const clonedSchemaNode = cloneSchemaNode(schemaNode)

          return renderVNode(
            clonedSchemaNode,
            createNewScopeVariables(scopeVariables, {
              $item: {
                ...scopeVariables.$item,
                [schemaNode.id!]: item
              },
              $index: {
                ...scopeVariables.$index,
                [schemaNode.id!]: index
              }
            })
          )
        })
      )
    }

    function renderSchemaNodeSlots(schemaNode: SchemaNode, scopeVariables: ScopeVariables): RawSlots {
      try {
        const slots = { ...(schemaNode.slots ?? {}) }

        if (!slots.default && schemaNode.children) {
          slots.default = {
            children: [...schemaNode.children]
          }
        }

        return Object.entries(slots).reduce((rawSlots, [slotName, slot]) => {
          rawSlots[slotName] = (slotProps: any) => {
            const newScopeVariables = createNewScopeVariables(scopeVariables, {
              $slotProps: {
                ...scopeVariables.$slotProps,
                [schemaNode.id!]: slotProps
              }
            })

            return withCondition(slot.children ?? [], newScopeVariables).map((schemaNode) =>
              renderSchemaNode(schemaNode, newScopeVariables)
            )
          }

          return rawSlots
        }, {} as RawSlots)
      } catch (e) {
        console.error('Renderer error, please check console')
        throw e
      }
    }

    return () => h('div', { class: 'schema-renderer' }, renderSchemaNodeSlots(props.schema, {}))
  }
})
