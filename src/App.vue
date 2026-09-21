<script setup lang="ts">
import type { ConfigProviderThemeVars } from 'vant'

/**
 * Vant 深色主题上覆盖品牌色，使结构组件与自绘计数器同属一套配色。
 * 作用域必须为 global：Vant 的组件变量在 :root 上引用 --van-primary-color，
 * 局部覆盖不会改变已在 :root 计算出的组件变量，Toast/Dialog 也挂在 body 下。
 */
const themeVars: ConfigProviderThemeVars = {
  primaryColor: '#38d9f5',
  dangerColor: '#ef4b53',
  background: '#0a1020',
  background2: '#111a2e',
  textColor: '#eef1f7',
  textColor2: '#8b93a7',
  textColor3: '#5f6880',
  borderColor: '#26344f',
  popupBackground: '#111a2e',
  buttonPrimaryColor: '#05080f',
  buttonDefaultBackground: '#1a2742',
  buttonDefaultBorderColor: '#26344f',
  buttonDefaultColor: '#eef1f7',
  cellBackground: '#111a2e',
  dialogBackground: '#111a2e',
  fieldInputTextColor: '#eef1f7',
  fieldPlaceholderTextColor: '#5f6880',
}
</script>

<template>
  <van-config-provider
    theme="dark"
    :theme-vars="themeVars"
    theme-vars-scope="global"
    class="app-shell"
  >
    <router-view />
  </van-config-provider>
</template>
