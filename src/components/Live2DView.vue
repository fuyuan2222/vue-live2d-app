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
  ★配列形式 [] に変更しました。
  ★コンソールで見つけた「Part...」IDをここに追加してください！
===================== */
const MAPPINGS = {
  motions: {
    '元気系': { idle: 'Idle_Genki', success: 'Success_Genki' },
    '癒し系': { idle: 'Idle_Heal',  success: 'Success_Heal' },
    'クール系': { idle: 'Idle_Cool',  success: 'Success_Cool' }
  },

  outfits: {
    '元気系': ['Outfit_Power'], 
    '癒し系': ['Outfit_Heal'],
    'クール系': ['Outfit_Cool']
  },

  params: {
    frontHairstyle: {
      // 例: ['ParamFrontHair_Pattun', 'PartFrontHair_Pattun'] のように並記する
      'ぱっつん': ['ParamFrontHair_Pattun','Part8'], 
      '３つ分け': ['ParamFrontHair_Three'],
      '２・８分け': ['ParamFrontHair_TwoEight']
    },
    backHairstyle: {
      'サイドテール': ['ParamBackHair_Side','Part106'],
      '一つ結び': ['ParamBackHair_One'],
      'ショート': ['ParamBackHair_Short']
    },
    eyes: {
      '丸目': ['ParamEyeStyle_Round'],
      'たれ目': ['ParamEye_Droop'],
      '釣り目': ['ParamEye_Sharp']
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

  // クラッシュ回避
  if (app.renderer.events) {
    app.renderer.events.destroy()
    delete app.renderer.events
  }
  if (app.renderer.plugins?.interaction) {
    app.renderer.plugins.interaction.destroy()
    delete app.renderer.plugins.interaction
  }

  // モデル読み込み
  try {
    model = await Live2DModel.from(
      '/live2d/study/study.model3.json',
      { autoInteract: false, loadPose: false }
    )
  } catch (e) {
    console.error("モデル読み込みエラー:", e)
    return
  }

  // ★重要：コンソールから model を操作できるようにする
  window.live2d = model

  // 位置調整
  model.anchor.set(0.5, 1.0)
  model.x = app.screen.width / 2
  model.y = app.screen.height
  const scale = Math.min(app.screen.width / model.width, app.screen.height / model.height) * 1.6
  model.scale.set(scale)
  app.stage.addChild(model)

  // ★★★ 【絶対安全なデバッグログ】 ★★★
  console.group("🔍 Live2D Explorer")
  console.log("▼ 下の [CoreModel] をクリックして、中にある _partIds や parts.ids を探してください ▼")
  
  if (model.internalModel && model.internalModel.coreModel) {
      console.log("CoreModel:", model.internalModel.coreModel)
  } else {
      console.log("Model:", model)
  }
  console.groupEnd()
  // ★★★★★★★★★★★★★★★★★★★★★

  // カスタム適用（優先度 UTILITY）
  app.ticker.add(updateAppearance, null, PIXI.UPDATE_PRIORITY.UTILITY)

  playMotionByState()

  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (app) app.destroy(true, { children: true })
})

/* =====================
  見た目切り替え（配列対応・二刀流版）
===================== */
const updateAppearance = () => {
  if (!model) return
  const core = model.internalModel.coreModel

  // ヘルパー：IDが配列でも単体でも、パラメータとパーツの両方にセットする
  const applySettings = (idOrArray, isActive) => {
    // 配列に統一
    const ids = Array.isArray(idOrArray) ? idOrArray : [idOrArray]
    const value = isActive ? 1 : 0

    ids.forEach(id => {
      // 1. パラメータ(変形)としてセット
      core.setParameterValueById(id, value)
      // 2. パーツ(不透明度)としてセット
      core.setPartOpacityById(id, value)
    })
  }

  /* 服装 */
  Object.entries(MAPPINGS.outfits).forEach(([key, ids]) => {
    applySettings(ids, key === props.personality)
  })

  /* 前髪・後ろ髪・目 */
  const setParamGroup = (group, selected) => {
    const map = MAPPINGS.params[group]
    Object.entries(map).forEach(([name, ids]) => {
      applySettings(ids, name === selected)
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

  const motionSet = MAPPINGS.motions[props.personality] || MAPPINGS.motions['元気系']
  let groupName = motionSet.idle
  let priority = 1
  let isIdle = true 

  if (props.emotion === 'celebrate') {
    groupName = motionSet.success
    priority = 3
    isIdle = false
  }

  // 再生開始
  const finished = await model.motion(groupName, 0, { priority })

  // ループ処理
  if (finished && isIdle) {
    const currentMotionSet = MAPPINGS.motions[props.personality] || MAPPINGS.motions['元気系']
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