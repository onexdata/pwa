<template>
  <q-layout :view="ui.layout.view">
    <q-header :elevated="ui.header.elevated" v-if="ui.header.show">
      <q-toolbar :dense="ui.toolbar.dense" :flat="ui.toolbar.flat" :glossy="ui.toolbar.glossy">
        <q-btn
          v-if="ui.toolbar.showNavButton"
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title v-if="ui.toolbar.showTitle"> {{ $t('app.name') }} </q-toolbar-title>

        <div v-if="isFeatureEnabled('ui.layout.quickMenu')">
          <b>here goes nothing... ola la</b>Quickmenu is enabled!
        </div>
        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="ui.leftDrawer.show"
      :show-if-above="ui.leftDrawer.showIfAbove"
      :bordered="ui.leftDrawer.bordered"
      :behavior="ui.leftDrawer.behavior"
      :width="ui.leftDrawer.width"
      :mini="ui.leftDrawer.mini"
      :mini-width="ui.leftDrawer.miniWidth"
      :breakpoint="ui.leftDrawer.breakpoint"
      :overlay="ui.leftDrawer.overlay"
      :persistent="ui.leftDrawer.persistent"
      :elevated="ui.leftDrawer.elevated"
      side="left"
    >
      <q-list>
        <q-item-label header> Essential Links </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <q-page
        :style="{
          padding: ui.page.padded ? ui.page.paddingSize : 'none',
          maxWidth: ui.page.containerWidth,
          margin: ui.layout.containerized ? '0 auto' : '',
        }"
      >
        <router-view />
      </q-page>
    </q-page-container>

    <q-footer
      v-if="ui.footer.show"
      :elevated="ui.footer.elevated"
      :bordered="ui.footer.bordered"
      :style="{ height: ui.footer.height }"
      :fixed="ui.footer.fixed"
    >
      <!-- Footer content -->
    </q-footer>
  </q-layout>
</template>

<script setup>
import { useUIStore } from 'stores'
import { watch } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import { isFeatureEnabled } from '../composables/useFeature'

// Initialize UI store
const ui = useUIStore()

watch(
  () => ui.isLoaded,
  (isLoaded) => {
    if (isLoaded && !ui.isValid) {
      console.error('Settings validation failed:', ui.validationErrors)
    }
  },
)

// Get links list from UI store
const linksList = ui.menus.main

// Toggle drawer function now uses the store
function toggleLeftDrawer() {
  ui.updateSettings('leftDrawer.show', !ui.leftDrawer.show)
}
</script>
