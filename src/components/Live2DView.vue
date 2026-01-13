<template>
  <canvas ref="canvasRef" class="live2d-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as PIXI from 'pixi.js';
import { Live2DModel } from 'pixi-live2d-display';

// PIXIをwindowに登録（必須）
window.PIXI = PIXI;

// ■ 親から受け取るデータ
const props = defineProps({
  // 感情/状態: 'idle', 'smile', 'celebrate' など
  emotion: { type: String, default: 'idle' },
  // 性格: '元気系', '癒し系', 'クール系'
  personality: { type: String, default: '元気系' },
  // カスタマイズ項目
  frontHairstyle: { type: String, default: 'ぱっつん' },
  backHairstyle: { type: String, default: 'ロング' },
  eyes: { type: String, default: '丸目' }
});

const canvasRef = ref(null);
let app = null;
let model = null;

// ■ 設定：IDマッピング表
// ★重要★ ここをご自身のLive2DパラメータIDに合わせて書き換えてください！
const MAPPINGS = {
  // 性格の変換表 (日本語 -> 英語サフィックス)
  personality: {
    '元気系': 'Genki',
    '癒し系': 'Iyashi',
    'クール系': 'Cool'
  },
  // 髪型・目の変換表 (選択肢 -> パラメータID)
  // 値を 1 にするパラメータIDを指定します
  params: {
    // 前髪
    frontHairstyle: {
      'ぱっつん': 'ParamHairFront_pattun',
      '３つ分け': 'ParamHairFront_Three',
      '２・８分け': 'ParamHairFront_TowEight'
    },
    // 後ろ髪
    backHairstyle: {
      '一つ結び': 'ParamHairBack_One',
      'ショート': 'ParamHairBack_Short',
      'サイドテール': 'ParamHairBack_Side'
    },
    // 目
    eyes: {
      '丸目': 'ParamEyeType_Round',
      'たれ目': 'ParamEyeType_Droop',
      '釣り目': 'ParamEyeType_Sharp'
    }
  }
};

onMounted(async () => {
  // 1. Pixi Application作成
  app = new PIXI.Application({
    view: canvasRef.value,
    autoStart: true,
    resizeTo: canvasRef.value.parentElement, // 親要素に合わせる
    backgroundAlpha: 0,
  });

  // 2. モデル読み込み
  // ※パスは実際の配置場所に合わせてください
  model = await Live2DModel.from('/live2d/study/study.model3.json');

  // 3. サイズ・位置調整
  // 画面中央下部に配置する設定
  model.anchor.set(0.5, 1.0); // 原点を足元中央に
  model.x = app.screen.width / 2;
  model.y = app.screen.height;
  
  // 画面サイズに応じてスケール調整（スマホで小さくなりすぎないように）
  const scale = Math.min(app.screen.width / model.width, app.screen.height / model.height) * 1.8;
  model.scale.set(scale);

  // 4. ステージに追加
  app.stage.addChild(model);

  // 5. 初期表示の反映
  updateAppearance();
  playMotionByState();

  // クリック・タップイベント
  model.on('hit', (hitAreas) => {
    if (hitAreas.includes('Body')) {
      playCheerMotion();
    }
  });

  // リサイズ対応
  window.addEventListener('resize', onResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
  if (app) app.destroy(true);
});

// ■ 見た目を更新する関数（着せ替え）
const updateAppearance = () => {
  if (!model) return;

  const core = model.internalModel.coreModel;

  // 1つのカテゴリ内のパラメータを処理するヘルパー関数
  const setParamGroup = (categoryName, selectedValue) => {
    const map = MAPPINGS.params[categoryName];
    if (!map) return;

    // 定義されている全IDをループして、選ばれたものだけ1、他は0にする
    Object.entries(map).forEach(([key, paramId]) => {
      const value = (key === selectedValue) ? 1 : 0;
      core.setParameterValueById(paramId, value);
    });
  };

  // 各パーツを更新
  setParamGroup('frontHairstyle', props.frontHairstyle);
  setParamGroup('backHairstyle', props.backHairstyle);
  setParamGroup('eyes', props.eyes);
  
  // 更新を反映
  core.update();
};

// ■ モーション再生ロジック
const playMotionByState = () => {
  if (!model) return;

  const personalitySuffix = MAPPINGS.personality[props.personality] || 'Genki';
  let groupName = `Idle_${personalitySuffix}`; // デフォルト
  let priority = 1;

  // emotionプロップに応じて再生するモーションを変える
  if (props.emotion === 'celebrate') {
    groupName = `Success_${personalitySuffix}`;
    priority = 3; // 優先度高
  } else if (props.emotion === 'smile') {
    // smileの時は Cheer モーションなどを割り当ててもOK
    // ここでは待機モーションのままにするか、応援にするか
    // 例: groupName = `Cheer_${personalitySuffix}`;
    groupName = `Idle_${personalitySuffix}`;
  }

  // 再生
  // (同じグループが再生中の場合は最初から再生されないように制御しても良い)
  model.motion(groupName, 0, priority);
};

// 応援モーション（タップ時など）
const playCheerMotion = () => {
  if (!model) return;
  const personalitySuffix = MAPPINGS.personality[props.personality] || 'Genki';
  model.motion(`Cheer_${personalitySuffix}`, 0, 3).then(() => {
    playMotionByState(); // 終わったら元の状態に戻る
  });
};

// 画面リサイズ処理
const onResize = () => {
  if (!app || !model) return;
  app.resize();
  model.x = app.screen.width / 2;
  model.y = app.screen.height;
};

// ■ 監視（Propsが変わったら即反映）
watch(() => [props.frontHairstyle, props.backHairstyle, props.eyes], () => {
  updateAppearance();
});

watch(() => [props.personality, props.emotion], () => {
  playMotionByState();
});

// 親から呼べるように公開（必要であれば）
defineExpose({
  playCheerMotion,
  model
});
</script>

<style scoped>
.live2d-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>