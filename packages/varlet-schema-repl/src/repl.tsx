import * as monaco from 'monaco-editor'
import { type PropType, defineComponent, onMounted, ref, onUnmounted, watch, shallowRef, computed } from 'vue'
import {
  type SchemaPageNode,
  type SchemaRendererComponents,
  type SchemaRendererInjects,
  SchemaRenderer
} from '@varlet/schema-renderer'
import { useVModel, useWindowSize } from '@varlet/use'
import { call, classes } from '@varlet/shared'

import './monacoWorkers'
import './repl.css'

const DESKTOP_BREAKPOINT = 720
const INTERNAL_INJECTS_KEYS = [
  'h',
  'ref',
  'reactive',
  'computed',
  'readonly',
  'watch',
  'watchEffect',
  'watchSyncEffect',
  'watchPostEffect',
  'isRef',
  'unref',
  'toRefs',
  'isProxy',
  'isReactive',
  'isReadonly',
  'onBeforeMount',
  'onMounted',
  'onBeforeUpdate',
  'onUpdated',
  'onBeforeUnmount',
  'onUnmounted',
  'axle'
]

export type SchemaReplTab = 'JSON' | 'SCRIPT' | 'CSS'

export const SchemaRepl = defineComponent({
  props: {
    schema: {
      type: Object as PropType<SchemaPageNode>,
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
    },

    activeTab: {
      type: String as PropType<SchemaReplTab>,
      default: 'JSON'
    },

    editorFontSize: {
      type: Number,
      default: 13
    },

    onChange: {
      type: [Function, Array] as PropType<(value: SchemaPageNode) => void | Array<(value: SchemaPageNode) => void>>
    },

    'onUpdate:activeTab': {
      type: [Function, Array] as PropType<(value: SchemaReplTab) => void | Array<(value: SchemaReplTab) => void>>
    }
  },

  setup(props) {
    const schema = shallowRef<SchemaPageNode>(props.schema)
    const editorContainer = ref<HTMLElement | null>(null)
    const activeTab = useVModel(props, 'activeTab')
    const showEditor = ref(true)
    const tabs = ref<SchemaReplTab[]>(['JSON', 'SCRIPT', 'CSS'])
    const { width: windowWidth } = useWindowSize()
    const isDesktop = computed(() => windowWidth.value > DESKTOP_BREAKPOINT)

    let editor: monaco.editor.IStandaloneCodeEditor
    let completionProvider: monaco.IDisposable

    onMounted(setupMonaco)

    onUnmounted(() => {
      editor.dispose()
      completionProvider.dispose()
    })

    watch(() => [props.theme, props.schema], refreshEditor)

    function setupMonaco() {
      editor = monaco.editor.create(editorContainer.value!, getOptions())

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, updateSchema)

      monaco.languages.registerCompletionItemProvider('javascript', {
        provideCompletionItems(model, position) {
          const word = model.getWordUntilPosition(position)

          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
          }

          return {
            suggestions: [...INTERNAL_INJECTS_KEYS, ...Object.keys(props.injects)].map((name: string) => ({
              label: name,
              kind: monaco.languages.CompletionItemKind.Variable,
              insertText: name,
              range
            }))
          }
        }
      })
    }

    function refreshEditor() {
      const options = getOptions()

      editor.updateOptions(options)
      editor.setValue(options.value!)
      monaco.editor.setModelLanguage(editor.getModel()!, options.language!)
      schema.value = props.schema
    }

    function getOptions(): monaco.editor.IStandaloneEditorConstructionOptions {
      const defaultOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
        scrollBeyondLastLine: false,
        fontSize: props.editorFontSize,
        theme: props.theme,
        automaticLayout: true,
        minimap: {
          enabled: false
        },
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
        const newValue = JSON.parse(value)

        if (value !== JSON.stringify(schema.value)) {
          call(props.onChange, newValue)
        }

        schema.value = newValue
      } catch (e) {
        alert('JSON parse error')
      }
    }

    function handleTabClick(tab: SchemaReplTab) {
      activeTab.value = tab
      refreshEditor()
    }

    function handleTransferClick() {
      showEditor.value = !showEditor.value
    }

    function renderTabs() {
      return tabs.value.map((tab) => (
        <div
          class={classes('var-schema-repl-tab', [tab === activeTab.value, 'var-schema-repl-tab-active'])}
          onClick={() => handleTabClick(tab)}
        >
          {tab}
        </div>
      ))
    }

    return () => {
      return (
        <div class={classes('var-schema-repl', [props.theme === 'vs-dark', 'var-schema-repl-vs-dark'])}>
          <div class="var-schema-repl-tab-container">{renderTabs()}</div>
          <div class="var-schema-repl-editor-container">
            <div
              class="var-schema-repl-editor"
              v-show={isDesktop.value || showEditor.value}
              style={{ width: isDesktop.value ? '50%' : '100%' }}
              ref={editorContainer}
            ></div>
            <SchemaRenderer
              v-show={isDesktop.value || !showEditor.value}
              style={{ width: isDesktop.value ? '50%' : '100%' }}
              schema={schema.value}
              components={props.components}
              injects={props.injects}
            />
            {!isDesktop.value && (
              <button class="var-schema-repl-transfer" onClick={handleTransferClick}>
                {showEditor.value ? 'SHOW PREVIEW' : 'SHOW EDITOR'}
              </button>
            )}
          </div>
        </div>
      )
    }
  }
})
