<template>
  <div ref="live2dCanvas" class="live2d-canvas">
    <p>キャラクターをロード中です...</p>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'

// Live2Dモデルがないため、関連ライブラリのインポートを削除
// import { Live2DModel } from 'pixi-live2d-display'

const props = defineProps({
  emotion: {
    type: String,
    default: 'idle'
  },
  personality: {
    type: String,
    default: '元気系'
  },
  hairstyle: {
    type: String,
    default: 'ロング'
  },
  outfit: {
    type: String,
    default: '元気カジュアル系'
  },
  accessory: {
    type: String,
    default: 'なし'
  }
})

const live2dCanvas = ref(null)
// let model = null; // モデルインスタンスも不要に

const loadModel = async () => {
  // Live2Dモデルの読み込み処理を無効化
  console.log('Live2Dモデルは現在ロードされません。')
}

// コンポーネントがマウントされたらモデルをロード
onMounted(() => {
  loadModel()
})

// コンポーネントが破棄されたらモデルも破棄
onUnmounted(() => {
  // if (model) {
  //   model.destroy()
  // }
})

// propsの変更を監視する処理も不要に
// watch(() => [props.personality, props.hairstyle, props.outfit, props.accessory], () => {
//   // ...
// })
</script>

<style scoped>
.live2d-canvas {
  /* プレースホルダーのスタイル */
  display: flex;
  justify-content: center;
  align-items: center;
  height: 250px;
  background-color: #f0f0f0;
  border-radius: 10px;
  color: #888;
  font-style: italic;
}
</style>