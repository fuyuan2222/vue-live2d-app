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
/* コンテナ：外側の余白は少し残しつつ、中身の隙間(gap)をゼロにする */
.split-container {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
  /* ★重要：隙間をなくしてくっつける */
  gap: 0; 
  /* 画面端からの余白 */
  padding: 10px; 
  box-sizing: border-box;
}

/* === 共通パネル設定 === */
.pane {
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  
  /* ガラス風デザイン */
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  /* 枠をくっつけるので、重なった部分の線を消す工夫 */
  box-shadow: none; 

  /* デフォルト(neutral) */
  flex: 1;
  opacity: 1;
  transform: scale(1);
  z-index: 5;
}

.pane-content {
  width: 100%;
  height: 100%;
  position: relative;
}

/* === 左右の結合デザイン === */

/* 左パネル：右側の角を直角にする */
.task-pane {
  border-radius: 20px 0 0 20px;
  border-right: none; /* 境界線を消す */
  background: rgba(255, 255, 255, 0.9);
}

/* 右パネル：左側の角を直角にする */
.char-pane {
  border-radius: 0 20px 20px 0;
  border-left: 1px solid rgba(0,0,0,0.1); /* 薄い境界線を入れる */
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 全体に影をつける（コンテナに対してではなくパネルの背面に疑似要素などでつけるのが綺麗ですが、簡易的にパネルにつけます） */
.split-container {
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.1));
}


/* === 動作時のスタイル === */

/* タスク主役 */
.split-container.tasks .task-pane {
  flex: 4; 
}
.split-container.tasks .char-pane {
  flex: 1; 
  background: #ddd; /* 暗くして非アクティブ感を出す */
}

/* キャラ主役 */
.split-container.char .char-pane {
  flex: 4;
  background: #fff; /* 明るく */
}
.split-container.char .task-pane {
  flex: 1;
  background: #eee;
}


/* === 中身のパーツ調整 === */

.pane-title {
  margin: 15px;
  font-size: 1.1rem;
  font-weight: bold;
  color: #444;
  white-space: nowrap;
}

.task-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 0 15px 15px 15px;
  scrollbar-width: thin;
}

/* 縮んだ時に中身を隠す */
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
  color: #999;
  font-size: 0.8rem;
  letter-spacing: 2px;
}

/* === Live2Dモデル 全身表示設定 === */
.live2d-model {
  width: 100%;
  height: 100%;
  position: absolute;
  /* ★全身を見せるための調整
     scale(0.65): 小さくして全身を入れる
     bottom: -20px: 足元を少しだけ切るか、ぴったり合わせる
  */
  bottom: -20px; 
  left: 50%;
  transform: translateX(-50%) scale(0.65); 
  
  transition: transform 0.5s;
  pointer-events: none;
}

/* キャラ主役の時は、少し大きくしてあげる */
.split-container.char .live2d-model {
  transform: translateX(-50%) scale(0.75); /* 少しズーム */
  bottom: -40px;
}

/* タスク主役（脇役）の時は、さらに小さくして全身を残す */
.split-container.tasks .live2d-model {
  transform: translateX(-50%) scale(0.55);
  bottom: 0;
  opacity: 0.7;
}

/* 吹き出し */
.bubble {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  background: #fff;
  padding: 8px 10px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  font-size: 0.8rem;
  color: #333;
  text-align: center;
  z-index: 20;
  animation: float 3s ease-in-out infinite;
}

.bubble::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px 6px 0;
  border-style: solid;
  border-color: #fff transparent transparent transparent;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

/* リストアイテム */
.task-list { list-style: none; padding: 0; margin: 0; }
.task-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  margin-bottom: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  font-size: 0.9rem;
}
.done { text-decoration: line-through; color: #bbb; }
.del-btn { margin-left: auto; width: 22px; height: 22px; border-radius: 50%; background: #f0f0f0; color: #888; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer;}
</style>