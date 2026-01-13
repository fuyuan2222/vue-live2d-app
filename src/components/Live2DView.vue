<template>
  <div class="live2d-canvas-container">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { defineProps, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as PIXI from 'pixi.js'
import { Live2DModel } from 'pixi-live2d-display/cubism4'

window.PIXI = PIXI

const props = defineProps({
  emotion: { type: String, default: 'idle' },
  personality: { type: String, default: '元気系' },
  frontHairstyle: { type: String, default: 'ぱっつん' },
  backHairstyle: { type: String, default: 'サイドテール' },
  eyes: { type: String, default: '丸目' }
})

const canvasRef = ref(null)
let app = null
let model = null

const MOTIONS = {
  '元気系': { idle: 'Idle_Genki', success: 'Success_Genki' },
  '癒し系': { idle: 'Idle_Heal', success: 'Success_Heal' },
  'クール系': { idle: 'Idle_Cool', success: 'Success_Cool' }
}

onMounted(async () => {
  app = new PIXI.Application({
    view: canvasRef.value,
    resizeTo: canvasRef.value.parentElement,
    backgroundAlpha: 0,
    autoDensity: true,
    resolution: window.devicePixelRatio || 1
  })

  model = await Live2DModel.from('/live2d/study/study.model3.json', {
    autoInteract: false,
    loadPose: false
  })

  model.anchor.set(0.5, 1)
  model.x = app.screen.width / 2
  model.y = app.screen.height
  model.scale.set(1.6)

  app.stage.addChild(model)

  // ★ 見た目は毎フレーム強制上書き
  app.ticker.add(updateAppearance, null, PIXI.UPDATE_PRIORITY.UTILITY)

  playIdle()
})

onBeforeUnmount(() => {
  app?.destroy(true, { children: true })
})

/* 見た目切り替え（Part専用） */
const updateAppearance = () => {
  if (!model) return
  const core = model.internalModel.coreModel

  const param = (id, on) =>
    core.setParameterValueById(id, on ? 1 : 0, 1.0)

  /* 服（性格連動） */
  param('Outfit_Power', props.personality === '元気系')
  param('Outfit_Heal', props.personality === '癒し系')
  param('Outfit_Cool', props.personality === 'クール系')

  /* 前髪 */
  param('ParamFrontHair_Pattsun', props.frontHairstyle === 'ぱっつん')
  param('ParamFrontHair_Three', props.frontHairstyle === '３つ分け')
  param('ParamFrontHair_TwoEight', props.frontHairstyle === '２・８分け')

  /* 後ろ髪 */
  param('ParamBackHair_Side', props.backHairstyle === 'サイドテール')
  param('ParamBackHair_One', props.backHairstyle === '一つ結び')
  param('ParamBackHair_Short', props.backHairstyle === 'ショート')

  /* 目 */
  param('ParamEyeStyle_Round', props.eyes === '丸目')
  param('ParamEye_Droop', props.eyes === 'たれ目')
  param('ParamEye_Sharp', props.eyes === '釣り目')
}

/* モーション制御 */
const playIdle = () => {
  const motion = MOTIONS[props.personality]?.idle
  if (motion) model.motion(motion, 0, { priority: 1 })
}

const playSuccess = () => {
  const motion = MOTIONS[props.personality]?.success
  if (motion) model.motion(motion, 0, { priority: 3 })
}

/* 監視 */
watch(() => props.personality, playIdle)

watch(() => props.emotion, (v) => {
  if (v === 'celebrate') playSuccess()
  else playIdle()
})
</script>


<style scoped>
.live2d-canvas-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  pointer-events: none;
}
canvas {
  width: 100%;
  height: 100%;
}
</style>