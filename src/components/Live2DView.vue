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
  emotion: { type: String, default: 'idle' },        
  personality: { type: String, default: '元気系' }, 
  frontHairstyle: { type: String, default: 'ぱっつん' },
  backHairstyle: { type: String, default: 'サイドテール' },
  eyes: { type: String, default: '丸目' }
})

const canvasRef = ref(null)
let app = null
let model = null

/* =====================
  マッピング定義
  ★ご指定の正しいIDに更新済み
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
      '丸目': 'ParamEyeStyle_Round',
      'たれ目': 'ParamEye_Droop',
      '釣り目': 'ParamEye_Sharp'
    }
  }
}

/* =====================
  初期化
===================== */
onMounted(async () => {onMounted(async () => {
  if (!canvasRef.value) return

  app = new PIXI.Application({
    view: canvasRef.value,
    resizeTo: canvasRef.value.parentElement,
    backgroundAlpha: 0,
    autoDensity: true,
    resolution: window.devicePixelRatio || 1,
    antialias: true
  })

  /* interaction クラッシュ回避 */
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

  // ★★★ ここを修正 ★★★
  // モーションの計算が終わった直後に、強制的にカスタム値を上書きする
  model.on('update', () => {
    updateAppearance()
  })

  playMotionByState()

  window.addEventListener('resize', onResize)
})
  if (!canvasRef.value) return

  app = new PIXI.Application({
    view: canvasRef.value,
    resizeTo: canvasRef.value.parentElement,
    backgroundAlpha: 0,
    autoDensity: true,
    resolution: window.devicePixelRatio || 1,
    antialias: true
  })

  /* interaction クラッシュ回避 */
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

  // ★★★ ここを修正 ★★★
  // モーションの計算が終わった直後に、強制的にカスタム値を上書きする
  model.on('update', () => {
    updateAppearance()
  })

  playMotionByState()

  window.addEventListener('resize', onResize)
})

/* =====================
  見た目切り替え
  （デバッグコード削除済み・毎フレーム実行）
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

  /* 前髪・後ろ髪・目 */
  const setParamGroup = (group, selected) => {
    const map = MAPPINGS.params[group]
    Object.entries(map).forEach(([name, id]) => {
      core.setParameterValueById(id, name === selected ? 1 : 0)
    })
  }

  setParamGroup('frontHairstyle', props.frontHairstyle)
  setParamGroup('backHairstyle', props.backHairstyle)
  setParamGroup('eyes', props.eyes)
}

/* =====================
  モーション再生（ループ対応版）
===================== */
const playMotionByState = async () => {
  if (!model) return

  // 現在の設定から再生すべきモーション名を決定
  const motionSet = MAPPINGS.motions[props.personality] || MAPPINGS.motions['元気系']
  let groupName = motionSet.idle
  let priority = 1
  let isIdle = true // アイドルモーションかどうか

  if (props.emotion === 'celebrate') {
    groupName = motionSet.success
    priority = 3
    isIdle = false
  }

  // 再生開始
  const finished = await model.motion(groupName, 0, { priority })

  // ループ処理：再生が正常終了し、かつアイドル状態であるべきなら再帰呼び出し
  if (finished && isIdle) {
    const currentMotionSet = MAPPINGS.motions[props.personality] || MAPPINGS.motions['元気系']
    
    // 設定が変わっていなければループ再生
    if (groupName === currentMotionSet.idle && props.emotion !== 'celebrate') {
      playMotionByState()
    }
  }
}

/* =====================
  watch
===================== */
watch(
  () => [props.personality, props.emotion],
  () => {
    // 設定が変わったら即座に新しいモーションを再生
    playMotionByState()
  },
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