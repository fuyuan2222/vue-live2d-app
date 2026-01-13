<template>
  <section class="character-customization">
    <h2>キャラクター設定</h2>
    
    <div class="live2d-preview-container">
      <Live2DView
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
          <option value="サイドテール">サイドテール</option>
          <option value="一つ結び">一つ結び</option>
          <option value="ショート">ショート</option>
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
import Live2DView from './Live2DView.vue'

// App.vue から提供されたデータを受け取る
const {
  characterPersonality,
  characterFrontHairstyle,
  characterBackHairstyle,
  characterEyes
} = inject('character-data');

const { tasks } = inject('task-data');

// タスク状況に応じて表情を変えるロジック
const getEmotion = computed(() => {
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
  padding-bottom: 120px; 
  overflow-y: auto; 
  box-sizing: border-box;
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
  flex-grow: 1;
  min-height: 200px;
  position: relative;
  overflow: visible; 
  margin-bottom: 20px;
}

.customization-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
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
  border-radius: 12px;
  background-color: #f9f9f9;
  font-size: 16px;
  color: #333;
  outline: none;
  box-sizing: border-box;
  border-left: 4px solid #FFB74D;
}

.option-group select:focus {
  background-color: #fff;
  border-color: #FF9800;
}

@media (min-width: 768px) {
  .live2d-preview-container {
    height: 400px;
    flex-grow: 0;
    margin-bottom: 30px;
  }
  .customization-options {
    gap: 30px;
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>