<template>
  <section class="today-tasks-section">
    <h2>本日のタスク</h2>

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

// Taskデータだけ受け取ればOK
const { tasks, removeTask } = inject('task-data')

// キャラクター関連の変数やimportはすべて App.vue に移動したので削除しました

const filteredTodayTasks = computed(() => {
  const today = new Date().toISOString().substr(0, 10);
  return tasks.value.filter(task => task.dueDate === today);
})
</script>

<style scoped>
.today-tasks-section {
  /* 余白調整：スマホで見やすいように */
  padding: 10px 0; 
}

.no-tasks {
  text-align: center;
  color: #666;
  margin: 30px 0;
  font-weight: bold;
}

.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-list li {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 10px;
  
  /* リストを見やすくする装飾 */
  background: rgba(255, 255, 255, 0.5);
  padding: 10px;
  border-radius: 8px;
}

/* 優先度ごとの色分け（もしCSSクラスがあれば） */
.high { border-left: 4px solid #ff6b6b; }
.medium { border-left: 4px solid #feca57; }
.low { border-left: 4px solid #54a0ff; }

.done {
  text-decoration: line-through;
  color: gray;
  opacity: 0.7;
}

/* 削除ボタンを少し控えめに */
button {
  margin-left: auto; /* 右端に寄せる */
  font-size: 0.8rem;
  padding: 4px 8px;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 4px;
}
</style>