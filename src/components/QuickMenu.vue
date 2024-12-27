<template>
  <div class="quick-menu q-gutter-sm">
    <q-btn
      v-for="item in menuItems"
      :key="item.title"
      :icon="item.icon"
      :label="item.title"
      flat
      dense
      @click="item.action"
      :tooltip="item.description"
    />
  </div>
</template>

<script setup>
import { useUIStore } from 'stores'

const ui = useUIStore()
const menuItems = ui.menus.quick || []
</script>

<style scoped>
.quick-menu {
  display: flex;
  align-items: center;
}
</style>
