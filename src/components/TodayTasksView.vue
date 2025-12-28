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

// 初期状態は 'neutral' (半々)
const currentFocus = ref('neutral')

const setFocus = (target) => {
  // 同じ場所をタップしたら 'neutral' に戻す（トグル動作）
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
  if (left === 0) return '全部終わったね！えらい！🎉'
  if (left < 3) return 'あとちょっと！'
  return '一緒にがんばろう！✨'
})
</script>

<style scoped>
/* コンテナ：カード型のレイアウト（余白あり） */
.split-container {
  display: flex;
  width: 100%;
  height: 100%; /* 親の高さに合わせる */
  position: relative;
  /* ★ここを戻しました：隙間と余白を作る */
  gap: 15px; 
  padding: 15px; 
  box-sizing: border-box;
}

/* === 共通パネル設定 === */
.pane {
  border-radius: 20px; /* ★ここを戻しました：角丸 */
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  
  /* ガラス風デザイン */
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);

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

/* === 状態ごとのスタイル === */

/* --- 左：タスクパネル --- */
.task-pane {
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  flex-direction: column;
}

/* タスク主役 */
.split-container.tasks .task-pane {
  flex: 5; 
  z-index: 10;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

/* タスク脇役（キャラモード時） */
.split-container.char .task-pane {
  flex: 1; 
  transform: scale(0.95); /* 少し小さく */
  opacity: 0.6;
  z-index: 1;
  filter: blur(1px);
}

/* --- 右：キャラパネル --- */
.char-pane {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* キャラ主役 */
.split-container.char .char-pane {
  flex: 5;
  background: #fff;
  z-index: 10;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

/* キャラ脇役（タスクモード時） */
.split-container.tasks .char-pane {
  flex: 1;
  transform: scale(0.95);
  opacity: 0.6;
  z-index: 1;
  filter: grayscale(20%);
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
  color: #888;
  font-size: 0.9rem;
  letter-spacing: 2px;
}

/* Live2Dモデルの位置調整 */
.live2d-model {
  width: 100%;
  height: 100%;
  position: absolute;
  /* ★修正：拡大しすぎない＆少し下げることで頭上のスペースを確保 */
  bottom: -40px; 
  left: 50%;
  transform: translateX(-50%) scale(1.0); /* 等倍に戻す */
  transition: transform 0.5s;
  pointer-events: none; /* キャラがタップを邪魔しないように */
}

/* 脇役の時は少し小さく */
.split-container.tasks .live2d-model {
  transform: translateX(-50%) scale(0.8);
  bottom: -20px;
}

/* 吹き出し（セリフ） */
.bubble {
  position: absolute;
  /* ★修正：一番上に配置して顔と被らないようにする */
  top: 15px; 
  left: 15px;
  right: 15px; /* 横幅いっぱいにしないための制限 */
  
  background: #fff;
  padding: 10px 14px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  font-size: 0.85rem;
  color: #333;
  text-align: center;
  z-index: 20; /* 確実に手前 */
  
  /* ふわふわアニメーション */
  animation: float 3s ease-in-out infinite;
}

/* 吹き出しのしっぽ */
.bubble::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
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
  gap: 10px;
  background: #fff;
  margin-bottom: 8px;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.done { text-decoration: line-through; color: #bbb; }
.del-btn { margin-left: auto; width: 24px; height: 24px; border-radius: 50%; background: #f0f0f0; color: #888; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer;}
</style>