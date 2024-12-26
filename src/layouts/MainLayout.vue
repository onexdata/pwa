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

        <q-toolbar-title v-if="ui.toolbar.showTitle"> Quasar App </q-toolbar-title>

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
import { useStores } from 'stores'
import { watch } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'

// Initialize UI store
const { ui, app, user, asset } = useStores()

console.log(app, user, asset)
// Wait for settings to load
watch(
  () => ui.isLoaded,
  (isLoaded) => {
    if (isLoaded && !ui.isValid) {
      console.error('Settings validation failed:', ui.validationErrors)
    }
  },
)

// Links list remains the same
const linksList = [
  {
    title: 'Docs',
    caption: 'quasar.dev',
    icon: 'school',
    link: 'https://quasar.dev',
  },
  {
    title: 'Github',
    caption: 'github.com/quasarframework',
    icon: 'code',
    link: 'https://github.com/quasarframework',
  },
  {
    title: 'Discord Chat Channel',
    caption: 'chat.quasar.dev',
    icon: 'chat',
    link: 'https://chat.quasar.dev',
  },
  {
    title: 'Forum',
    caption: 'forum.quasar.dev',
    icon: 'record_voice_over',
    link: 'https://forum.quasar.dev',
  },
  {
    title: 'Twitter',
    caption: '@quasarframework',
    icon: 'rss_feed',
    link: 'https://twitter.quasar.dev',
  },
  {
    title: 'Facebook',
    caption: '@QuasarFramework',
    icon: 'public',
    link: 'https://facebook.quasar.dev',
  },
  {
    title: 'Quasar Awesome',
    caption: 'Community Quasar projects',
    icon: 'favorite',
    link: 'https://awesome.quasar.dev',
  },
]

// Toggle drawer function now uses the store
function toggleLeftDrawer() {
  ui.updateSettings('leftDrawer.show', !ui.leftDrawer.show)
}
</script>
