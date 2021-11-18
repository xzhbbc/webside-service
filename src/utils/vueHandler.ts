export default class VueHandler {
  static getTemplate(code: string) {
    const getTemplateData = code.split('<template>')[1]
    return getTemplateData.split('</template>')[0]
  }

  static getScript(code: string) {
    const getTemplateData = code.split('<script>')[1]
    return getTemplateData.split('</script>')[0]
  }
  static getCss(code: string) {
    const getTemplateData = code.split('<style lang="scss">')[1]
    return getTemplateData.split('</style>')[0]
  }
}
