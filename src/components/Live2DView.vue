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

// ★ ID定義（ここはあなたの環境の正しいIDのままにしています）
const MAPPINGS = {
  motions: {
    '元気系': { idle: 'Idle_Genki', success: 'Success_Genki' },
    '癒し系': { idle: 'Idle_Heal', success: 'Success_Heal' },
    'クール系': { idle: 'Idle_Cool', success: 'Success_Cool' }
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
  model = await Live2DModel.from('/live2d/study/study.model3.json', {
    autoInteract: false,
    // ★重要：ポーズ機能を無効化（勝手なパーツ切り替えを防ぐ）
    loadPose: false
  })

  model.anchor.set(0.5, 1)
  model.x = app.screen.width / 2
  model.y = app.screen.height
  
  const scale = Math.min(app.screen.width / model.width, app.screen.height / model.height) * 1.6
  model.scale.set(scale)
  app.stage.addChild(model)

  // ★重要：モーション計算後に強制上書き（優先度 UTILITY）
  app.ticker.add(updateAppearance, null, PIXI.UPDATE_PRIORITY.UTILITY)

  // 最初のモーション再生
  playMotionByState()

  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (app) app.destroy(true, { children: true })
})

// ■■■ 修正ポイント1：パラメータとパーツの両方を叩く ■■■
const updateAppearance = () => {
  if (!model) return
  const core = model.internalModel.coreModel

  // ヘルパー関数：パラメータとパーツ不透明度の両方に値をセットする
  // これでIDがどっちであっても確実に反応する
  const setBoth = (id, value) => {
    core.setParameterValueById(id, value) // パラメータ用
    core.setPartOpacityById(id, value)    // パーツ用
  }

  // 服装
  Object.entries(MAPPINGS.outfits).forEach(([key, paramId]) => {
    setBoth(paramId, key === props.personality ? 1 : 0)
  })

  // 髪・目
  const setParamGroup = (group, selected) => {
    const map = MAPPINGS.params[group]
    Object.entries(map).forEach(([name, id]) => {
      setBoth(id, name === selected ? 1 : 0)
    })
  }

  setParamGroup('frontHairstyle', props.frontHairstyle)
  setParamGroup('backHairstyle', props.backHairstyle)
  setParamGroup('eyes', props.eyes)
}

// ■■■ 修正ポイント2：確実にループさせるロジック ■■■
const playMotionByState = async () => {
  if (!model) return

  const motionSet = MAPPINGS.motions[props.personality] || MAPPINGS.motions['元気系']
  let groupName = motionSet.idle
  let priority = 1 // 待機は低優先度
  let isIdle = true

  if (props.emotion === 'celebrate') {
    groupName = motionSet.success
    priority = 3 // 成功は高優先度（強制再生）
    isIdle = false
  }

  // 再生実行
  const result = await model.motion(groupName, 0, { priority })

  // ループ判定
  // resultがtrueなら正常終了。falseなら何かに割り込まれたか失敗。
  if (result === true && isIdle) {
    // まだ設定が変わっていなければ、再度自分自身を呼んでループする
    const currentSet = MAPPINGS.motions[props.personality] || MAPPINGS.motions['元気系']
    if (groupName === currentSet.idle && props.emotion !== 'celebrate') {
      playMotionByState()
    }
  }
}

// 監視
watch(
  () => [props.personality, props.emotion],
  () => {
    // 設定が変わったら即座に新しいモーションを再生（今のループはキャンセルされる）
    playMotionByState()
  }
)

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