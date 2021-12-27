import { join } from 'path'
import Utils from '@/utils/utils'

export const serviceLogName = 'webIde'
// jwt密钥
export const jwtSecret = `${serviceLogName}_service`

const templatePath = '../../project/template-vue-pc'

export const fileProject = {
  rootPath: join(__dirname, `${templatePath}/src/views/template/index.vue`),
  viewPath: join(__dirname, `${templatePath}/output/pc`),
  viewPathSrc: join(__dirname, `${templatePath}/src`),
  viewPathHbs: join(__dirname, `${templatePath}/src/html/pages`),
  viewPathVue: join(__dirname, `${templatePath}/src/views`),
  templatePath: join(__dirname, templatePath)
}

export const viewProject = join(__dirname, '../../project')

export const cacheProject = join(__dirname, '../../cache')

export const canWriteFile = 'src/views'

export const codeTemplate = {
  hbs: () => `---
layout: default.hbs
title: 模板
keywords: 模板
description: 模板
---
<div id="app"></div>
`,
  root: (name: string) => `import '@/css/global.scss'
import App from '@/views/${name}'

new Vue({
  render: h => h(App),
}).$mount('#app')
`,
  vue: (name: string) => `<template>
  <div id="app"></div>
</template>

<script>
export default {
  name: '${Utils.upperFirstCase(name)}',
}
</script>

<style lang="scss">

</style>
`
}
