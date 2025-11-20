<template>
  <div v-if="task" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="close-button" @click="$emit('close')">&times;</button>
      <h2>タスク詳細</h2>
      
      <div class="detail-group">
        <label>タスク名:</label>
        <p>{{ task.text }}</p>
      </div>
      
      <div class="detail-group">
        <label>ステータス:</label>
        <p :class="task.done ? 'status-done' : 'status-active'">
          {{ task.done ? '完了' : '未完了' }}
        </p>
      </div>

      <div class="detail-group">
        <label>優先度:</label>
        <p :class="task.priority">{{ task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低' }}</p>
      </div>

      <div class="detail-group">
        <label>カテゴリ:</label>
        <p>{{ task.category }}</p>
      </div>
      
      <div class="detail-group">
        <label>期限:</label>
        <p>{{ task.dueDate }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  task: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close']);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6); /* 背景を暗くする */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000; /* 最前面に表示 */
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 90%;
  width: 400px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  position: relative;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  color: #333;
  cursor: pointer;
}

.detail-group {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #eee;
}

.detail-group label {
  font-weight: bold;
  color: #ff8c00; /* アクセントカラー */
  display: block;
  margin-bottom: 5px;
}

.detail-group p {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.status-done { color: #4caf50; font-weight: bold; }
.status-active { color: #ff8c00; font-weight: bold; }

.high { color: #ff5722; }
.medium { color: #ff9800; }
.low { color: #4caf50; }
</style>