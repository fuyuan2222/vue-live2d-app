<template>
  <div class="split-container" :class="currentFocus">
    
    <div class="task-pane" @click="setFocus('tasks')">
      <div class="pane-content">
        <h2>本日のタスク</h2>
        <p class="guide-text" v-if="currentFocus === 'char'">◀ タップしてタスクを開く</p>
        
        <div v-if="filteredTodayTasks.length === 0" class="no-tasks">
          タスクなし
        </div>
        
        <ul class="task-list">
          <li v-for="(task, index) in filteredTodayTasks" :key="index">
            <input type="checkbox" v-model="task.done" @click.stop />
            <span :class="[task.done ? 'done' : '', task.priority]">
              {{ task.text }}
            </span>
            <button @click.stop="removeTask(index)">削除</button>
          </li>
        </ul>
      </div>
    </div>

    <div class="char-pane" @click="setFocus('char')">
      <div class="pane-content">
        <Live2DView 
          :emotion="getEmotion"
          class="live2d-model"
        />
        <div class="mini-bubble" v-if="currentFocus !== 'char'">
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

// フォーカス状態: 'neutral'(半々), 'tasks'(タスク全開), 'char'(キャラ全開)
const currentFocus = ref('neutral')

// フォーカス切り替え関数
const setFocus = (target) => {
  // すでに選ばれているものをもう一度押したら「neutral（半々）」に戻す？
  // 今回は「押した方が主役」という挙動にします
  currentFocus.value = target
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
  if (left === 0) return 'お疲れ様！🎉'
  return '頑張ろう！'
})
</script>

<style scoped>
/* コンテナ：画面いっぱいを使う */
.split-container {
  display: flex;
  width: 100%;
  height: 80vh; /* メニューバーの分を引いた高さ */
  overflow: hidden;
  position: relative;
  background-color: #f0f8ff;
}

/* --- 左：タスクエリア --- */
.task-pane {
  /* 初期状態：半分より少し広め */
  flex: 1.2;
  transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1); /* ヌルっと動くアニメーション */
  
  background: rgba(255, 255, 255, 0.9);
  border-right: 1px solid #ddd;
  padding: 20px;
  overflow-y: auto;
  cursor: pointer;
  position: relative;
  z-index: 1;
}

/* --- 右：キャラエリア --- */
.char-pane {
  /* 初期状態：半分より少し狭め */
  flex: 0.8;
  transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
  
  /* 背景画像を少しオシャレに */
  background: linear-gradient(135deg, #e0f7fa 0%, #ffffff 100%);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  cursor: pointer;
  position: relative;
  overflow: hidden; /* Live2Dのはみ出し防止 */
}

/* === アニメーション動作 === */

/* 1. タスクにフォーカスした時 */
.split-container.tasks .task-pane {
  flex: 5; /* ぐいっと広がる */
  background: #ffffff;
  box-shadow: 10px 0 20px rgba(0,0,0,0.1); /* 影をつけて手前感を出す */
}
.split-container.tasks .char-pane {
  flex: 0.2; /* ちらっと見える程度に縮む */
  opacity: 0.5;
  filter: blur(2px); /* ぼかす */
}

/* 2. キャラにフォーカスした時 */
.split-container.char .char-pane {
  flex: 5; /* ぐいっと広がる */
  background: #fff;
}
.split-container.char .task-pane {
  flex: 0.1; /* ほぼ隠れる */
  padding: 0; /* 余白もなくす */
  opacity: 0.3;
}

/* 中身の配置調整 */
.pane-content {
  width: 100%;
  height: 100%;
  position: relative;
}

.live2d-model {
  width: 100%;
  height: 100%;
  /* キャラ位置調整：下揃え */
  position: absolute;
  bottom: -50px; 
}

/* 縮んだ時に文字が変に改行されないようにする */
.task-pane h2, .task-list {
  white-space: nowrap;
  transition: opacity 0.3s;
}

/* キャラモードの時、タスクの文字を消す */
.split-container.char .task-pane h2,
.split-container.char .task-pane .task-list {
  opacity: 0;
  pointer-events: none;
}

/* 吹き出し */
.mini-bubble {
  position: absolute;
  top: 20px;
  right: 20px;
  background: #fff;
  padding: 10px;
  border-radius: 15px 15px 0 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  font-size: 0.8rem;
  font-weight: bold;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.guide-text {
  font-size: 0.8rem;
  color: #888;
  writing-mode: vertical-rl; /* 縦書きにして端っこに表示 */
  position: absolute;
  top: 50%;
  left: 5px;
  transform: translateY(-50%);
}

/* リストデザイン */
.task-list { list-style: none; padding: 0; }
.task-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid #eee;
}
.done { text-decoration: line-through; color: #aaa; }
</style>