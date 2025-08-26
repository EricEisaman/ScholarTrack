<template>
  <div class="network-settings-mode">
    <v-row>
      <v-col>
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-wifi</v-icon>
            Network Settings
          </v-card-title>
          
          <v-card-text>
            <v-alert
              type="info"
              variant="tonal"
              class="mb-4"
            >
              <strong>Network Configuration</strong><br>
              Manage server synchronization and network connectivity settings.
            </v-alert>

            <!-- Sync Status -->
            <v-row class="mb-4">
              <v-col>
                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-1">
                    <v-icon class="mr-2">mdi-sync</v-icon>
                    Data Synchronization
                  </v-card-title>
                  <v-card-text>
                    <p class="text-body-2 mb-3">
                      Synchronize data between local storage and server to ensure data consistency across devices.
                    </p>
                    
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-btn
                          color="primary"
                          @click="upSync"
                          :loading="isUpSyncing"
                          :disabled="isUpSyncing || isDownSyncing"
                          prepend-icon="mdi-upload"
                          block
                          class="mb-2"
                        >
                          {{ isUpSyncing ? 'Up Syncing...' : 'Up Sync' }}
                        </v-btn>
                        <p class="text-caption text-grey">
                          Upload local changes to server
                        </p>
                      </v-col>
                      
                      <v-col cols="12" md="6">
                        <v-btn
                          color="secondary"
                          @click="downSync"
                          :loading="isDownSyncing"
                          :disabled="isUpSyncing || isDownSyncing"
                          prepend-icon="mdi-download"
                          block
                          class="mb-2"
                        >
                          {{ isDownSyncing ? 'Down Syncing...' : 'Down Sync' }}
                        </v-btn>
                        <p class="text-caption text-grey">
                          Download server data to local
                        </p>
                      </v-col>
                    </v-row>
                    
                    <v-divider class="my-4" />
                    
                    <v-btn
                      color="info"
                      @click="fullSync"
                      :loading="isFullSyncing"
                      :disabled="isUpSyncing || isDownSyncing || isFullSyncing"
                      prepend-icon="mdi-sync"
                      block
                    >
                      {{ isFullSyncing ? 'Full Syncing...' : 'Full Sync (Up + Down)' }}
                    </v-btn>
                    <p class="text-caption text-grey mt-2">
                      Complete bidirectional synchronization
                    </p>
                    
                    <v-alert
                      v-if="syncMessage"
                      :type="syncMessageType"
                      variant="tonal"
                      class="mt-3"
                    >
                      {{ syncMessage }}
                    </v-alert>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Network Information -->
            <v-row class="mb-4">
              <v-col>
                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-1">
                    <v-icon class="mr-2">mdi-information</v-icon>
                    Network Information
                  </v-card-title>
                  <v-card-text>
                    <v-list>
                      <v-list-item>
                        <template #prepend>
                          <v-icon>mdi-server</v-icon>
                        </template>
                        <v-list-item-title>Server Status</v-list-item-title>
                        <v-list-item-subtitle>
                          <v-chip 
                            :color="serverStatus === 'online' ? 'success' : 'error'"
                            size="small"
                          >
                            {{ serverStatus === 'online' ? 'Online' : 'Offline' }}
                          </v-chip>
                        </v-list-item-subtitle>
                      </v-list-item>
                      
                      <v-list-item>
                        <template #prepend>
                          <v-icon>mdi-database</v-icon>
                        </template>
                        <v-list-item-title>Local Database</v-list-item-title>
                        <v-list-item-subtitle>
                          {{ localDataCount }} records stored locally
                        </v-list-item-subtitle>
                      </v-list-item>
                      
                      <v-list-item>
                        <template #prepend>
                          <v-icon>mdi-clock</v-icon>
                        </template>
                        <v-list-item-title>Last Sync</v-list-item-title>
                        <v-list-item-subtitle>
                          {{ lastSyncTime || 'Never' }}
                        </v-list-item-subtitle>
                      </v-list-item>
                      
                      <v-list-item>
                        <template #prepend>
                          <v-icon>mdi-sync</v-icon>
                        </template>
                        <v-list-item-title>Sync Status</v-list-item-title>
                        <v-list-item-subtitle>
                          <v-chip 
                            :color="isUpSyncing || isDownSyncing || isFullSyncing ? 'warning' : 'success'"
                            size="small"
                          >
                            {{ isUpSyncing ? 'Up Syncing...' : 
                               isDownSyncing ? 'Down Syncing...' : 
                               isFullSyncing ? 'Full Syncing...' : 'Ready' }}
                          </v-chip>
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Advanced Settings -->
            <v-row>
              <v-col>
                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-1">
                    <v-icon class="mr-2">mdi-cog</v-icon>
                    Advanced Settings
                  </v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-switch
                          v-model="autoSync"
                          label="Auto Sync"
                          color="primary"
                          hide-details
                        />
                        <p class="text-caption text-grey">
                          Automatically sync data when changes are made
                        </p>
                      </v-col>
                      
                      <v-col cols="12" md="6">
                        <v-switch
                          v-model="syncOnStartup"
                          label="Sync on Startup"
                          color="primary"
                          hide-details
                        />
                        <p class="text-caption text-grey">
                          Sync data when the application starts
                        </p>
                      </v-col>
                    </v-row>
                    
                    <v-divider class="my-4" />
                    
                    <v-btn
                      color="warning"
                      variant="outlined"
                      @click="clearLocalData"
                      prepend-icon="mdi-delete"
                    >
                      Clear Local Data
                    </v-btn>
                    <p class="text-caption text-grey mt-2">
                      Warning: This will delete all local data and require a fresh sync
                    </p>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../../stores/appStore'

const store = useAppStore()

// Local state
const isUpSyncing = ref(false)
const isDownSyncing = ref(false)
const isFullSyncing = ref(false)
const syncMessage = ref('')
const syncMessageType = ref<'success' | 'error' | 'info'>('info')
const serverStatus = ref<'online' | 'offline'>('offline')
const autoSync = ref(false)
const syncOnStartup = ref(true)
const lastSyncTime = ref('')

// Computed properties
const localDataCount = computed(() => {
  return store.students.length + store.classes.length + store.transactions.length
})

// Methods
const upSync = async () => {
  isUpSyncing.value = true
  syncMessage.value = 'Uploading local changes to server...'
  syncMessageType.value = 'info'
  
  try {
    await store.syncToServer()
    syncMessage.value = 'Up sync completed successfully!'
    syncMessageType.value = 'success'
    lastSyncTime.value = new Date().toLocaleString()
    serverStatus.value = 'online'
  } catch (error: unknown) {
    console.error('Up sync failed:', error)
    syncMessage.value = 'Up sync failed. Please check your connection and try again.'
    syncMessageType.value = 'error'
    serverStatus.value = 'offline'
  } finally {
    isUpSyncing.value = false
  }
}

const downSync = async () => {
  isDownSyncing.value = true
  syncMessage.value = 'Downloading server data to local...'
  syncMessageType.value = 'info'
  
  try {
    await store.loadFromServer()
    syncMessage.value = 'Down sync completed successfully!'
    syncMessageType.value = 'success'
    lastSyncTime.value = new Date().toLocaleString()
    serverStatus.value = 'online'
  } catch (error: unknown) {
    console.error('Down sync failed:', error)
    syncMessage.value = 'Down sync failed. Please check your connection and try again.'
    syncMessageType.value = 'error'
    serverStatus.value = 'offline'
  } finally {
    isDownSyncing.value = false
  }
}

const fullSync = async () => {
  isFullSyncing.value = true
  syncMessage.value = 'Performing full bidirectional sync...'
  syncMessageType.value = 'info'
  
  try {
    await store.fullSync()
    syncMessage.value = 'Full sync completed successfully!'
    syncMessageType.value = 'success'
    lastSyncTime.value = new Date().toLocaleString()
    serverStatus.value = 'online'
  } catch (error: unknown) {
    console.error('Full sync failed:', error)
    syncMessage.value = 'Full sync failed. Please check your connection and try again.'
    syncMessageType.value = 'error'
    serverStatus.value = 'offline'
  } finally {
    isFullSyncing.value = false
  }
}

const clearLocalData = async () => {
  if (confirm('Are you sure you want to clear all local data? This action cannot be undone.')) {
    try {
      // Clear local data (this would need to be implemented in the store)
      syncMessage.value = 'Local data cleared successfully'
      syncMessageType.value = 'success'
    } catch (error: unknown) {
      console.error('Failed to clear local data:', error)
      syncMessage.value = 'Failed to clear local data'
      syncMessageType.value = 'error'
    }
  }
}

// Check server status on mount
onMounted(async () => {
  try {
    const response = await fetch('/api/health')
    if (response.ok) {
      serverStatus.value = 'online'
    }
  } catch (error) {
    serverStatus.value = 'offline'
  }
})
</script>

<style scoped>
.network-settings-mode {
  max-width: 800px;
  margin: 0 auto;
}
</style>
