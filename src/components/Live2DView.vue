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

const MAPPINGS = {
  motions: {
    '元気系': { idle: 'Idle_Genki', cheer: 'Cheer_Genki', success: 'Success_Genki' },
    '癒し系': { idle: 'Idle_Heal',  cheer: 'Cheer_Heal',  success: 'Success_Heal' },
    'クール系': { idle: 'Idle_Cool',  cheer: 'Cheer_Cool',  success: 'Success_Cool' }
  },
  outfits: {
    '元気系': ['Outfit_Power'], 
    '癒し系': ['Outfit_Heal'],
    'クール系': ['Outfit_Cool']
  },
  params: {
    frontHairstyle: {
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

// ★修正: グローバルクリックハンドラ
// タスク操作を邪魔せず、かつ「前のモーションを即停止」して反応させる
const handleGlobalClick = async (event) => {
  // ① UIパーツ（ボタンやタスク、チェックボックスなど）を除外
  if (event.target.closest('button, input, label, a, .task-text, .delete-icon-btn')) {
    return
  }

  if (!model || !canvasRef.value) return

  // ② 座標計算
  const rect = canvasRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  // ③ HitTest判定
  const hitAreas = model.hitTest(x, y)

  if (hitAreas.length > 0) {
    console.log('Hit Area:', hitAreas)

    const motionSet = MAPPINGS.motions[props.personality] || MAPPINGS.motions['元気系']
    // クリック時はCheerモーション（必要に応じてHead/Bodyで分岐可能）
    const actionMotion = motionSet.cheer

    try {
      // ★★★ ここが重要！ ★★★
      // 再生中の全モーションを強制停止させ、クロスフェードなしで切り替える
      model.internalModel.motionManager.stopAllMotions()

      // 新しいモーションを再生
      await model.motion(actionMotion, 0, { priority: 3 })
      
      // 再生終了後は通常のループに戻る
      playMotionByState()
    } catch (e) {
      console.log('Motion interrupted', e)
    }
  }
}

onMounted(async () => {
  if (!canvasRef.value) return

  app = new PIXI.Application({
    view: canvasRef.value,
    resizeTo: canvasRef.value.parentElement,
    backgroundAlpha: 0,
    antialias: true,
    autoDensity: true,
    resolution: window.devicePixelRatio || 2,
  })

  if (app.renderer.events) {
    app.renderer.events.destroy()
    delete app.renderer.events
  }

  try {
    model = await Live2DModel.from(
      '/live2d/study/study.model3.json',
      { autoInteract: false, loadPose: false }
    )
  } catch (e) {
    console.error("モデル読み込みエラー:", e)
    return
  }

  window.live2d = model

  const ratio = 0.85;
  const scale = (app.screen.height / model.internalModel.originalHeight) * ratio;
  model.scale.set(scale);

  model.anchor.set(0.5, 1.0);
  model.x = app.screen.width / 2;
  model.y = app.screen.height;

  app.stage.addChild(model)

  app.ticker.add(updateAppearance, null, PIXI.UPDATE_PRIORITY.UTILITY)

  playMotionByState()

  window.addEventListener('resize', onResize)
  
  // ★重要: クリックイベント登録
  window.addEventListener('click', handleGlobalClick)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  // ★重要: イベント解除
  window.removeEventListener('click', handleGlobalClick)
  
  if (app) app.destroy(true, { children: true })
})

const updateAppearance = () => {
  if (!model) return
  const core = model.internalModel.coreModel

  const applySettings = (idOrArray, isActive) => {
    const ids = Array.isArray(idOrArray) ? idOrArray : [idOrArray]
    const value = isActive ? 1 : 0
    ids.forEach(id => {
      core.setParameterValueById(id, value)
      core.setPartOpacityById(id, value)
    })
  }

  Object.entries(MAPPINGS.outfits).forEach(([key, ids]) => {
    applySettings(ids, key === props.personality)
  })

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

const playMotionByState = async () => {
  if (!model) return
  
  const motionSet = MAPPINGS.motions[props.personality] || MAPPINGS.motions['元気系']
  
  let groupName = motionSet.idle
  let priority = 1

  if (props.emotion === 'celebrate') {
    groupName = motionSet.success
    priority = 3
  } else if (props.emotion === 'cheer') {
    groupName = motionSet.cheer
    priority = 2
  }

  try {
    const finished = await model.motion(groupName, 0, { priority })
    if (finished && props.emotion !== 'celebrate') {
      playMotionByState()
    }
  } catch (e) {
    // 割り込み発生時は無視
  }
}

watch(() => [props.personality, props.emotion], () => { playMotionByState() }, { immediate: true })

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
  /* ★重要: ここをクリック透過にしておかないと、背面のタスクが押せなくなる */
  pointer-events: none; 
}

canvas {
  width: 100%;
  height: 100%;
  /* Canvas自体もクリック透過 */
  pointer-events: none; 
}
</style>