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
let isDebugLogged = false // デバッグログ用フラグ

/* =====================
   マッピング定義
===================== */
const MAPPINGS = {
  motions: {
    '元気系': { idle: 'Idle_Genki', success: 'Success_Genki' },
    '癒し系': { idle: 'Idle_Heal',  success: 'Success_Heal' },
    'クール系': { idle: 'Idle_Cool',  success: 'Success_Cool' }
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
      '丸目': 'ParamEyeType_Round', // ※ID名要確認
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

  // モデル読み込み
  model = await Live2DModel.from(
    '/live2d/study/study.model3.json',
    { autoInteract: false }
  )

  // ■ 位置合わせ（足元基準）
  model.anchor.set(0.5, 1.0) 
  model.x = app.screen.width / 2
  model.y = app.screen.height

  // ■ スケール調整
  // 1.6倍は大きすぎて顔が見切れる可能性が高いので、まずは0.8倍くらいからスタート推奨
  const scale = Math.min(
      app.screen.width / model.width,
      app.screen.height / model.height
  ) * 0.9; 

  model.scale.set(scale)
  app.stage.addChild(model)

  // ■ 毎フレーム更新（パラメータ強制上書き）
  app.ticker.add(() => {
    updateAppearance()
  })

  // 初回モーション再生
  playMotionByState()

  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (app) app.destroy(true, { children: true })
})

/* =====================
   見た目切り替え（パラメータ更新）
===================== */
const updateAppearance = () => {
  if (!model) return
  const core = model.internalModel.coreModel

  // ★★★ デバッグ機能：修正版 ★★★
  // C++の配列は .includes() が使えないため、ループでIDリストを作る必要があります
  if (!isDebugLogged) {
    console.group("🔍 Live2D ID Check Mode")
    
    // 1. モデル内の全パラメータIDを取得してJSの配列にする
    const paramCount = core.getParameterCount()
    const allIds = []
    for(let i=0; i<paramCount; i++){
        allIds.push(core.getParameterId(i))
    }
    console.log("Model has these IDs:", allIds)

    // 2. マッピングとの照合
    const checkGroup = (groupName, currentVal) => {
        const map = MAPPINGS.params[groupName]
        if(!map) return
        Object.entries(map).forEach(([name, id]) => {
            const exists = allIds.includes(id) // これでチェック可能になる
            const icon = exists ? "✅" : "❌ NOT FOUND"
            const styles = exists ? "color: green" : "color: red; font-weight: bold"
            console.log(`%c[${groupName}] ${name} -> ${id} : ${icon}`, styles)
        })
    }
    checkGroup('frontHairstyle', props.frontHairstyle)
    checkGroup('backHairstyle', props.backHairstyle)
    checkGroup('eyes', props.eyes)
    checkGroup('outfits', 'CheckOutfitParams') // 服装パラメータも確認用

    console.groupEnd()
    isDebugLogged = true
  }
  // ★★★★★★★★★★★★★★★★★

  // ■ 服装
  Object.entries(MAPPINGS.outfits).forEach(([key, paramId]) => {
    // IDが存在するかチェックしてからセット（エラー防止）
    if(core.getParameterIndex(paramId) !== -1) {
        core.setParameterValueById(paramId, key === props.personality ? 1 : 0)
    }
  })

  // ■ 髪・目
  const setParamGroup = (group, selected) => {
    const map = MAPPINGS.params[group]
    if(!map) return
    Object.entries(map).forEach(([name, id]) => {
       if(core.getParameterIndex(id) !== -1) {
          core.setParameterValueById(id, name === selected ? 1 : 0)
       }
    })
  }

  setParamGroup('frontHairstyle', props.frontHairstyle)
  setParamGroup('backHairstyle', props.backHairstyle)
  setParamGroup('eyes', props.eyes)
  
  // 更新通知
  model.internalModel.update()
}

/* =====================
   モーション再生
===================== */
const playMotionByState = () => {
  if (!model) return

  const motionSet = MAPPINGS.motions[props.personality] || MAPPINGS.motions['元気系']
  let groupName = motionSet.idle
  let priority = 1 // 1: Idle, 2: Normal, 3: Force

  if (props.emotion === 'celebrate') {
    groupName = motionSet.success
    priority = 3
  }

  // 再生（エラーが出ても止まらないようにtry-catch）
  try {
      // 第2引数はindex(基本的に0), 第3引数は優先度
      model.motion(groupName, 0, priority)
  } catch(e) {
      console.warn(`Motion [${groupName}] not found or failed.`, e)
  }
}

/* =====================
   Watch & Resize
===================== */
watch(
  () => [props.personality, props.emotion],
  () => { playMotionByState() },
  { immediate: false } // onMountedで一度呼ぶのでfalse推奨
)

const onResize = () => {
  if (!app || !model) return
  app.resize()
  // リサイズ時も中央下揃え
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