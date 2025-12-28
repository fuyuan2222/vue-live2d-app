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
  /* ★配置の変更：画面の下側に固定する */
  position: absolute; /* 親(relative)に対して絶対配置 */
  bottom: 0;        /* 真下に配置 */
  left: 50%;        /* 左右中央に */
  transform: translateX(-50%); /* 左右中央寄せの定型文 */
  
  /* ★高さの変更：ここが「胸から下」の調整ポイント */
  height: 60vh; /* 画面の下60%をボードにする（上40%はキャラ用スペース） */
  
  /* 横幅 */
  width: 100%;      /* スマホなら横幅いっぱい */
  max-width: 600px; /* PCなら広がりすぎないように */
  
  /* ★z-indexは手前のまま */
  z-index: 10;
  
  /* デザイン */
  background-color: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  
  /* 枠線と影 */
  border-top: 1px solid rgba(255, 255, 255, 0.4); /* 上の線だけ強調 */
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.1);
  
  /* ★角丸：上だけ丸くして、下はストンと落とす */
  border-radius: 24px 24px 0 0;
  
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>