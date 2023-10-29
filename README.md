### Intro

Varlet Schema is a Lightweight Schema renderer based on Vue3, developed and maintained by `varletjs` community team.


### Install

```shell
# Install with npm or yarn or pnpm

# npm
npm i @varlet/schema-renderer -S

# yarn
yarn add @varlet/schema-renderer

# pnpm
pnpm add @varlet/schema-renderer
```

### Basic Usage

#### Inject eval in index.html

Schema rendering uses eval. Eval is not allowed to be used in strict mode, but script module is in strict mode.
So we have to do the following.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Varlet Schema Playground</title>
    <script src="https://cdn.jsdelivr.net/npm/@varlet/schema-eval-with/index.js"></script>
  </head>

  <body>
    <div id="app"></div>
  </body>
</html>
```

#### Basic Usage

```vue
<script setup lang="ts">
import { Button, Snackbar } from '@varlet/ui'
import { SchemaRenderer, type SchemaPageNode } from '@varlet/schema-renderer'
import { shallowRef } from 'vue'

const components = shallowRef({
  Button,
})

const injects = shallowRef({
  Snackbar
})

const schema = shallowRef<SchemaPageNode>({
  name: 'Page',
  code: `
function setup() {
	const count = ref(0)

  function handleClick() {
    count.value++
  }

  onMounted(() => {
    Snackbar('hello')
  })

  return { count, handleClick }
}
`,
  children: [
    {
      name: 'Button',
      props: {
        onClick: {
					type: 'Expression',
					value: 'handleClick'
				}
      },
      children: [
        {
					name: 'Text',
					value: {
						type: 'Expression',
						value: 'count.value'
					}
				}
      ]
    }
  ]
})
</script>

<template>
  <schema-renderer :components="components" :injects="injects" :schema="schema" />
</template>
```

### More Example Info

[See Playground](https://github.com/varletjs/varlet-schema/tree/main/packages/varlet-schema-playground)

### Community

We recommend that `issue` be used for problem feedback, or others:

* Wechat group 

<img style="width: 25%" src="https://cdn.jsdelivr.net/gh/varletjs/varlet-static/community.png" />

* Join the [Discord](https://discord.gg/Dmb8ydBHkw)

### Thanks to contributors

<a href="https://github.com/varletjs/varlet/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=varletjs/varlet" />
</a>

### Thanks to the following sponsors

<a href="https://cdn.jsdelivr.net/gh/varletjs/varlet-static/sponsorkit/sponsors.svg">
  <img src="https://cdn.jsdelivr.net/gh/varletjs/varlet-static/sponsorkit/sponsors.svg">
</a>

### Sponsor this project

Sponsor this project to support our better creation. It is recommended to use afdian to subscribe, and your avatar will appear in this project.

#### Afdian

<a href="https://afdian.net/a/haoziqaq">https://afdian.net/a/haoziqaq</a>

#### Wechat / Alipay

<img style="width: 25%" src="https://cdn.jsdelivr.net/gh/varletjs/varlet-static/wechat.jpg" />
<img style="width: 25%" src="https://cdn.jsdelivr.net/gh/varletjs/varlet-static/alipay.jpg" />
