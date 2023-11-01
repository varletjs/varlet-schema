import { defineConfig } from 'tsup'
import jsx from 'unplugin-vue-jsx/esbuild'

export default defineConfig({
  esbuildPlugins: [
    jsx({
      include: [/\.[jt]sx?$/]
    })
  ]
})
