<template>
  <div class="live2d-canvas-container">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import * as PIXI from 'pixi.js';

// props定義
const props = defineProps({
  emotion: { type: String, default: 'idle' },
  personality: { type: String, default: '元気系' },
  frontHairstyle: { type: String, default: 'ぱっつん' },
  backHairstyle: { type: String, default: 'サイドテール' }, 
  eyes: { type: String, default: '丸目' }
});

const canvasRef = ref(null);
let app = null;
let model = null;

// IDマッピング表
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
      '丸目': 'ParamEyeType_Round',
      'たれ目': 'ParamEyeType_Droop',
      '釣り目': 'ParamEyeType_Sharp'
    }
  }
};

onMounted(async () => {
  if (!canvasRef.value) return;

  window.PIXI = PIXI;
  // Dynamic import
  const { Live2DModel } = await import('pixi-live2d-display/cubism4');

  app = new PIXI.Application({
    view: canvasRef.value,
    resizeTo: canvasRef.value.parentElement,
    backgroundAlpha: 0.5, // 確認用にグレー背景
    autoStart: true,
  });

  try {
    model = await Live2DModel.from('/live2d/study/study.model3.json', { autoInteract: false });

    // ■■■ 診断モード：画面中央に強制配置 ■■■
    model.anchor.set(0.5, 0.5);
    model.x = app.screen.width / 2;
    model.y = app.screen.height / 2;
    
    // 0.8倍で全体表示を狙う
    const scale = Math.min(app.screen.width / model.width, app.screen.height / model.height) * 0.8;
    model.scale.set(scale);

    app.stage.addChild(model);
    console.log("Model loaded successfully!");

    // ■■■ ID確認ログ出力 ■■■
    const core = model.internalModel.coreModel;
    
    console.warn("▼▼▼ パラメータID一覧 ▼▼▼");
    const paramCount = core.getParameterCount();
    for (let i = 0; i < paramCount; i++) {
        console.log(`ID: ${core.getParameterId(i)} | Val: ${core.getParameterValueByIndex(i)}`);
    }

    console.warn("▼▼▼ パーツID一覧 ▼▼▼");
    const partCount = core.getPartCount();
    for (let i = 0; i < partCount; i++) {
        console.log(`ID: ${core.getPartId(i)} | Opacity: ${core.getPartOpacityByIndex(i)}`);
    }

    // ★着せ替えロジックは今は止めておく（原因特定のため）
    // updateAppearance(); 
    // playMotionByState();

  } catch (e) {
    console.error("Load failed:", e);
  }

  window.addEventListener('resize', onResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
  if (app) {
    app.destroy(true, { children: true });
  }
});

// ロジック関数定義（呼んではないけど置いておく）
const updateAppearance = () => {
  if (!model) return;
  const core = model.internalModel.coreModel;
  
  // 服装
  Object.entries(MAPPINGS.outfits).forEach(([pName, pId]) => {
    core.setParameterValueById(pId, (pName === props.personality) ? 1 : 0);
  });
  // 髪・目
  const setParam = (cat, val) => {
    const map = MAPPINGS.params[cat];
    if (!map) return;
    Object.entries(map).forEach(([opt, id]) => {
      core.setParameterValueById(id, (opt === val) ? 1 : 0);
    });
  };
  setParam('frontHairstyle', props.frontHairstyle);
  setParam('backHairstyle', props.backHairstyle);
  setParam('eyes', props.eyes);
  
  model.internalModel.update();
};

const playMotionByState = () => {
  if (!model) return;
  const set = MAPPINGS.motions[props.personality] || MAPPINGS.motions['元気系'];
  const motion = (props.emotion === 'celebrate') ? set.success : set.idle;
  try {
    model.motion(motion, 0, 3);
  } catch (e) {}
};

watch(() => [props.frontHairstyle, props.backHairstyle, props.eyes, props.personality], () => updateAppearance());
watch(() => [props.personality, props.emotion], () => playMotionByState());

const onResize = () => {
  if (!app || !model) return;
  app.resize();
  model.x = app.screen.width / 2;
  model.y = app.screen.height / 2; // 診断モードなので中央配置
};
</script>

<style scoped>
.live2d-canvas-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}
canvas {
  width: 100%;
  height: 100%;
}
</style>