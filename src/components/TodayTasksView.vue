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
/* コンテナ */
.split-container {
  display: flex;
  width: 100%;
  
  /* ★修正：100dvh だと大きすぎるので 100% に変更 */
  /* これで main-content の padding-bottom が効くようになります */
  height: 100%; 
  
  position: relative;
  gap: 0;
  padding: 0;
  overflow: hidden;
  background-color: #ffffff;
  color-scheme: light; 
}

/* === 共通パネル設定 === */
.pane {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border: none;
  border-radius: 0;
  box-shadow: none;
  outline: none;
  transition: all 0.5s cubic-bezier(0.2, 0, 0, 1);
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

/* 右：キャラパネル（オレンジテーマ） */
.char-pane {
  /* 綺麗なオレンジグラデーション */
  background: linear-gradient(180deg, #FFE0B2 0%, #FFFFFF 100%);
}

/* === 動作時のスタイル === */

/* タスク主役 */
.split-container.tasks .task-pane { flex: 9; }
.split-container.tasks .char-pane {
  flex: 1;
  background: #FFCC80; /* 濃いめのオレンジ */
  filter: grayscale(20%);
}

/* キャラ主役 */
.split-container.char .char-pane { flex: 9; }
.split-container.char .task-pane {
  flex: 1;
  background: #f5f5f5;
}

/* === 中身のパーツ調整 === */

.pane-title {
  margin: 40px 20px 20px 20px;
  font-size: 1.2rem;
  font-weight: bold;
  /* 文字色を強制指定 */
  color: #333333 !important; 
  white-space: nowrap;
}

.task-scroll-area {
  flex: 1;
  overflow-y: auto;
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
  color: #FFB74D; /* オレンジ */
  font-size: 1.0rem;
  letter-spacing: 4px;
}

/* === Live2Dモデル === */
.live2d-model {
  width: 100%;
  height: 100%;
  position: absolute;
  bottom: 0; 
  left: 50%;
  
  /* neutral時：少し大きめ */
  transform: translateX(-50%) scale(1.0);
  
  transition: transform 0.5s;
  pointer-events: none;
}

/* neutral(半々) */
.split-container.neutral .live2d-model {
  transform: translateX(-50%) scale(1.0);
}

/* キャラ主役（拡大） */
.split-container.char .live2d-model {
  transform: translateX(-50%) scale(1.2); /* 迫力を出す */
  bottom: -5%;
}

/* タスク主役（縮小） */
.split-container.tasks .live2d-model {
  transform: translateX(-50%) scale(0.7);
  bottom: 5%;
  opacity: 0.7;
}

/* === ★修正：吹き出し（position: fixed で強制的に画面に浮かせます） === */
.bubble {
  position: fixed; /* 親のoverflow:hiddenを無視して画面に固定 */
  top: 15vh; /* 画面の上から15%の位置 */
  right: 5vw; /* 画面の右から5%の位置 */
  
  max-width: 50vw; /* 横幅は画面の半分まで */
  
  background: #ffffff;
  padding: 15px 20px;
  border-radius: 30px;
  /* オレンジ色の影をつけてテーマに合わせる */
  box-shadow: 0 5px 20px rgba(255, 152, 0, 0.2); 
  
  font-size: 0.95rem;
  font-weight: bold;
  
  /* 文字色強制固定 */
  color: #333333 !important; 
  
  z-index: 9999; /* 誰よりも手前に */
  
  animation: float 3s ease-in-out infinite;
}

/* 吹き出しのしっぽ */
.bubble::after {
  content: '';
  position: absolute;
  bottom: -10px;
  right: 30px;
  border-width: 10px 10px 0;
  border-style: solid;
  border-color: #ffffff transparent transparent transparent;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* === リストアイテム === */
.task-list { list-style: none; padding: 0; margin: 0; }
.task-list li {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #f8f9fa;
  margin-bottom: 10px;
  padding: 15px;
  border-radius: 12px;
  /* オレンジのアクセントライン */
  border-left: 5px solid #FFB74D; 
}

/* タスク文字色強制固定 */
.task-text {
  color: #333333 !important;
  font-weight: 500;
  font-size: 1rem;
}

.done { 
  text-decoration: line-through; 
  color: #bbbbbb !important; 
}

/* チェックボックスの色調整（ブラウザ依存ですが可能な範囲で） */
.custom-checkbox {
  accent-color: #FF9800;
  width: 20px;
  height: 20px;
}

/* 優先度による色分け */
.task-list li:has(.high) { border-left-color: #FF5722; } /* 高：赤オレンジ */
.task-list li:has(.medium) { border-left-color: #FF9800; } /* 中：オレンジ */

.del-btn { 
  margin-left: auto; 
  width: 30px; 
  height: 30px; 
  border-radius: 50%; 
  background: #eee; 
  color: #888; 
  border:none; 
  display:flex; 
  align-items:center; 
  justify-content:center; 
  cursor:pointer;
}

.no-tasks {
  text-align: center;
  color: #999 !important;
  margin-top: 20px;
}
</style>