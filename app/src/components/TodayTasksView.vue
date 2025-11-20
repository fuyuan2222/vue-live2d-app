<template>
  <section class="today-tasks-section">
    <h2>本日のタスク</h2>

    <p>{{ characterMessage }}</p>

    <div class="live2d-container">
      <Live2DModel :emotion="getEmotion" />
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
import { computed, inject } from 'vue'
import Live2DModel from './Live2DModel.vue'

const { tasks, removeTask } = inject('task-data')

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