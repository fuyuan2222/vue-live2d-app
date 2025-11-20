<template>
  <section class="character-customization">
    <h2>キャラクター設定</h2>
    <div class="live2d-preview-container">
      <Live2DModel
        :emotion="getEmotion"
        :personality="characterPersonality"
        :hairstyle="characterHairstyle"
        :outfit="characterOutfit"
        :accessory="characterAccessory"
      />
    </div>

    <div class="customization-options">
      <div class="option-group">
        <h3>性格</h3>
        <select v-model="characterPersonality">
          <option value="元気系">元気系</option>
          <option value="癒し系">癒し系</option>
          <option value="クール系">クール系</option>
          <option value="ツンデレ系">ツンデレ系</option>
          <option value="オタク共感系">オタク共感系</option>
        </select>
      </div>
      <div class="option-group">
        <h3>髪型</h3>
        <select v-model="characterHairstyle">
          <option value="ロング">ロング</option>
          <option value="ボブ">ボブ</option>
          <option value="ショート">ショート</option>
          <option value="ツイン">ツイン</option>
        </select>
      </div>
      <div class="option-group">
        <h3>服装</h3>
        <select v-model="characterOutfit">
          <option value="元気カジュアル系">元気カジュアル系</option>
          <option value="かわいめスポーティ系">かわいめスポーティ系</option>
          <option value="ナチュラル親しみ系">ナチュラル親しみ系</option>
        </select>
      </div>
      <div class="option-group">
        <h3>小物</h3>
        <select v-model="characterAccessory">
          <option value="なし">なし</option>
          <option value="メガネ">メガネ</option>
          <option value="イヤホン">イヤホン</option>
        </select>
      </div>
    </div>
  </section>
</template>

<script setup>
import { inject, computed } from 'vue'
import Live2DModel from './Live2DModel.vue'

const {
  characterPersonality,
  characterHairstyle,
  characterOutfit,
  characterAccessory
} = inject('character-data');

const { tasks } = inject('task-data');

const getEmotion = computed(() => {
  if (!tasks.value) return 'idle';
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