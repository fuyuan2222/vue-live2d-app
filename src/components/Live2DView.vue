<template>
  <div class="live2d-canvas-container">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import * as PIXI from 'pixi.js';
// ★重要：Cubism 4専用モードで読み込む（Hiyoriと同じ構成）
import { Live2DModel } from 'pixi-live2d-display/cubism4';

// windowにPIXIを登録
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

// ■ 設定：IDマッピング表（あなたのモデル用）
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
      '一つ結び': 'ParamHairBack_One',
      'ショート': 'ParamHairBack_Short',
      'サイドテール': 'ParamHairBack_Side'
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

  // 1. PIXIアプリケーション作成
  app = new PIXI.Application({
    view: canvasRef.value,
    resizeTo: canvasRef.value.parentElement, // 親サイズに合わせる
    backgroundAlpha: 0,
    autoStart: true
  });

  // ★★★【重要】クラッシュ防止策 ★★★
  // Hiyoriで成功した「イベント機能の完全破壊」をここでもやります
  if (app.renderer.events) {
    app.renderer.events.destroy();
    delete app.renderer.events;
  }
  if (app.renderer.plugins && app.renderer.plugins.interaction) {
    app.renderer.plugins.interaction.destroy();
    delete app.renderer.plugins.interaction;
  }

  // 2. モデル読み込み
  // ※パスはあなたのモデルに合わせています
  model = await Live2DModel.from('/live2d/study/study.model3.json', {
    autoInteract: false // 自動視線追従などをオフ（安定性重視）
  });

  // 3. サイズ・位置調整（画面中央下に配置）
  model.anchor.set(0.5, 1.0); // 足元中心
  model.x = app.screen.width / 2;
  model.y = app.screen.height;
  
  // スケール調整
  const scale = Math.min(app.screen.width / model.width, app.screen.height / model.height) * 1.8;
  model.scale.set(scale);

  app.stage.addChild(model);

  // 4. 初期状態の反映
  updateAppearance();
  playMotionByState();

  // ★重要：イベントシステムを破壊したので model.on('hit') は書きません。
  // 書いても動かないし、エラーの原因になるため削除しました。
  
  console.log('Study Model Loaded. Event System Destroyed (Crash prevention mode).');
  
  // リサイズ対応
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
    Object.entries(map).forEach(([key, paramId]) => {
      const value = (key === selectedValue) ? 1 : 0;
      core.setParameterValueById(paramId, value);
    });
  };

  setParamGroup('frontHairstyle', props.frontHairstyle);
  setParamGroup('backHairstyle', props.backHairstyle);
  setParamGroup('eyes', props.eyes);
  core.update();
};

// ■ モーション再生ロジック
const playMotionByState = () => {
  if (!model) return;

  const personalitySuffix = MAPPINGS.personality[props.personality] || 'Genki';
  let groupName = `Idle_${personalitySuffix}`; 
  let priority = 1;

  if (props.emotion === 'celebrate') {
    groupName = `Success_${personalitySuffix}`;
    priority = 3; 
  }

  // エラーで止まらないようにtry-catchで囲む
  try {
    model.motion(groupName, 0, priority);
  } catch (e) {
    console.warn('Motion play failed:', e);
  }
};

// ■ 監視（Propsが変わったら即反映）
watch(() => [props.frontHairstyle, props.backHairstyle, props.eyes], () => updateAppearance());
watch(() => [props.personality, props.emotion], () => playMotionByState());

// リサイズ処理
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
  align-items: flex-end; /* 下揃え */
  /* ★タッチイベントを無効化してクラッシュを防ぐ */
  pointer-events: none; 
}
canvas {
  width: 100%;
  height: 100%;
}
</style>