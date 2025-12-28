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
/* コンテナ：画面の底まで突き抜ける */
.split-container {
  display: flex;
  width: 100%;
  
  /* ★修正：画面の高さ100%使い切る！ */
  height: 100dvh; 
  
  position: relative;
  gap: 0;
  padding: 0;
  overflow: hidden;
}

/* === 共通パネル設定 === */
.pane {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  
  /* 完全な「見えない枠」 */
  border: none;
  border-radius: 0;
  box-shadow: none;
  outline: none;
  
  transition: all 0.5s cubic-bezier(0.2, 0, 0, 1);
  
  /* デフォルト(neutral) */
  flex: 1;
  opacity: 1;
  transform: scale(1);
  z-index: 1;
}

.pane-content {
  width: 100%;
  height: 100%;
  position: relative;
}

/* === 左右のデザイン === */

/* 左：タスクパネル */
.task-pane {
  background: #ffffff;
}

/* 右：キャラパネル */
.char-pane {
  background: linear-gradient(180deg, #f0f4f8 0%, #ffffff 100%);
}


/* === 動作時のスタイル === */

/* タスク主役 */
.split-container.tasks .task-pane { flex: 9; }
.split-container.tasks .char-pane {
  flex: 1;
  background: #e0e0e0;
  filter: grayscale(50%);
}

/* キャラ主役 */
.split-container.char .char-pane { flex: 9; }
.split-container.char .task-pane {
  flex: 1;
  background: #eee;
}


/* === 中身のパーツ調整 === */

.pane-title {
  margin: 40px 20px 20px 20px; /* 上の余白も少しリッチに */
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  white-space: nowrap;
}

.task-scroll-area {
  flex: 1;
  overflow-y: auto;
  
  /* ★重要：下にたっぷりと余白(100px)を入れることで、
     一番下のタスクがメニューバーに隠れずスクロールできるようになる */
  padding: 0 20px 100px 20px;
  
  scrollbar-width: none;
}
.task-scroll-area::-webkit-scrollbar { display: none; }

/* 縮んだ時に中身を消す */
.split-container.char .task-scroll-area,
.split-container.char .pane-title {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.1s;
}

/* ラベル */
.inactive-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(90deg);
  white-space: nowrap;
  font-weight: 900;
  color: #ccc;
  font-size: 1.0rem;
  letter-spacing: 4px;
}

/* === Live2Dモデル === */
.live2d-model {
  width: 100%;
  height: 100%;
  position: absolute;
  
  /* ★枠が大きくなったので、位置調整 */
  /* メニューバーの後ろまでキャラがいるように見せるため bottom: 0 */
  bottom: 0; 
  left: 50%;
  transform: translateX(-50%) scale(0.85); /* 全身が見えるサイズ */
  
  transition: transform 0.5s;
  pointer-events: none;
}

/* neutral */
.split-container.neutral .live2d-model {
  transform: translateX(-50%) scale(0.85);
}

/* キャラ主役（拡大） */
.split-container.char .live2d-model {
  transform: translateX(-50%) scale(1.0); /* ドーンと大きく */
  bottom: -5%; /* 少し下げて顔を近づける */
}

/* タスク主役（縮小） */
.split-container.tasks .live2d-model {
  transform: translateX(-50%) scale(0.65);
  bottom: 5%; /* メニューバーの上にちょこんと乗る感じ */
  opacity: 0.6;
}

/* 吹き出し */
.bubble {
  position: absolute;
  top: 15%;
  right: 5%;
  max-width: 60%;
  background: #fff;
  padding: 12px 18px;
  border-radius: 20px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  font-size: 0.9rem;
  color: #333;
  z-index: 20;
  animation: float 3s ease-in-out infinite;
}

.bubble::after {
  content: '';
  position: absolute;
  bottom: -8px;
  right: 20px;
  border-width: 8px 8px 0;
  border-style: solid;
  border-color: #fff transparent transparent transparent;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* リストアイテム */
.task-list { list-style: none; padding: 0; margin: 0; }
.task-list li {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #f8f9fa;
  margin-bottom: 10px;
  padding: 15px;
  border-radius: 8px;
}
.done { text-decoration: line-through; color: #bbb; }
.del-btn { margin-left: auto; width: 30px; height: 30px; border-radius: 50%; background: #eee; color: #888; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer;}
</style>