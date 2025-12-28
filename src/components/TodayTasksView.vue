<template>
  <section class="today-tasks-section">
    <h2>本日のタスク</h2>

    <p>{{ characterMessage }}</p>

    <div class="live2d-preview-container">
      <Live2DView
        :emotion="getEmotion"
        :personality="characterPersonality"
        :hairstyle="characterHairstyle"
        :outfit="characterOutfit"
        :accessory="characterAccessory"
      />
    </div>

    <div v-if="filteredTodayTasks.length === 0" class="no-tasks">
      本日のタスクはありません！
    </div>
    <ul class="task-list today-list">
      <li v-for="(task, index) in filteredTodayTasks" :key="index">
        <input type="checkbox" v-model="task.done" />
        <span :class="[task.done ? 'done' : '', task.priority]">
          {{ task.text }} ({{ task.category }})
        </span>
        <button @click="removeTask(index)">削除</button>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { computed, inject, ref } from 'vue' // refを追加
import Live2DView from './Live2DView.vue';

const { tasks, removeTask } = inject('task-data')

// 【修正点】テンプレートで使っている変数が定義されていなかったので追加
// ※本来は inject('character-data') などで受け取るものだと思いますが、
// とりあえず表示させるために仮の値を入れます。
const characterPersonality = ref('元気系');
const characterHairstyle = ref('ショート');
const characterOutfit = ref('制服');
const characterAccessory = ref('なし');

const filteredTodayTasks = computed(() => {
  const today = new Date().toISOString().substr(0, 10);
  return tasks.value.filter(task => task.dueDate === today);
})

const getEmotion = computed(() => {
  const completed = tasks.value.filter(t => t.done).length
  if (tasks.value.length === 0) return 'idle'
  if (completed === tasks.value.length) return 'celebrate'
  if (completed > 0) return 'smile'
  return 'idle'
})

const characterMessage = computed(() => {
  const left = tasks.value.filter(t => !t.done).length
  if (left === 0) return '全部終わったね！えらい！🎉'
  if (left <= 3 && left > 0) return 'あとちょっと！がんばろう💪'
  return '一緒にがんばろう！✨'
})
</script>

<style scoped>
/* 【最重要】Live2Dを表示するための高さ指定 */
.live2d-preview-container {
  width: 100%;
  height: 400px; /* ここに必ず高さを指定してください */
  position: relative;
  background-color: #f9f9f9; /* 領域が見えるように仮の背景色 */
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
}

.today-tasks-section {
  padding: 20px;
}

.no-tasks {
  text-align: center;
  color: #888;
  margin: 20px 0;
}

.task-list {
  list-style: none;
  padding: 0;
}

.task-list li {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 10px;
}

.done {
  text-decoration: line-through;
  color: gray;
}
</style>