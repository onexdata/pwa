<template>
  <q-page class="q-pa-md">
    <h1 class="text-h4 q-mb-md">System Information</h1>

    <q-tabs
      v-model="tab"
      class="text-primary"
      active-color="primary"
      indicator-color="primary"
      align="justify"
    >
      <q-tab name="app" icon="apps" label="App" />
      <q-tab name="features" icon="extension" label="Features" />
      <q-tab name="debug" icon="bug_report" label="Debug" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated>
      <!-- App Panel -->
      <q-tab-panel name="app">
        <div class="text-h6 q-mb-md">Application Information</div>
        <q-list bordered separator>
          <q-item>
            <q-item-section>
              <q-item-label>Quasar Version</q-item-label>
              <q-item-label caption>{{ $q.version }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>Vue Version</q-item-label>
              <q-item-label caption>{{
                getCurrentInstance()?.appContext?.app?.version || 'Not available'
              }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>Platform</q-item-label>
              <q-item-label caption>{{ $q.platform.is }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel>

      <!-- Features Panel -->
      <q-tab-panel name="features">
        <div class="text-h6 q-mb-md">Feature Configuration</div>
        <div class="row q-col-gutter-md">
          <template v-for="(category, categoryName) in features" :key="categoryName">
            <div class="col-12 col-md-6">
              <q-card class="feature-card">
                <q-card-section>
                  <div class="text-h6 text-capitalize">{{ categoryName }}</div>
                  <q-list>
                    <template v-for="(feature, featureName) in category" :key="featureName">
                      <q-expansion-item
                        :label="featureName"
                        :caption="feature.description"
                        :icon="feature.enabled ? 'check_circle' : 'cancel'"
                        :icon-color="feature.enabled ? 'positive' : 'negative'"
                      >
                        <q-card>
                          <q-card-section>
                            <div class="text-subtitle2">Details:</div>
                            <q-list dense>
                              <q-item v-if="feature.required">
                                <q-item-section>
                                  <q-chip color="warning" text-color="white">Required</q-chip>
                                </q-item-section>
                              </q-item>
                              <q-item v-if="feature.components">
                                <q-item-section>
                                  <div class="text-caption">Components:</div>
                                  <div>{{ feature.components.join(', ') }}</div>
                                </q-item-section>
                              </q-item>
                              <q-item v-if="feature.dependencies">
                                <q-item-section>
                                  <div class="text-caption">Dependencies:</div>
                                  <div>{{ feature.dependencies.join(', ') }}</div>
                                </q-item-section>
                              </q-item>
                              <q-item>
                                <q-item-section>
                                  <div class="text-caption">Expected Coverage:</div>
                                  <q-linear-progress
                                    :value="feature.expectedCoverage / 100"
                                    color="primary"
                                    class="q-mt-sm"
                                  />
                                  <div class="text-caption text-right">
                                    {{ feature.expectedCoverage }}%
                                  </div>
                                </q-item-section>
                              </q-item>
                            </q-list>
                          </q-card-section>
                        </q-card>
                      </q-expansion-item>
                    </template>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>
          </template>
        </div>
      </q-tab-panel>

      <!-- Debug Panel -->
      <q-tab-panel name="debug">
        <div class="text-h6 q-mb-md">Debug Information</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-card>
              <q-card-section>
                <div class="text-h6">Store Settings</div>
                <q-expansion-item
                  v-for="(store, storeName) in stores"
                  :key="storeName"
                  :label="storeName"
                  header-class="text-primary"
                >
                  <q-card>
                    <q-card-section>
                      <pre class="debug-pre">{{ store.$state }}</pre>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-6">
            <q-card>
              <q-card-section>
                <div class="text-h6">i18n Messages</div>
                <pre class="debug-pre">{{ $i18n.messages[$i18n.locale] }}</pre>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
// import { getCurrentInstance } from 'vue'
import { useStores } from 'stores'
import features from '../features.json'

const tab = ref('app')
const stores = useStores()
</script>

<style scoped>
.feature-card {
  height: 100%;
}

.debug-pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 400px;
  overflow-y: auto;
  font-size: 0.8em;
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
}
</style>
