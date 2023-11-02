<script setup lang="ts">
import { SchemaRepl, type SchemaPageNode, SchemaReplTab } from '@varlet/schema-repl'
import { shallowRef, ref, watch } from 'vue'
import { useVarlet } from './useVarlet'
import '@varlet/schema-repl/lib/index.css'

const { components, injects } = useVarlet()

const defaultSchema = {
  name: 'Page',
  code: `\
function setup() {
  const model = ref({})

  onMounted(() => {
    const modelString = localStorage.getItem('cache')

    if (modelString) {
      model.value = JSON.parse(modelString)
    }
  })

  function handleSave() {
    const modelString = JSON.stringify(model.value)
    Snackbar('Save to localStorage success!')
    localStorage.setItem('cache', modelString)
  }

  function handleReset() {
    Snackbar('Reset and clear localStorage success!')
    localStorage.removeItem('cache')
  }

  return { model, handleSave, handleReset }
}\
`,
  css: `\
.var-schema-renderer {
  padding: 16px;
}\
`,
  children: [
    {
      name: 'Form',
      props: {
        onSubmit: {
          type: 'Expression',
          value: 'handleSave'
        },
        onReset: {
          type: 'Expression',
          value: 'handleReset'
        }
      },
      children: [
        {
          name: 'Space',
          props: {
            direction: 'column',
            size: [16, 0]
          },
          children: [
            {
              name: 'Input',
              props: {
                'v-model': {
                  type: 'Expression',
                  value: 'model.value.name'
                },
                placeholder: 'Please input name'
              }
            },
            {
              name: 'Input',
              props: {
                'v-model': {
                  type: 'Expression',
                  value: 'model.value.age'
                },
                placeholder: 'Please input age'
              }
            },
            {
              name: 'Select',
              props: {
                'v-model': {
                  type: 'Expression',
                  value: 'model.value.gender'
                },
                placeholder: 'Please select gender'
              },
              children: [
                {
                  name: 'Option',
                  props: {
                    label: 'Male'
                  }
                },
                {
                  name: 'Option',
                  props: {
                    label: 'Female'
                  }
                }
              ]
            },
            {
              name: 'Space',
              props: {
                justify: 'flex-end',
                style: {
                  'margin-top': '10px'
                }
              },
              children: [
                {
                  name: 'Button',
                  props: {
                    nativeType: 'reset'
                  },
                  children: [
                    {
                      name: 'Text',
                      value: 'RESET'
                    }
                  ]
                },
                {
                  name: 'Button',
                  props: {
                    type: 'primary',
                    nativeType: 'submit'
                  },
                  children: [
                    {
                      name: 'Text',
                      value: 'SAVE'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

const schema = shallowRef<SchemaPageNode>(
  localStorage.getItem('schema') ? JSON.parse(localStorage.getItem('schema')!) : defaultSchema
)

const activeTab = ref((localStorage.getItem('active-tab') ?? 'JSON') as SchemaReplTab)

watch(
  () => activeTab.value,
  (newValue) => {
    localStorage.setItem('active-tab', newValue)
  },
  { immediate: true }
)

function handleChange(newSchema: SchemaPageNode) {
  localStorage.setItem('schema', JSON.stringify(newSchema))
}
</script>

<template>
  <div class="container">
    <schema-repl
      theme="vs-dark"
      :components="components"
      :injects="injects"
      v-model:active-tab="activeTab"
      v-model:schema="schema"
      @change="handleChange"
    />
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

:root {
  color-scheme: dark;
}

body {
  margin: 0;
  transition: background-color 0.25s, color 0.25s;
  min-height: 100vh;
}
</style>

<style scoped lang="less">
.container {
  height: 100vh;
}
</style>
