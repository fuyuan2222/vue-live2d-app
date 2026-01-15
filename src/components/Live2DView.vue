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

let touchStartX = 0
let touchStartY = 0

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

const attemptHit = async (clientX, clientY) => {
  if (!model || !canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const x = clientX - rect.left
  const y = clientY - rect.top
  const hitAreas = model.hitTest(x, y)

  if (hitAreas.length > 0) {
    console.log('Hit Area:', hitAreas)

    const motionSet = MAPPINGS.motions[props.personality] || MAPPINGS.motions['元気系']
    const actionMotion = motionSet.cheer

    try {
      model.internalModel.motionManager.stopAllMotions()
      await model.motion(actionMotion, 0, { priority: 3 })
      playMotionByState()
    } catch (e) {
      console.log('Motion interrupted', e)
    }
  }
}

const handleGlobalClick = (event) => {
  if (event.target.closest('button, input, label, a, .task-text, .delete-icon-btn, .modal-content')) {
    return
  }
  attemptHit(event.clientX, event.clientY)
}

const handleTouchStart = (event) => {
  if (event.touches.length > 0) {
    touchStartX = event.touches[0].clientX
    touchStartY = event.touches[0].clientY
  }
}

const handleTouchEnd = (event) => {
  if (event.target.closest('button, input, label, a, .task-text, .delete-icon-btn, .modal-content')) {
    return
  }

  if (event.changedTouches.length > 0) {
    const endX = event.changedTouches[0].clientX
    const endY = event.changedTouches[0].clientY

    const diffX = Math.abs(endX - touchStartX)
    const diffY = Math.abs(endY - touchStartY)

    if (diffX < 10 && diffY < 10) {
      attemptHit(endX, endY)
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
  window.addEventListener('click', handleGlobalClick)
  window.addEventListener('touchstart', handleTouchStart, { passive: true })
  window.addEventListener('touchend', handleTouchEnd)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  window.removeEventListener('click', handleGlobalClick)
  window.removeEventListener('touchstart', handleTouchStart)
  window.removeEventListener('touchend', handleTouchEnd)
  
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
  pointer-events: none; 
}

canvas {
  width: 100%;
  height: 100%;
  pointer-events: none; 
}
</style>