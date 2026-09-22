<script setup lang="ts">
import { useClipboard, useShare } from '@vueuse/core'
import QRCode from 'qrcode'
import { ref, watch } from 'vue'

import { showToast } from '@/ui/feedback'

import PadButton from './PadButton.vue'
import PadIcon from './PadIcon.vue'
import PadSheet from './PadSheet.vue'

/** 邀请联：写着房间号的那一联，撕下来递给同桌。 */
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
      color: { dark: '#22201e', light: '#f7f7f5' },
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
  <PadSheet v-model:show="show" title="邀请同桌">
    <div class="sheet flex flex-col items-center px-4 py-5">
      <p class="label-cn text-pencil">房间号</p>
      <p class="tabular mt-1 text-num-l font-bold text-graphite" data-testid="qr-room-code">
        {{ code }}
      </p>
      <div class="rule-t mt-4 w-full pt-4">
        <img
          v-if="dataUrl"
          :src="dataUrl"
          alt="房间二维码"
          class="mx-auto h-56 w-56 border-2 border-graphite bg-paper p-2"
        />
        <div
          v-else
          class="mx-auto flex h-56 w-56 items-center justify-center border border-rule bg-paper-2 text-body text-pencil"
        >
          正在生成二维码…
        </div>
      </div>
      <p class="mt-3 max-w-full truncate px-2 text-body text-pencil select-all">{{ url }}</p>
    </div>

    <p class="mt-3 text-body text-pencil">用相机扫码直接进来，或在首页填这四位房间号。</p>

    <div class="mt-3 flex gap-2">
      <PadButton v-if="canCopy" block variant="outline" @click="copyLink">
        <span class="h-4 w-4"><PadIcon name="copy" /></span>
        复制链接
      </PadButton>
      <PadButton v-if="canShare" block variant="solid" @click="shareLink">
        <span class="h-4 w-4"><PadIcon name="share" /></span>
        系统分享
      </PadButton>
    </div>
  </PadSheet>
</template>
