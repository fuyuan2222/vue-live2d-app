<template>
  <div class="split-container" :class="currentFocus">
    
    <div class="task-pane pane" @click="setFocus('tasks')">
      <div class="pane-content">
        <h2 class="pane-title">📝 本日のタスク</h2>
        
        <div class="inactive-label" v-if="currentFocus === 'char'">
          <span>TAP TO OPEN</span>
        </div>

        <div class="task-scroll-area">
          <div v-if="filteredTodayTasks.length === 0" class="no-tasks">
            タスクなし
          </div>
          <ul class="task-list">
            <li v-for="(task, index) in filteredTodayTasks" :key="index">
              <input type="checkbox" v-model="task.done" @click.stop />
              <span :class="[task.done ? 'done' : '', task.priority]">
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
        
        <div class="bubble" v-if="currentFocus !== 'tasks'">
          {{ characterMessage }}
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, inject, ref } from 'vue'
import Live2DView from './Live2DView.vue'

const { tasks, removeTask } = inject('task-data')

// ★修正点1: 初期状態を 'neutral' (半々) に設定
const currentFocus = ref('neutral')

// ★修正点2: トグル機能（同じものを押したら元に戻す）を追加
const setFocus = (target) => {
  if (currentFocus.value === target) {
    // すでに開いている方をタップしたら、ニュートラルに戻す
    currentFocus.value = 'neutral'
  } else {
    // 違う方をタップしたら、そっちを開く
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
  if (left === 0) return '全部終わったね！えらい！🎉'
  if (left < 3) return 'あとちょっと！'
  return '一緒にがんばろう！✨'
})
</script>

<style scoped>
/* コンテナ */
.split-container {
  display: flex;
  width: 100%;
  height: 80vh;
  position: relative;
  gap: 15px; 
  padding: 15px;
  box-sizing: border-box;
}

/* === 共通パネル設定 === */
.pane {
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  
  /* デフォルト(neutral)の状態：両方とも等幅、不透明 */
  flex: 1;
  opacity: 1;
  transform: scale(1);
  z-index: 5;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.pane-content {
  width: 100%;
  height: 100%;
  position: relative;
}

/* === 状態ごとのスタイル === */

/* -------------------------
   左：タスクパネルの個別設定
------------------------- */
.task-pane {
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
}

/* タスクが主役 */
.split-container.tasks .task-pane {
  flex: 5; /* ぐいっと広がる */
  z-index: 10;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

/* タスクが脇役（キャラモード時） */
.split-container.char .task-pane {
  flex: 1; 
  transform: scale(0.92) translateY(10px);
  opacity: 0.6;
  z-index: 1;
  filter: blur(1px);
}

/* -------------------------
   右：キャラパネルの個別設定
------------------------- */
.char-pane {
  background: linear-gradient(to top, #e6e9f0 0%, #eef1f5 100%);
}

/* キャラが主役 */
.split-container.char .char-pane {
  flex: 5;
  background: #fff;
  z-index: 10;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

/* キャラが脇役（タスクモード時） */
.split-container.tasks .char-pane {
  flex: 1;
  transform: scale(0.92) translateY(10px);
  opacity: 0.5;
  z-index: 1;
  filter: grayscale(30%) blur(1px);
}

/* === 中身のパーツ調整 === */

.pane-title {
  margin: 15px;
  font-size: 1.1rem;
  color: #444;
  white-space: nowrap;
}

.task-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 0 15px 15px 15px;
  scrollbar-width: thin;
}

/* 縮んだ時に中身を隠す（neutralの時は隠さない！） */
.split-container.char .task-scroll-area,
.split-container.char .pane-title {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}

.inactive-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(90deg);
  white-space: nowrap;
  font-weight: bold;
  color: #666;
  opacity: 0.8;
  letter-spacing: 2px;
  font-size: 0.8rem;
}

.live2d-model {
  width: 100%;
  height: 100%;
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  /* neutralの時は少し小さく表示してもいいかも */
  transition: transform 0.5s;
}

/* neutralの時、キャラが大きすぎるとはみ出るので少し調整 */
.split-container.neutral .live2d-model {
  transform: translateX(-50%) scale(0.9);
}

.bubble {
  position: absolute;
  top: 10px;
  right: 10px; /* neutralの時も端に表示 */
  max-width: 150px;
  background: #fff;
  padding: 8px 12px;
  border-radius: 15px 15px 0 15px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  font-size: 0.8rem;
  color: #333;
  animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 20; /* 常に一番手前 */
}

/* リストアイテム */
.task-list { list-style: none; padding: 0; margin: 0; }
.task-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  margin-bottom: 8px;
  padding: 8px 10px; /* neutralでも見やすいように少しパディング調整 */
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  font-size: 0.9rem;
}
.done { text-decoration: line-through; color: #bbb; }
.del-btn { margin-left: auto; background: #ffecec; color: #ff6b6b; border:none; border-radius:4px; cursor:pointer; font-size: 0.8rem; padding: 2px 6px;}
</style>