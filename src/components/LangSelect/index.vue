<template>
  <el-dropdown trigger="click" class="international" @command="handleSetLanguage">
    <div>
      <Icon icon="mdi:translate" class="i18n" />
    </div>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item :disabled="language === 'zh_CN'" command="zh_CN">
        中文
      </el-dropdown-item>
      <el-dropdown-item :disabled="language === 'en_US'" command="en_US">
        English
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  computed: {
    language() {
      return this.$store.getters.language
    }
  },
  methods: {
    handleSetLanguage(lang) {
      this.$i18n.locale = lang
      this.$store.dispatch('app/setLanguage', lang)
      this.$message({
        message: '设置语言成功',
        type: 'success'
      })
    }
  }
}
</script>

<style scoped>
.international {
  cursor: pointer;
  vertical-align: middle;
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  justify-content: center; /* 水平居中对齐 */
  height: 100%; /* 确保父容器的高度足够 */
}

.i18n {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
}
</style>