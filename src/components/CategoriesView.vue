<template>
  <section class="category-management">
    <h2>カテゴリ管理</h2>
    <div class="category-input">
      <input type="text" v-model="newCategoryName" placeholder="新しいカテゴリ名" />
      <button @click="addCategoryHandler">追加</button>
    </div>
    <ul class="category-list">
      <li v-for="category in categories" :key="category">
        {{ category }}
        <button @click="removeCategory(category)">削除</button>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { ref, inject } from 'vue'

const { categories, addCategory, removeCategory } = inject('category-data')

const newCategoryName = ref('')

function addCategoryHandler() {
  if (newCategoryName.value.trim() && !categories.value.includes(newCategoryName.value.trim())) {
    addCategory(newCategoryName.value.trim())
    newCategoryName.value = ''
  }
}
</script>

<style scoped>
.category-input {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.category-input input {
  flex-grow: 1;
}
.category-list {
  list-style: none;
  padding: 0;
}
.category-list li {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.category-list li button {
  background-color: #ff5722;
  color: white;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 8px;
  font-weight: bold;
}
</style>