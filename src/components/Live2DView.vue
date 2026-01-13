<template>
  <div class="live2d-canvas-container">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import * as PIXI from 'pixi.js';
import { Live2DModel } from 'pixi-live2d-display/cubism4';

window.PIXI = PIXI;

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

// ■■■ 設定：IDマッピング表 ■■■
const MAPPINGS = {
  // ★重要修正：JSONファイルの名前と一字一句同じにします
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
  
  // 服装パラメータ
  outfits: {
    '元気系': 'Outfit_Power',
    '癒し系': 'Outfit_heal', 
    'クール系': 'Outfit_Cool'
  },

  // 髪型・目
  params: {
    frontHairstyle: {
      'ぱっつん': 'ParamFrontHait_pattun',
      '３つ分け': 'ParamFrontHair_Three',
      '２・８分け': 'ParamFrontHair_TowEight'
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

  app = new PIXI.Application({
    view: canvasRef.value,
    resizeTo: canvasRef.value.parentElement,
    backgroundAlpha: 0,
    autoStart: true,
    resolution: window.devicePixelRatio || 2,
    autoDensity: true,
    antialias: true
  });

  // クラッシュ防止
  if (app.renderer.events) {
    app.renderer.events.destroy();
    delete app.renderer.events;
  }
  if (app.renderer.plugins && app.renderer.plugins.interaction) {
    app.renderer.plugins.interaction.destroy();
    delete app.renderer.plugins.interaction;
  }

  // モデル読み込み
  model = await Live2DModel.from('/live2d/study/study.model3.json', {
    autoInteract: false
  });

  model.anchor.set(0.5, 1.0);
  model.x = app.screen.width / 2;
  model.y = app.screen.height;
  
  const scale = Math.min(app.screen.width / model.width, app.screen.height / model.height) * 1.8;
  model.scale.set(scale);

  app.stage.addChild(model);

  updateAppearance();
  playMotionByState();

  window.addEventListener('resize', onResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
  if (app) {
    app.destroy(true, { children: true });
  }
});

// ■ 着せ替えロジック
const updateAppearance = () => {
  if (!model) return;
  const core = model.internalModel.coreModel;

  // 1. 服装切り替え
  const outfitMap = MAPPINGS.outfits;
  Object.entries(outfitMap).forEach(([personalityName, paramId]) => {
    // 現在の性格なら1、それ以外は0
    const val = (personalityName === props.personality) ? 1 : 0;
    core.setParameterValueById(paramId, val);
  });

  // 2. 髪型・目の切り替え
  const setParamGroup = (categoryName, selectedValue) => {
    const map = MAPPINGS.params[categoryName];
    if (!map) return;
    Object.entries(map).forEach(([optionName, paramId]) => {
      const value = (optionName === selectedValue) ? 1 : 0;
      core.setParameterValueById(paramId, value);
    });
  };

  setParamGroup('frontHairstyle', props.frontHairstyle);
  setParamGroup('backHairstyle', props.backHairstyle);
  setParamGroup('eyes', props.eyes);
  
  core.update();
};

// ■ モーション再生（ここを修正！）
const playMotionByState = () => {
  if (!model) return;
  
  // マッピングから、性格に応じた「モーション名セット」を取得
  const motionSet = MAPPINGS.motions[props.personality];
  
  // もし定義が見つからなければデフォルト（元気系）へ
  const targetSet = motionSet || MAPPINGS.motions['元気系'];

  let groupName = targetSet.idle; // デフォルトは待機モーション
  let priority = 1;

  // 感情がcelebrateなら成功モーションへ
  if (props.emotion === 'celebrate') {
    groupName = targetSet.success;
    priority = 3; 
  }

  try {
    // 指定したグループ名を再生
    console.log(`Playing Motion: ${groupName}`); // デバッグ用ログ
    model.motion(groupName, 0, priority);
  } catch (e) {
    console.warn('Motion play failed:', e);
  }
};

watch(
  () => [props.frontHairstyle, props.backHairstyle, props.eyes, props.personality], 
  () => updateAppearance()
);

watch(
  () => [props.personality, props.emotion], 
  () => playMotionByState()
);

const onResize = () => {
  if (!app || !model) return;
  app.resize();
  model.x = app.screen.width / 2;
  model.y = app.screen.height;
};
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