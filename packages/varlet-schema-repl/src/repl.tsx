import * as monaco from 'monaco-editor'
import { onWindowResize } from '@varlet/use'
import { type Component, PropType, defineComponent, h, onMounted, ref, onUnmounted, watch } from 'vue'
import { type SchemaPageNode, SchemaRenderer } from '@varlet/schema-renderer'

import './monacoWorkers'
import './repl.css'

export const SchemaRepl = defineComponent({
  props: {
    schema: {
      type: Object as PropType<SchemaPageNode>,
      required: true,
      default: () => ({})
    },

    components: {
      type: Object as PropType<Record<string, Component>>,
      default: () => ({})
    },

    injects: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({})
    },

    theme: {
      type: String as PropType<'vs' | 'vs-dark'>,
      default: 'vs'
    },

    'onUpdate:schema': {
      type: [Function, Array] as PropType<(value: SchemaPageNode) => void | Array<(value: SchemaPageNode) => void>>
    }
  },

  setup(props) {
    const editorContainer = ref<HTMLElement | null>(null)
    let editor: monaco.editor.IStandaloneCodeEditor

    onMounted(() => {
      editor = monaco.editor.create(editorContainer.value!, getOptions())
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, updateSchema)
    })

    onUnmounted(() => {
      editor.dispose()
    })

    watch(
      () => [props.theme, props.schema],
      () => {
        editor.updateOptions(getOptions())
      }
    )

    onWindowResize(() => {
      editor.layout()
    })

    function getOptions(): monaco.editor.IStandaloneEditorConstructionOptions {
      return {
        value: JSON.stringify(props.schema, null, 2),
        language: 'json',

        scrollbar: {},
        minimap: {
          enabled: false
        },
        theme: props.theme
      }
    }

    function updateSchema() {
      let value
      try {
        value = JSON.parse(editor.getValue())
        props['onUpdate:schema']?.(value)
      } catch (e) {
        console.error('JSON parse error')
      }
    }

    return () => {
      return (
        <div class={['var-schema-repl', props.theme === 'vs-dark' ? 'var-schema-repl-vs-dark' : undefined]}>
          <div class="var-schema-repl-editor" ref={editorContainer}></div>
          <SchemaRenderer schema={props.schema} components={props.components} injects={props.injects} />
        </div>
      )
    }
  }
})
