<template>
  <section class="character-customization">
    <h2>キャラクター設定</h2>
    <div class="live2d-preview-container">
      <Live2DModel
        :emotion="getEmotion"
        :personality="characterPersonality"
        :front-hairstyle="characterFrontHairstyle"
        :back-hairstyle="characterBackHairstyle"
        :eyes="characterEyes" 
      />
      </div>

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
          <option value="ロング">ロング</option>
          <option value="ボブ">ボブ</option>
          <option value="ショート">ショート</option>
          <option value="ツイン">ツイン</option>
        </select>
      </div>

      <div class="option-group">
        <h3>前髪</h3>
        <select v-model="characterFrontHairstyle">
          <option value="ぱっつん">ぱっつん</option>
          <option value="３つ分け">３つ分け</option>
          <option value="２・８分け">２．８分け</option>
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
  height: 100%;
}

.live2d-preview-container {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  flex-grow: 1;
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
}

.customization-options {
  display: grid;
  /* スマホ、PC共に2列で表示 */
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.option-group h3 {
  margin-bottom: 5px;
  font-size: 14px;
  color: #333;
}

.option-group select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
}

/* PC版（768px以上）のスタイル調整 */
@media (min-width: 768px) {
  .live2d-preview-container {
    height: 300px;
    margin-bottom: 30px;
  }
  .customization-options {
    gap: 30px; /* PC版ではギャップを広げる */
  }
  .option-group h3 {
    font-size: 16px;
  }
  .option-group select {
    font-size: 16px;
  }
}
</style>