<template>
  <div class="live2d-canvas-container">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { defineProps, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as PIXI from 'pixi.js'
import { Live2DModel } from 'pixi-live2d-display/cubism4'

/* pixi-live2d-display 用 */
window.PIXI = PIXI

/* =====================
  props
===================== */
const props = defineProps({
  emotion: { type: String, default: 'idle' },        // idle | celebrate | smile
  personality: { type: String, default: '元気系' }, // 元気系 | 癒し系 | クール系
  frontHairstyle: { type: String, default: 'ぱっつん' },
  backHairstyle: { type: String, default: 'サイドテール' },
  eyes: { type: String, default: '丸目' }
})

const canvasRef = ref(null)
let app = null
let model = null

/* =====================
  マッピング定義
===================== */
const MAPPINGS = {
  motions: {
    '元気系': {
      idle: 'Idle_Genki',
      success: 'Success_Genki'
    },
    '癒し系': {
      idle: 'Idle_Heal',
      success: 'Success_Heal'
    },
    'クール系': {
      idle: 'Idle_Cool',
      success: 'Success_Cool'
    }
  },

  outfits: {
    '元気系': 'Outfit_Power',
    '癒し系': 'Outfit_Heal',
    'クール系': 'Outfit_Cool'
  },

  params: {
    frontHairstyle: {
      'ぱっつん': 'ParamFrontHair_Pattun',
      '３つ分け': 'ParamFrontHair_Three',
      '２・８分け': 'ParamFrontHair_TwoEight'
    },
    backHairstyle: {
      'サイドテール': 'ParamBackHair_Side',
      '一つ結び': 'ParamBackHair_One',
      'ショート': 'ParamBackHair_Short'
    },
    eyes: {
      '丸目': 'ParamEyeType_Round',
      'たれ目': 'ParamEyeType_Droop',
      '釣り目': 'ParamEyeType_Sharp'
    }
  }
}

/* =====================
  初期化
===================== */
onMounted(async () => {
  if (!canvasRef.value) return

  app = new PIXI.Application({
    view: canvasRef.value,
    resizeTo: canvasRef.value.parentElement,
    backgroundAlpha: 0,
    autoDensity: true,
    resolution: window.devicePixelRatio || 1,
    antialias: true
  })

  /* interaction 周りのクラッシュ回避 */
  if (app.renderer.events) {
    app.renderer.events.destroy()
    delete app.renderer.events
  }
  if (app.renderer.plugins?.interaction) {
    app.renderer.plugins.interaction.destroy()
    delete app.renderer.plugins.interaction
  }

  model = await Live2DModel.from(
    '/live2d/study/study.model3.json',
    { autoInteract: false }
  )

  model.anchor.set(0.5, 1)
  model.x = app.screen.width / 2
  model.y = app.screen.height

  const scale =
    Math.min(
      app.screen.width / model.width,
      app.screen.height / model.height
    ) * 1.6

  model.scale.set(scale)
  app.stage.addChild(model)

  updateAppearance()
  playMotionByState()

  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (app) app.destroy(true, { children: true })
})

/* =====================
  見た目切り替え
===================== */
const updateAppearance = () => {
  if (!model) return
  const core = model.internalModel.coreModel

  /* 服装 */
  Object.entries(MAPPINGS.outfits).forEach(([key, paramId]) => {
    core.setParameterValueById(
      paramId,
      key === props.personality ? 1 : 0
    )
  })

  /* 髪型・目 */
  const setParamGroup = (group, value) => {
    const map = MAPPINGS.params[group]
    if (!map) return
    Object.entries(map).forEach(([name, id]) => {
      core.setParameterValueById(id, name === value ? 1 : 0)
    })
  }

  setParamGroup('frontHairstyle', props.frontHairstyle)
  setParamGroup('backHairstyle', props.backHairstyle)
  setParamGroup('eyes', props.eyes)

  core.update()
}

/* =====================
  モーション再生（重要）
===================== */
const playMotionByState = () => {
  if (!model) return

  const motionSet =
    MAPPINGS.motions[props.personality] ||
    MAPPINGS.motions['元気系']

  let groupName = motionSet.idle
  let priority = 1

  if (props.emotion === 'celebrate') {
    groupName = motionSet.success
    priority = 3
  }

  console.log('Play Motion:', groupName)

  /* ★ここが最重要ポイント */
  model.motion(groupName, 0, { priority })
}

/* =====================
  watch
===================== */
watch(
  () => [
    props.frontHairstyle,
    props.backHairstyle,
    props.eyes,
    props.personality
  ],
  updateAppearance,
  { immediate: true }
)

watch(
  () => [props.personality, props.emotion],
  playMotionByState,
  { immediate: true }
)

/* =====================
  resize
===================== */
const onResize = () => {
  if (!app || !model) return
  app.resize()
  model.x = app.screen.width / 2
  model.y = app.screen.height
}
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
