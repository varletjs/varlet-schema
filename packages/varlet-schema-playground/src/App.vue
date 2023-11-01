<script setup lang="ts">
import { Button, Form, Input, Select, Option, Space, Snackbar } from '@varlet/ui'
import { SchemaRepl, type SchemaPageNode } from '@varlet/schema-repl'
import { shallowRef } from 'vue'
import '@varlet/schema-repl/lib/index.css'

const components = shallowRef({
  Button,
  Form,
  Input,
  Select,
  Option,
  Space
})

const injects = shallowRef({
  Snackbar
})

const schema = shallowRef<SchemaPageNode>({
  name: 'Page',
  code: `
function setup() {
  const model = ref({})

  function handleSave() {
    const modelString = JSON.stringify(model.value)
    Snackbar('Save to localStorage success!')
    localStorage.setItem('cache', modelString)
  }

  function handleReset() {
    Snackbar('Reset and clear localStorage success!')
    localStorage.clear()
  }

  onMounted(() => {
    const modelString = localStorage.getItem('cache')

    if (modelString) {
      model.value = JSON.parse(modelString)
    }
  })

  return { model, handleSave, handleReset }
}
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
})
</script>

<template>
  <div class="container">
    <schema-repl theme="vs-dark" :components="components" :injects="injects" v-model:schema="schema" />
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

body {
  margin: 0;
  transition: background-color 0.25s, color 0.25s;
  color: var(--color-text);
  background-color: var(--color-body);
  min-height: 100vh;
}
</style>

<style scoped lang="less">
.container {
  height: 100vh;
}
</style>