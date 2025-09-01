<template>
  <v-dialog
    v-model="showPicker"
    max-width="600"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">
          😀
        </v-icon>
        Choose Emoji
        <v-spacer />
        <v-btn
          icon
          @click="closePicker"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <!-- Search -->
        <v-text-field
          v-model="searchQuery"
          label="Search emojis..."
          variant="outlined"
          density="compact"
          clearable
          prepend-inner-icon="mdi-magnify"
          class="mb-4"
        />

        <!-- Category Tabs -->
        <v-tabs
          v-model="selectedCategory"
          class="mb-4"
        >
          <v-tab
            v-for="category in categories"
            :key="category"
            :value="category"
          >
            {{ getCategoryDisplayName(category) }}
          </v-tab>
        </v-tabs>

        <!-- Emoji Grid -->
        <div class="emoji-grid">
          <v-btn
            v-for="emoji in filteredEmojis"
            :key="emoji.emoji"
            variant="text"
            size="large"
            class="emoji-btn"
            :title="emoji.name"
            @click="selectEmoji(emoji)"
          >
            <span class="emoji-display">{{ emoji.emoji }}</span>
          </v-btn>
        </div>

        <!-- No Results -->
        <v-alert
          v-if="filteredEmojis.length === 0"
          type="info"
          variant="tonal"
          class="mt-4"
        >
          No emojis found matching "{{ searchQuery }}"
        </v-alert>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { emojis, getCategories, type EmojiData } from '../data/emojis';

interface Props {
  modelValue: boolean
}

interface Emits {
  (_e: 'update:modelValue', _value: boolean): void
  (_e: 'select', _emoji: EmojiData): void
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Local state
const searchQuery = ref('');
const selectedCategory = ref('faces');

// Computed properties
const showPicker = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const categories = computed(() => getCategories());

const filteredEmojis = computed(() => {
  let filtered = emojis.filter(emoji => emoji.category === selectedCategory.value);

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(emoji =>
      emoji.name.toLowerCase().includes(query) ||
      emoji.emoji.includes(query),
    );
  }

  return filtered;
});

// Methods
const getCategoryDisplayName = (category: string): string => {
  const names: Record<string, string> = {
    faces: 'Faces',
    animals: 'Animals',
    objects: 'Objects',
  };
  return names[category] ?? category;
};

const selectEmoji = (emoji: EmojiData): void => {
  emit('select', emoji);
  closePicker();
};

const closePicker = (): void => {
  showPicker.value = false;
  searchQuery.value = '';
};
</script>

<style scoped>
.emoji-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.emoji-btn {
  min-width: 50px !important;
  height: 50px !important;
  padding: 0 !important;
  border-radius: 8px !important;
}

.emoji-display {
  font-size: 24px;
  line-height: 1;
}

.emoji-btn:hover {
  background-color: rgba(0, 0, 0, 0.1) !important;
}
</style>
