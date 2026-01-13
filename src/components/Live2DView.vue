<template>
  <div class="live2d-canvas-container">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import * as PIXI from 'pixi.js';
import { Live2DModel } from 'pixi-live2d-display/cubism4';

// windowにPIXIを登録
window.PIXI = PIXI;

const props = defineProps({
  emotion: { type: String, default: 'idle' },
  personality: { type: String, default: '元気系' },
  frontHairstyle: { type: String, default: 'ぱっつん' },
  // ★デフォルトをサイドテールに変更
  backHairstyle: { type: String, default: 'サイドテール' }, 
  eyes: { type: String, default: '丸目' }
});

const canvasRef = ref(null);
let app = null;
let model = null;

// ■■■ 設定：IDマッピング表（確定版） ■■■
const MAPPINGS = {
  personality: {
    '元気系': 'Genki',
    '癒し系': 'Iyashi',
    'クール系': 'Cool'
  },
  params: {
    frontHairstyle: {
      'ぱっつん': 'ParamHairFront_pattun',
      '３つ分け': 'ParamHairFront_Three',
      '２・８分け': 'ParamHairFront_TowEight'
    },
    backHairstyle: {
      // ★修正箇所：ここにカンマ(,)が必要でした！
      'サイドテール': 'ParamHairBack_Side',
      '一つ結び': 'ParamHairBack_One',
      'ショート': 'ParamHairBack_Short'
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

  // 1. PIXI作成
  app = new PIXI.Application({
    view: canvasRef.value,
    resizeTo: canvasRef.value.parentElement,
    backgroundAlpha: 0,
    autoStart: true,
    resolution: window.devicePixelRatio || 2, // スマホの画素密度に合わせる
    autoDensity: true, // CSSサイズと内部解像度を同期させる
    antialias: true    // ギザギザを滑らかにする
  });

  // クラッシュ防止（イベント破壊）
  if (app.renderer.events) {
    app.renderer.events.destroy();
    delete app.renderer.events;
  }
  if (app.renderer.plugins && app.renderer.plugins.interaction) {
    app.renderer.plugins.interaction.destroy();
    delete app.renderer.plugins.interaction;
  }

  // 2. モデル読み込み
  model = await Live2DModel.from('/live2d/study/study.model3.json', {
    autoInteract: false
  });

  // 3. サイズ・位置調整
  model.anchor.set(0.5, 1.0);
  model.x = app.screen.width / 2;
  model.y = app.screen.height;
  
  const scale = Math.min(app.screen.width / model.width, app.screen.height / model.height) * 1.8;
  model.scale.set(scale);

  app.stage.addChild(model);

  // 4. 初期反映
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

  const setParamGroup = (categoryName, selectedValue) => {
    const map = MAPPINGS.params[categoryName];
    if (!map) return;

    Object.entries(map).forEach(([optionName, paramId]) => {
      // 選択された名前と一致すれば1、それ以外は0
      const value = (optionName === selectedValue) ? 1 : 0;
      core.setParameterValueById(paramId, value);
    });
  };

  setParamGroup('frontHairstyle', props.frontHairstyle);
  setParamGroup('backHairstyle', props.backHairstyle);
  setParamGroup('eyes', props.eyes);
  
  core.update();
};

// ■ モーション再生
const playMotionByState = () => {
  if (!model) return;
  const personalitySuffix = MAPPINGS.personality[props.personality] || 'Genki';
  let groupName = `Idle_${personalitySuffix}`; 
  let priority = 1;

  if (props.emotion === 'celebrate') {
    groupName = `Success_${personalitySuffix}`;
    priority = 3; 
  }

  try {
    model.motion(groupName, 0, priority);
  } catch (e) {
    console.warn('Motion play failed:', e);
  }
};

watch(
  () => [props.frontHairstyle, props.backHairstyle, props.eyes], 
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