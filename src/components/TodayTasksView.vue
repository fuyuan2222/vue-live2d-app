<template>
  <div class="split-container" :class="currentFocus">
    
    <div class="task-pane pane" @click="setFocus('tasks')">
      <div class="pane-content">
        <h2 class="pane-title">📝 本日のタスク</h2>
        
        <div class="inactive-label" v-if="currentFocus === 'char'">
          <span>OPEN</span>
        </div>

        <div class="task-scroll-area">
          <div v-if="filteredTodayTasks.length === 0" class="no-tasks">
            タスクなし
          </div>
          <ul class="task-list">
            <li v-for="(task, index) in filteredTodayTasks" :key="index">
              <input type="checkbox" v-model="task.done" @click.stop class="custom-checkbox" />
              <span class="task-text" :class="[task.done ? 'done' : '', task.priority]">
                {{ task.text }}
              </span>
              <button @click.stop="removeTask(index)" class="del-btn">×</button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="char-pane pane" @click="setFocus('char')">
      <div class="pane-content">
        <Live2DView 
          :emotion="getEmotion"
          class="live2d-model"
        />
      </div>
    </div>

    <div class="bubble" v-if="currentFocus !== 'tasks'">
      {{ characterMessage }}
    </div>

  </div>
</template>

<script setup>
import { computed, inject, ref } from 'vue'
import Live2DView from './Live2DView.vue'

const { tasks, removeTask } = inject('task-data')

// 初期状態
const currentFocus = ref('neutral')

const setFocus = (target) => {
  if (currentFocus.value === target) {
    currentFocus.value = 'neutral'
  } else {
    currentFocus.value = target
  }
}

const filteredTodayTasks = computed(() => {
  const today = new Date().toISOString().substr(0, 10)
  return tasks.value.filter(task => task.dueDate === today)
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
  if (left === 0) return '完了！お疲れ様🎉'
  if (left < 3) return 'あと少しだよ！'
  return '今日も頑張ろう✨'
})
</script>

<style scoped>
/* 全体 */
.split-container {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: #ffffff;
  color-scheme: light;
}

/* 共通パネル */
.pane {
  flex: 1;
  position: relative;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.2, 0, 0, 1);
}

/* 左：タスク */
.task-pane {
  background: #ffffff;
  color: #333333;
}

.task-pane * {
  color: #333333;
}

/* 右：キャラ */
.char-pane {
  background: #ffffff;
}

/* 初期状態は完全白 */
.split-container.neutral .char-pane {
  background: #ffffff;
}

/* キャラ主役時だけ色を出す */
.split-container.char .char-pane {
  background: linear-gradient(180deg, #FFE0B2 0%, #FFFFFF 100%);
}

/* 主従切り替え */
.split-container.tasks .task-pane { flex: 9; }
.split-container.tasks .char-pane {
  flex: 1;
  background: #FFCC80;
}

.split-container.char .char-pane { flex: 9; }
.split-container.char .task-pane {
  flex: 1;
  background: #f5f5f5;
}

/* Live2D */
.live2d-model {
  position: absolute;
  bottom: -3%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translateX(-50%) scale(1.15);
  transition: transform 0.5s, bottom 0.5s;
  pointer-events: none;
}

/* キャラ主役 */
.split-container.char .live2d-model {
  transform: translateX(-50%) scale(1.3);
  bottom: -5%;
}

/* タスク主役 */
.split-container.tasks .live2d-model {
  transform: translateX(-50%) scale(0.7);
  bottom: 5%;
  opacity: 0.7;
}

/* 吹き出し */
.bubble {
  position: fixed;
  top: 15vh;
  right: 5vw;
  max-width: 50vw;
  background: #ffffff;
  padding: 15px 20px;
  border-radius: 30px;
  box-shadow: 0 5px 20px rgba(255, 152, 0, 0.2);
  font-size: 0.95rem;
  font-weight: bold;
  color: #333333 !important;
  z-index: 9999;
}

/* タスクリスト */
.task-list li {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #f8f9fa;
  margin-bottom: 10px;
  padding: 15px;
  border-radius: 12px;
  border-left: 5px solid #FFB74D;
}

.task-text {
  color: #333333 !important;
  font-size: 1rem;
  font-weight: 500;
}

.done {
  text-decoration: line-through;
  color: #bbbbbb !important;
}

.no-tasks {
  text-align: center;
  color: #999999 !important;
}
</style>
