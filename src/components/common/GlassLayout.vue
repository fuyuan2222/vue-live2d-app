<template>
  <div class="layout-container">
    <div class="background-layer">
      <slot name="background"></slot>
    </div>

    <div class="glass-board">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
/* 全体の枠 */
.layout-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #f0f8ff; /* 背景色（空のような色） */
}

/* 背景レイヤー（一番奥） */
.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  /* キャラを中央下に配置 */
  display: flex;
  justify-content: center;
  align-items: flex-end;
  pointer-events: none; /* 背景が操作を邪魔しないようにする */
}

/* すりガラスボード（手前） */
.glass-board {
  position: relative;
  z-index: 10;
  
  width: 90%;
  max-width: 600px; /* PCで横に広がりすぎないように */
  height: 85vh; /* 画面の85%の高さ */
  margin: 5vh auto; /* 中央配置 */
  
  /* すりガラスデザイン */
  background-color: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 角丸からはみ出さないように */
}
</style>