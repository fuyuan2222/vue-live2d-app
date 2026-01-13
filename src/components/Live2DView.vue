<template>
  <div class="live2d-canvas-container">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import * as PIXI from 'pixi.js';

// ★重要：props定義
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

// ■■■ IDマッピング表（ご自身のモデルIDに合わせてください） ■■■
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

  // ★修正1：PIXIを確実にウィンドウに登録してからライブラリを読み込む
  window.PIXI = PIXI;
  
  // ★修正2：読み込み順序バグを防ぐため、ここで動的にインポートする
  const { Live2DModel } = await import('pixi-live2d-display/cubism4');

  app = new PIXI.Application({
    view: canvasRef.value,
    resizeTo: canvasRef.value.parentElement,
    backgroundAlpha: 0, // ★もし画面が真っ白なら、ここを 0.5 にしてグレーが出るか確認してください
    autoStart: true,
    resolution: window.devicePixelRatio || 2,
    autoDensity: true,
    antialias: true
  });

  // モデル読み込み
  // ★重要：このパスにファイルが本当にありますか？ブラウザの開発者ツール(F12)のNetworkタブで404になっていないか確認を！
  try {
    model = await Live2DModel.from('/live2d/study/study.model3.json', {
      autoInteract: false
    });

    // 位置・サイズ調整
    model.anchor.set(0.5, 1.0);
    model.x = app.screen.width / 2;
    model.y = app.screen.height;
    
    // 画面サイズに合わせてスケール調整
    const scale = Math.min(app.screen.width / model.width, app.screen.height / model.height) * 1.8;
    model.scale.set(scale);

    app.stage.addChild(model);

    // 初期反映
    updateAppearance();
    playMotionByState();
    
    console.log("Model loaded successfully!"); // 成功ログ
  } catch (e) {
    console.error("Model loading failed:", e);
  }

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

// ■ モーション再生
const playMotionByState = () => {
  if (!model) return;
  const set = MAPPINGS.motions[props.personality] || MAPPINGS.motions['元気系'];
  const motion = (props.emotion === 'celebrate') ? set.success : set.idle;
  
  try {
    // 優先度3で強制再生
    model.motion(motion, 0, 3);
  } catch (e) {
    console.warn('Motion error:', e);
  }
};

watch(() => [props.frontHairstyle, props.backHairstyle, props.eyes, props.personality], () => updateAppearance());
watch(() => [props.personality, props.emotion], () => playMotionByState());

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
  /* ちゃんと親要素いっぱいに広がるように指定 */
  display: flex;
  justify-content: center;
  align-items: flex-end;
}
canvas {
  /* キャンバス自体のサイズも保証 */
  width: 100%;
  height: 100%;
}
</style>