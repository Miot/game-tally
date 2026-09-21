<script setup lang="ts">
import type { ConfigProviderThemeVars } from 'vant'

/**
 * Vant 浅色主题上覆盖品牌色，使结构组件与自绘计数器同属一套配色。
 * 作用域必须为 global：Vant 的组件变量在 :root 上引用 --van-primary-color，
 * 局部覆盖不会改变已在 :root 计算出的组件变量，Toast/Dialog 也挂在 body 下。
 */
const themeVars: ConfigProviderThemeVars = {
  primaryColor: '#0ea5e9',
  dangerColor: '#e11d48',
  background: '#f5f7fb',
  background2: '#ffffff',
  textColor: '#0b1220',
  textColor2: '#5b6779',
  textColor3: '#8a94a6',
  borderColor: '#dde4ee',
  popupBackground: '#ffffff',
  buttonDefaultBackground: '#ffffff',
  buttonDefaultBorderColor: '#dde4ee',
  buttonDefaultColor: '#0b1220',
  cellBackground: '#ffffff',
  dialogBackground: '#ffffff',
  fieldInputTextColor: '#0b1220',
  fieldPlaceholderTextColor: '#8a94a6',
}
</script>

<template>
  <van-config-provider :theme-vars="themeVars" theme-vars-scope="global" class="app-shell">
    <router-view />
  </van-config-provider>
</template>
