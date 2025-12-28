<template>
  <div class="live2d-canvas-container">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import * as PIXI from 'pixi.js';
// Cubism 4専用モードで読み込む（重要）
import { Live2DModel } from 'pixi-live2d-display/cubism4';

const props = defineProps({
  emotion: String,
  personality: String,
  hairstyle: String,
  outfit: String,
  accessory: String
});

// ライブラリ動作のためにwindowに紐付け
window.PIXI = PIXI;

const canvasRef = ref(null);
let app = null;
let model = null;

onMounted(async () => {
  if (!canvasRef.value) return;

  // 1. PIXIアプリケーション作成
  app = new PIXI.Application({
    view: canvasRef.value,
    width: 500,
    height: 1600,
    backgroundAlpha: 0,
    autoStart: true
  });

  // 【最終解決策】イベントシステムを完全に破壊・削除する
  // これにより、クリックやスクロール時に PIXI v7 が余計な計算（ヒットテスト）を行わなくなり、
  // バージョン不整合によるクラッシュを物理的に防ぎます。
  if (app.renderer.events) {
    app.renderer.events.destroy(); // 機能を停止
    delete app.renderer.events;    // 存在を抹消
  }

  // ※念のため古い形式（interaction）も削除
  if (app.renderer.plugins && app.renderer.plugins.interaction) {
    app.renderer.plugins.interaction.destroy();
    delete app.renderer.plugins.interaction;
  }

  // 2. モデル読み込み
  // autoInteract: false は引き続き必須です
  model = await Live2DModel.from('/live2d/Hiyori/Hiyori.model3.json', {
    autoInteract: false
  });

  // 3. サイズ・位置調整
  model.x = 250;
  model.y = 730;
  model.anchor.set(0.5, 0.5);
  model.scale.set(0.4);

  /* * 以下のイベント関連設定は、システムごと削除したので不要です。
   * 下手記述すると警告の原因になるので削除しています。
   * model.interactive = false; 
   * model.eventMode = 'none';
   */

  // 4. マウスインタラクション
  // ★重要：イベントシステムを削除したので動きません。コメントアウトのままにしてください。
  /*
  model.on('hit', (hitAreas) => {
    if (hitAreas.includes('Body')) {
      model.motion('TapBody');
    }
  });
  */

  app.stage.addChild(model);
  
  console.log('Live2D Loaded. Event System Destroyed (Crash prevention mode).');
});

// 感情変更の監視
watch(() => props.emotion, (newVal) => {
  if (!model) return;
  console.log('感情が変更されました:', newVal);
  
  // マウスイベントを使わないモーション再生なら動く可能性があります
  // try {
  //   if (newVal === 'celebrate') model.motion('Win');
  // } catch (e) {
  //   console.error('モーション再生エラー:', e);
  // }
});

onBeforeUnmount(() => {
  if (app) {
    app.destroy(true, { children: true });
  }
});
</script>

<style scoped>
.live2d-canvas-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  /* 【重要】ブラウザレベルでもマウス入力を無視させる（二重の防御） */
  pointer-events: none; 
}
canvas {
  max-width: 100%;
  max-height: 100%;
}

</style>