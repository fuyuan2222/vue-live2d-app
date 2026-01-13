<template>
  <section class="character-customization">
    <div class="customization-options">
      <div class="option-group">
        <h3>性格</h3>
        <select v-model="characterPersonality">
          <option value="元気系">元気系</option>
          <option value="癒し系">癒し系</option>
          <option value="クール系">クール系</option>
        </select>
      </div>

      <div class="option-group">
        <h3>後ろ髪</h3>
        <select v-model="characterBackHairstyle">
          <option value="一つ結び">一つ結び</option>
          <option value="ショート">ショート</option>
          <option value="サイドテール">サイドテール</option>
        </select>
      </div>

      <div class="option-group">
        <h3>前髪</h3>
        <select v-model="characterFrontHairstyle">
          <option value="ぱっつん">ぱっつん</option>
          <option value="３つ分け">３つ分け</option>
          <option value="２・８分け">２・８分け</option>
        </select>
      </div>

      <div class="option-group">
        <h3>目</h3>
        <select v-model="characterEyes">
          <option value="丸目">丸目</option>
          <option value="たれ目">たれ目</option>
          <option value="釣り目">釣り目</option>
        </select>
      </div>
    </div>
  </section>
</template>

<script setup>
import { inject, computed } from 'vue'
import Live2DModel from './Live2DView.vue'

// ここで inject しているデータがリアクティブ（ref）であることを前提とします
const {
  characterPersonality,
  characterFrontHairstyle,
  characterBackHairstyle,
  characterEyes
  // もし outfit や accessory も使うならここに追加し、親で provide する必要があります
} = inject('character-data');

const { tasks } = inject('task-data');

const getEmotion = computed(() => {
  // tasks が undefined の場合のガードを入れるとより安全です
  if (!tasks || !tasks.value) return 'idle'; 
  
  const completed = tasks.value.filter(t => t.done).length
  if (tasks.value.length === 0) return 'idle'
  if (completed === tasks.value.length) return 'celebrate'
  if (completed > 0) return 'smile'
  return 'idle'
})
</script>

<style scoped>
.character-customization {
  display: flex;
  flex-direction: column;
  /* 画面の高さいっぱいを使う */
  height: 100%;
  
  /* ★重要：メニューバーに被らないように下に余白をたっぷり入れる */
  padding-bottom: 120px; 
  
  /* 画面が小さくて入り切らない場合はスクロールさせる */
  overflow-y: auto; 
  box-sizing: border-box;
  
  /* 余白調整 */
  padding-top: 20px;
  padding-left: 20px;
  padding-right: 20px;

}

h2 {
  text-align: center;
  margin: 0 0 10px 0;
  font-size: 1.2rem;
  color: #333;
}

.live2d-preview-container {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  
  /* 画面の余ったスペースを使うが、設定項目を圧迫しすぎないようにする */
  flex-grow: 1;
  min-height: 200px; /* 最低限の高さを確保 */
  
  position: relative;
  /* Live2Dがはみ出しても表示崩れしないように */
  overflow: visible; 
  margin-bottom: 20px;
}

.customization-options {
  display: grid;
  /* スマホ、PC共に2列で表示 */
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  
  /* フォーム周りが狭くならないように */
  width: 100%;
  max-width: 600px;
  margin: 0 auto; /* 中央寄せ */
}

.option-group h3 {
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: bold;
  color: #555;
}

.option-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 12px; /* 角丸を強めにして今のUIに合わせる */
  background-color: #f9f9f9;
  font-size: 16px; /* スマホでズームされないサイズ */
  color: #333;
  outline: none;
  box-sizing: border-box;
  
  /* オレンジのテーマカラーに合わせるなら */
  border-left: 4px solid #FFB74D;
}

.option-group select:focus {
  background-color: #fff;
  border-color: #FF9800;
}

/* PC版（768px以上）のスタイル調整 */
@media (min-width: 768px) {
  .live2d-preview-container {
    height: 400px; /* 固定高さにして安定させる */
    flex-grow: 0;
    margin-bottom: 30px;
  }
  .customization-options {
    gap: 30px;
    grid-template-columns: repeat(4, 1fr); /* 横一列にするなど */
  }
  .option-group h3 {
    font-size: 16px;
  }
  .option-group select {
    font-size: 16px;
  }
}
</style>