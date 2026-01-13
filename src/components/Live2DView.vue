<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import * as PIXI from 'pixi.js';
import { Live2DModel } from 'pixi-live2d-display/cubism4';

// PIXIをウィンドウに公開（デバッグ用・プラグイン用）
window.PIXI = PIXI;

// ★ propsは1回だけ定義（デフォルト値付きの方を採用）
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
// ※ Live2D Editor上のIDと完全に一致させる必要があります
const MAPPINGS = {
  // モーショングループ名
  motions: {
    '元気系': { idle: 'Idle_Genki', success: 'Success_Genki' },
    '癒し系': { idle: 'Idle_Heal',  success: 'Success_Heal' },
    'クール系': { idle: 'Idle_Cool',  success: 'Success_Cool' }
  },
  
  // 服装パラメータID
  outfits: {
    '元気系': 'Outfit_Power',
    '癒し系': 'Outfit_heal', 
    'クール系': 'Outfit_Cool'
  },

  // 髪型・目 パラメータID
  params: {
    frontHairstyle: {
      'ぱっつん': 'ParamFrontHair_pattun',
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

  // モデル読み込み
  // ※パスが正しいか確認してください
  model = await Live2DModel.from('/live2d/study/study.model3.json', {
    autoInteract: false
  });

  // 位置・サイズ調整
  model.anchor.set(0.5, 1.0);
  model.x = app.screen.width / 2;
  model.y = app.screen.height;
  
  const scale = Math.min(app.screen.width / model.width, app.screen.height / model.height) * 1.8;
  model.scale.set(scale);

  app.stage.addChild(model);

  // 初期表示の反映
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
  
  // Cubism4の場合のコアモデル参照
  const core = model.internalModel.coreModel;

  // 1. 服装切り替え
  const outfitMap = MAPPINGS.outfits;
  Object.entries(outfitMap).forEach(([personalityName, paramId]) => {
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
  
  // パラメータ更新を通知（必須ではない場合もありますが念のため）
  model.internalModel.update();
};

// ■ モーション再生
const playMotionByState = () => {
  if (!model) return;
  
  const motionSet = MAPPINGS.motions[props.personality] || MAPPINGS.motions['元気系'];
  
  let groupName = motionSet.idle;
  let priority = 1;

  if (props.emotion === 'celebrate') {
    groupName = motionSet.success;
    priority = 3; 
  }

  try {
    // モーション再生（グループ名が存在しないとエラーになるので注意）
    model.motion(groupName, 0, priority);
  } catch (e) {
    console.warn(`Motion play failed: ${groupName}`, e);
  }
};

// 監視設定
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