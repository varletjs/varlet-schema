import * as monaco from 'monaco-editor'
import { type PropType, defineComponent, onMounted, ref, onUnmounted, watch, shallowRef } from 'vue'
import {
  type SchemaPageNode,
  type SchemaRendererComponents,
  type SchemaRendererInjects,
  SchemaRenderer
} from '@varlet/schema-renderer'
import { onWindowResize } from '@varlet/use'

import './monacoWorkers'
import './repl.css'

export type SchemaReplTab = 'JSON' | 'SCRIPT' | 'CSS'

export const SchemaRepl = defineComponent({
  props: {
    schema: {
      type: Object as PropType<SchemaPageNode>,
      required: true,
      default: () => ({})
    },

    components: {
      type: Object as PropType<SchemaRendererComponents>,
      default: () => ({})
    },

    injects: {
      type: Object as PropType<SchemaRendererInjects>,
      default: () => ({})
    },

    theme: {
      type: String as PropType<'vs' | 'vs-dark'>,
      default: 'vs'
    }
  },

  setup(props) {
    const schema = shallowRef<SchemaPageNode>(props.schema)
    const editorContainer = ref<HTMLElement | null>(null)
    const activeTab = ref<SchemaReplTab>('JSON')
    const tabs = ref<SchemaReplTab[]>(['JSON', 'SCRIPT', 'CSS'])
    let editor: monaco.editor.IStandaloneCodeEditor

    onMounted(() => {
      editor = monaco.editor.create(editorContainer.value!, getOptions())
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, updateSchema)
    })

    onUnmounted(() => {
      editor.dispose()
    })

    watch(() => [props.theme, props.schema], refreshEditor)

    onWindowResize(() => {
      editor.layout()
    })

    function refreshEditor() {
      const options = getOptions()
      editor.updateOptions(options)
      editor.setValue(options.value!)
      monaco.editor.setModelLanguage(editor.getModel()!, options.language!)
      schema.value = props.schema
    }

    function getOptions(): monaco.editor.IStandaloneEditorConstructionOptions {
      const defaultOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
        minimap: {
          enabled: false
        },
        fontSize: 13,
        theme: props.theme
      }

      if (activeTab.value === 'JSON') {
        return {
          ...defaultOptions,
          value: JSON.stringify(props.schema, null, 2),
          language: 'json'
        }
      }

      if (activeTab.value === 'SCRIPT') {
        return {
          ...defaultOptions,
          value: props.schema.code ?? 'function setup() {}',
          language: 'javascript'
        }
      }

      return {
        ...defaultOptions,
        value: props.schema.css ?? '',
        language: 'css'
      }
    }

    function clone(value: unknown) {
      return JSON.parse(JSON.stringify(value))
    }

    function updateSchema() {
      const editorValue = editor.getValue()
      let value: string = ''

      if (activeTab.value === 'JSON') {
        value = editorValue
      }

      if (activeTab.value === 'SCRIPT') {
        const clonedSchema = clone(schema.value)
        clonedSchema.code = editorValue
        value = JSON.stringify(clonedSchema)
      }

      if (activeTab.value === 'CSS') {
        const clonedSchema = clone(schema.value)
        clonedSchema.css = editorValue
        value = JSON.stringify(clonedSchema)
      }

      try {
        schema.value = JSON.parse(value)
      } catch (e) {
        alert('JSON parse error')
      }
    }

    function handleTabClick(tab: SchemaReplTab) {
      activeTab.value = tab
      refreshEditor()
    }

    function renderTabs() {
      return tabs.value.map((tab) => (
        <div
          class={['var-schema-repl-tab', tab === activeTab.value ? 'var-schema-repl-tab-active' : undefined]}
          onClick={() => handleTabClick(tab)}
        >
          {tab}
        </div>
      ))
    }

    return () => {
      return (
        <div class={['var-schema-repl', props.theme === 'vs-dark' ? 'var-schema-repl-vs-dark' : undefined]}>
          <div class="var-schema-repl-tab-container">{renderTabs()}</div>
          <div class="var-schema-repl-editor-container">
            <div class="var-schema-repl-editor" ref={editorContainer}></div>
            <SchemaRenderer schema={schema.value} components={props.components} injects={props.injects} />
          </div>
        </div>
      )
    }
  }
})
