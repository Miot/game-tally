<script setup lang="ts">
import { useClipboard, useShare } from '@vueuse/core'
import QRCode from 'qrcode'
import { showToast } from 'vant'
import { ref, watch } from 'vue'

const props = defineProps<{ code: string; url: string }>()
const show = defineModel<boolean>('show', { required: true })

const dataUrl = ref('')
const { copy, isSupported: canCopy } = useClipboard({ legacy: true })
const { share, isSupported: canShare } = useShare()

watch(
  () => [show.value, props.url] as const,
  async ([visible, url]) => {
    if (!visible || !url) return
    dataUrl.value = await QRCode.toDataURL(url, {
      width: 640,
      margin: 1,
      color: { dark: '#0a1020', light: '#eef1f7' },
    })
  },
  { immediate: true },
)

async function copyLink(): Promise<void> {
  await copy(props.url)
  showToast('链接已复制')
}

async function shareLink(): Promise<void> {
  await share({ title: `局分 · 房间 ${props.code}`, text: '来记分', url: props.url })
}
</script>

<template>
  <van-popup v-model:show="show" position="bottom" round closeable safe-area-inset-bottom>
    <div class="flex flex-col items-center px-4 pt-5 pb-6">
      <h2 class="font-display text-sm tracking-[0.3em] text-dust-500 uppercase">邀请同桌</h2>
      <p class="readout mt-2 text-5xl tracking-[0.2em] text-cyan" data-testid="qr-room-code">
        {{ code }}
      </p>
      <p class="mt-1 text-xs text-dust-500">对方用相机扫码，或在首页输入房间码</p>
      <img
        v-if="dataUrl"
        :src="dataUrl"
        alt="房间二维码"
        class="mt-4 h-56 w-56 rounded-2xl border-4 border-dust-100 bg-dust-100"
      />
      <p class="mt-3 max-w-full truncate px-2 text-[11px] text-dust-700 select-all">{{ url }}</p>
      <div class="mt-4 flex w-full gap-2">
        <van-button v-if="canCopy" block round plain type="primary" @click="copyLink">
          复制链接
        </van-button>
        <van-button v-if="canShare" block round type="primary" @click="shareLink">
          系统分享
        </van-button>
      </div>
    </div>
  </van-popup>
</template>
