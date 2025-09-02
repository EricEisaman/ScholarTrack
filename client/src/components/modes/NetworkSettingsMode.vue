<template>
  <div class="network-settings-mode">
    <v-row>
      <v-col>
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">
              mdi-wifi
            </v-icon>
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
                    <v-icon class="mr-2">
                      mdi-sync
                    </v-icon>
                    Data Synchronization
                  </v-card-title>
                  <v-card-text>
                    <p class="text-body-2 mb-3">
                      Synchronize data between local storage and server to ensure data consistency across devices.
                    </p>

                    <v-row>
                      <v-col
                        cols="12"
                        md="6"
                      >
                        <v-btn
                          color="primary"
                          :loading="isUpSyncing"
                          :disabled="isUpSyncing || isDownSyncing"
                          prepend-icon="mdi-upload"
                          block
                          class="mb-2"
                          @click="upSync"
                        >
                          {{ isUpSyncing ? 'Up Syncing...' : 'Up Sync' }}
                        </v-btn>
                        <p class="text-caption text-grey">
                          Upload local changes to server
                        </p>
                      </v-col>

                      <v-col
                        cols="12"
                        md="6"
                      >
                        <v-btn
                          color="secondary"
                          :loading="isDownSyncing"
                          :disabled="isUpSyncing || isDownSyncing"
                          prepend-icon="mdi-download"
                          block
                          class="mb-2"
                          @click="downSync"
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
                      :loading="isFullSyncing"
                      :disabled="isUpSyncing || isDownSyncing || isFullSyncing"
                      prepend-icon="mdi-sync"
                      block
                      @click="fullSync"
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
                    <v-icon class="mr-2">
                      mdi-information
                    </v-icon>
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
                    <v-icon class="mr-2">
                      mdi-cog
                    </v-icon>
                    Advanced Settings
                  </v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col
                        cols="12"
                        md="6"
                      >
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

                      <v-col
                        cols="12"
                        md="6"
                      >
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
                      :loading="isClearingData"
                      :disabled="isClearingData"
                      prepend-icon="mdi-delete"
                      @click="clearLocalData"
                    >
                      {{ isClearingData ? 'Clearing...' : 'Clear Local Data' }}
                    </v-btn>
                    <p class="text-caption text-grey mt-2">
                      Warning: This will delete all local data and require a fresh sync
                    </p>

                    <v-divider class="my-4" />

                    <!-- Data Backup and Restore -->
                    <v-card
                      variant="outlined"
                      class="mb-4"
                    >
                      <v-card-title class="text-subtitle-1">
                        <v-icon class="mr-2">
                          mdi-database-export
                        </v-icon>
                        Data Backup & Restore
                      </v-card-title>
                      <v-card-text>
                        <p class="text-body-2 mb-3">
                          Download your entire local database for backup or transfer to another machine.
                          You can also restore data from a previously downloaded backup file.
                        </p>

                        <v-row>
                          <v-col
                            cols="12"
                            md="6"
                          >
                            <v-btn
                              color="success"
                              :loading="isDownloading"
                              :disabled="isDownloading || isUploading"
                              prepend-icon="mdi-download"
                              block
                              class="mb-2"
                              @click="downloadLocalStore"
                            >
                              {{ isDownloading ? 'Downloading...' : 'Download Local Store' }}
                            </v-btn>
                            <p class="text-caption text-grey">
                              Download complete database backup as JSON file
                            </p>
                          </v-col>

                          <v-col
                            cols="12"
                            md="6"
                          >
                            <v-btn
                              color="info"
                              :loading="isUploading"
                              :disabled="isDownloading || isUploading"
                              prepend-icon="mdi-upload"
                              block
                              class="mb-2"
                              @click="uploadLocalStore"
                            >
                              {{ isUploading ? 'Uploading...' : 'Upload Backup File' }}
                            </v-btn>
                            <p class="text-caption text-grey">
                              Restore data from a previously downloaded backup
                            </p>
                          </v-col>
                        </v-row>

                        <v-alert
                          v-if="backupMessage"
                          :type="backupMessageType"
                          variant="tonal"
                          class="mt-3"
                        >
                          {{ backupMessage }}
                        </v-alert>
                      </v-card-text>
                    </v-card>
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
import { ref, computed, onMounted } from 'vue';
import { useAppStore } from '../../stores/appStore';
import { componentLogger } from '../../services/logger';

const store = useAppStore();

// Local state
const isUpSyncing = ref(false);
const isDownSyncing = ref(false);
const isFullSyncing = ref(false);
const isClearingData = ref(false);
const syncMessage = ref('');
const syncMessageType = ref<'success' | 'error' | 'info'>('info');
const serverStatus = ref<'online' | 'offline'>('offline');
const lastSyncTime = ref(store.getLastSyncTime() || '');

// Backup and restore state
const isDownloading = ref(false);
const isUploading = ref(false);
const backupMessage = ref('');
const backupMessageType = ref<'success' | 'error' | 'info'>('info');

// Computed properties
const localDataCount = computed(() => {
  return store.students.length + store.classes.length + store.transactions.length;
});

// Settings computed properties that sync with store
const autoSync = computed({
  get: () => store.getAutoSync(),
  set: (value: boolean) => store.setAutoSync(value)
});

const syncOnStartup = computed({
  get: () => store.getSyncOnStartup(),
  set: (value: boolean) => store.setSyncOnStartup(value)
});

// Methods
const upSync = async (): Promise<void> => {
  isUpSyncing.value = true;
  syncMessage.value = 'Uploading local changes to server...';
  syncMessageType.value = 'info';

  try {
    await store.syncToServer();
    syncMessage.value = 'Up sync completed successfully!';
    syncMessageType.value = 'success';
    lastSyncTime.value = store.getLastSyncTime() || new Date().toLocaleString();
    serverStatus.value = 'online';
  } catch (error: unknown) {
    componentLogger.error('NetworkSettingsMode', 'Up sync failed', error instanceof Error ? error : new Error('Unknown error'));
    syncMessage.value = 'Up sync failed. Please check your connection and try again.';
    syncMessageType.value = 'error';
    serverStatus.value = 'offline';
  } finally {
    isUpSyncing.value = false;
  }
};

const downSync = async (): Promise<void> => {
  isDownSyncing.value = true;
  syncMessage.value = 'Downloading server data to local...';
  syncMessageType.value = 'info';

  try {
    await store.loadFromServer();
    syncMessage.value = 'Down sync completed successfully!';
    syncMessageType.value = 'success';
    lastSyncTime.value = store.getLastSyncTime() || new Date().toLocaleString();
    serverStatus.value = 'online';
  } catch (error: unknown) {
    componentLogger.error('NetworkSettingsMode', 'Down sync failed', error instanceof Error ? error : new Error('Unknown error'));
    syncMessage.value = 'Down sync failed. Please check your connection and try again.';
    syncMessageType.value = 'error';
    serverStatus.value = 'offline';
  } finally {
    isDownSyncing.value = false;
  }
};

const fullSync = async (): Promise<void> => {
  isFullSyncing.value = true;
  syncMessage.value = 'Performing full bidirectional sync...';
  syncMessageType.value = 'info';

  try {
    await store.fullSync();
    syncMessage.value = 'Full sync completed successfully!';
    syncMessageType.value = 'success';
    lastSyncTime.value = store.getLastSyncTime() || new Date().toLocaleString();
    serverStatus.value = 'online';
  } catch (error: unknown) {
    componentLogger.error('NetworkSettingsMode', 'Full sync failed', error instanceof Error ? error : new Error('Unknown error'));
    syncMessage.value = 'Full sync failed. Please check your connection and try again.';
    syncMessageType.value = 'error';
    serverStatus.value = 'offline';
  } finally {
    isFullSyncing.value = false;
  }
};

const clearLocalData = async (): Promise<void> => {
  if (confirm('Are you sure you want to clear all local data? This action cannot be undone.')) {
    isClearingData.value = true;
    try {
      syncMessage.value = 'Clearing local data...';
      syncMessageType.value = 'info';
      
      // Call the store method to actually clear all local data
      await store.clearAllData();
      
      syncMessage.value = 'Local data cleared successfully! All students, classes, and transactions have been removed.';
      syncMessageType.value = 'success';
      lastSyncTime.value = 'Never';
      
      // Update the store's last sync time
      store.setLastSyncTime('');
    } catch (error: unknown) {
      componentLogger.error('NetworkSettingsMode', 'Failed to clear local data', error instanceof Error ? error : new Error('Unknown error'));
      syncMessage.value = 'Failed to clear local data. Please try again.';
      syncMessageType.value = 'error';
    } finally {
      isClearingData.value = false;
    }
  }
};

const downloadLocalStore = (): void => {
  isDownloading.value = true;
  backupMessage.value = 'Preparing database backup...';
  backupMessageType.value = 'info';

  try {
    const backupData = store.exportDatabaseBackup();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `scholartrack-backup-${timestamp}.json`;

    // Create and download the file
    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    backupMessage.value = `Database backup downloaded successfully as ${filename}`;
    backupMessageType.value = 'success';
  } catch (error: unknown) {
    componentLogger.error('NetworkSettingsMode', 'Failed to download local store', error instanceof Error ? error : new Error('Unknown error'));
    backupMessage.value = 'Failed to download database backup. Please try again.';
    backupMessageType.value = 'error';
  } finally {
    isDownloading.value = false;
  }
};

const uploadLocalStore = (): void => {
  // Create a file input element
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.style.display = 'none';

  input.onchange = async (event: Event): Promise<void> => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    isUploading.value = true;
    backupMessage.value = 'Uploading and restoring backup...';
    backupMessageType.value = 'info';

    try {
      const text = await file.text();
      await store.importDatabaseBackup(text);

      backupMessage.value = 'Database backup restored successfully!';
      backupMessageType.value = 'success';
    } catch (error: unknown) {
      componentLogger.error('NetworkSettingsMode', 'Failed to upload local store', error instanceof Error ? error : new Error('Unknown error'));
      backupMessage.value = 'Failed to restore database backup. Please check the file format and try again.';
      backupMessageType.value = 'error';
    } finally {
      isUploading.value = false;
    }
  };

  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
};

// Check server status on mount
onMounted(async (): Promise<void> => {
  try {
    const response = await fetch('/api/health');
    if (response.ok) {
      serverStatus.value = 'online';
    }
  } catch (error) {
    serverStatus.value = 'offline';
  }
});
</script>
