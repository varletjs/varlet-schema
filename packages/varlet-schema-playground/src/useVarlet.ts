import { SchemaRendererInjects, type SchemaRendererComponents } from '@varlet/schema-repl'
import { shallowRef } from 'vue'
import Varlet from '@varlet/ui'

const FUNCTIONS = [
  'ImagePreview',
  'Snackbar',
  'Picker',
  'ActionSheet',
  'Dialog',
  'Locale',
  'StyleProvider',
  'LoadingBar'
]
const EXCLUDES = ['Ripple', 'Lazy', 'Hover', 'version', 'install']

export function useVarlet() {
  const exports = Object.entries(Varlet as Record<string, any>)

  const components = shallowRef(
    exports.reduce((components, [key, value]) => {
      if (EXCLUDES.includes(key)) {
        return components
      }

      if (value.hasOwnProperty('Component')) {
        components[key] = value.Component
        return components
      }

      components[key] = value

      return components
    }, {} as SchemaRendererComponents)
  )

  const injects = shallowRef(
    exports.reduce((injects, [key, value]) => {
      if (FUNCTIONS.includes(key)) {
        injects[key] = value
      }

      return injects
    }, {} as SchemaRendererInjects)
  )

  return {
    components,
    injects
  }
}
