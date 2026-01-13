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

  // ★重要修正：PIXIを登録してから、Live2Dライブラリを「動的に」読み込む
  window.PIXI = PIXI;
  const { Live2DModel } = await import('pixi-live2d-display/cubism4');

  app = new PIXI.Application({
    view: canvasRef.value,
    resizeTo: canvasRef.value.parentElement,
    backgroundAlpha: 0.5, // ★背景をグレーにしてモデルを見やすくする
    autoStart: true,
    resolution: window.devicePixelRatio || 2,
    autoDensity: true,
    antialias: true
  });

  try {
    model = await Live2DModel.from('/live2d/study/study.model3.json', { autoInteract: false });

    // ■■■■■ ここが修正ポイント！ ■■■■■
    
    // 1. アンカーを「足元(1.0)」から「中心(0.5)」に変更
    model.anchor.set(0.5, 0.5);

    // 2. 画面の「ど真ん中」に配置
    model.x = app.screen.width / 2;
    model.y = app.screen.height / 2;
    
    // 3. スケールを「1.8倍」から「0.6倍」に縮小して全体を映す
    const scale = Math.min(app.screen.width / model.width, app.screen.height / model.height) * 0.6;
    model.scale.set(scale);

    app.stage.addChild(model);
    console.log("Model loaded successfully!");

    // ■■■ 正しいIDをコンソールに出力 ■■■
    const core = model.internalModel.coreModel;
    console.warn("▼▼▼ パラメータID一覧 (ここにあるIDをMAPPINGSに書いてください) ▼▼▼");
    const paramCount = core.getParameterCount();
    for (let i = 0; i < paramCount; i++) {
        console.log(`ID: ${core.getParameterId(i)}`);
    }

    // 初期表示の反映
    updateAppearance();
    playMotionByState();

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
    // もしIDが間違っていても止まらないようにチェックを入れる
    if (core.getParameterIndex(pId) !== -1) {
      const val = (pName === props.personality) ? 1 : 0;
      core.setParameterValueById(pId, val);
    }
  });

  // 髪型・目
  const setParamGroup = (categoryName, selectedValue) => {
    const map = MAPPINGS.params[categoryName];
    if (!map) return;
    Object.entries(map).forEach(([optionName, paramId]) => {
       if (core.getParameterIndex(paramId) !== -1) {
          const value = (optionName === selectedValue) ? 1 : 0;
          core.setParameterValueById(paramId, value);
       }
    });
  };

  setParamGroup('frontHairstyle', props.frontHairstyle);
  setParamGroup('backHairstyle', props.backHairstyle);
  setParamGroup('eyes', props.eyes);
  
  model.internalModel.update();
};

// ■ モーション再生
const playMotionByState = () => {
  if (!model) return;
  const motionSet = MAPPINGS.motions[props.personality] || MAPPINGS.motions['元気系'];
  
  let groupName = motionSet.idle;
  if (props.emotion === 'celebrate') {
    groupName = motionSet.success;
  }

  try {
    model.motion(groupName, 0, 1);
  } catch (e) {
    console.warn(`Motion error: ${groupName}`, e);
  }
};

watch(() => [props.frontHairstyle, props.backHairstyle, props.eyes, props.personality], () => updateAppearance());
watch(() => [props.personality, props.emotion], () => playMotionByState());

const onResize = () => {
  if (!app || !model) return;
  app.resize();
  model.x = app.screen.width / 2;
  model.y = app.screen.height / 2; // 中心配置
};
</script>