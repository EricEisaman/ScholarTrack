<template>
  <div class="responsive-showcase">
    <!-- Breakpoint Information Display -->
    <v-row>
      <v-col>
        <v-card color="primary" dark>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-responsive</v-icon>
            Vuetify Responsive Design Showcase
            <v-spacer />
            <v-chip
              color="white"
              variant="outlined"
              :class="xs ? 'text-overline' : 'text-body-2'"
            >
              {{ currentBreakpoint }}
            </v-chip>
          </v-card-title>

          <v-card-text>
            <v-row>
              <v-col v-for="breakpoint in breakpoints" :key="breakpoint.name" cols="auto">
                <v-chip
                  :color="breakpoint.active ? 'white' : 'grey'"
                  :variant="breakpoint.active ? 'flat' : 'outlined'"
                  size="small"
                >
                  {{ breakpoint.name }}: {{ breakpoint.width }}
                </v-chip>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Responsive Layout Demonstrations -->
    <v-row class="mt-4">
      <!-- Desktop Layout (md and up) -->
      <v-col v-if="md" cols="12">
        <v-card variant="outlined">
          <v-card-title>
            <v-icon class="mr-2">mdi-desktop-classic</v-icon>
            Desktop Layout ({{ width }}px)
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="3">
                <v-card color="primary" dark>
                  <v-card-title>Sidebar</v-card-title>
                  <v-card-text>
                    <v-list>
                      <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard" />
                      <v-list-item prepend-icon="mdi-account-group" title="Students" />
                      <v-list-item prepend-icon="mdi-chart-line" title="Reports" />
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="9">
                <v-card>
                  <v-card-title>Main Content Area</v-card-title>
                  <v-card-text>
                    <p>Full desktop experience with sidebar navigation and spacious content area.</p>
                    <v-row>
                      <v-col v-for="i in 6" :key="i" cols="4">
                        <v-card color="grey-lighten-4" class="pa-4 text-center">
                          <v-icon size="32" color="primary">mdi-star</v-icon>
                          <p class="mt-2">Feature {{ i }}</p>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Tablet Layout (sm only) -->
      <v-col v-if="sm" cols="12">
        <v-card variant="outlined">
          <v-card-title>
            <v-icon class="mr-2">mdi-tablet</v-icon>
            Tablet Layout ({{ width }}px)
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col v-for="i in 4" :key="i" cols="6">
                <v-card color="grey-lighten-4" class="pa-4 text-center">
                  <v-icon size="24" color="primary">mdi-star</v-icon>
                  <p class="mt-2">Feature {{ i }}</p>
                </v-card>
              </v-col>
            </v-row>
            <v-alert type="info" variant="tonal" class="mt-4">
              Optimized for tablet interaction with touch-friendly buttons and responsive grid.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Mobile Layout (xs only) -->
      <v-col v-if="xs" cols="12">
        <v-card variant="outlined">
          <v-card-title>
            <v-icon class="mr-2">mdi-cellphone</v-icon>
            Mobile Layout ({{ width }}px)
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col v-for="i in 2" :key="i" cols="12">
                <v-card color="grey-lighten-4" class="pa-3 text-center">
                  <v-icon size="20" color="primary">mdi-star</v-icon>
                  <p class="mt-2">Feature {{ i }}</p>
                </v-card>
              </v-col>
            </v-row>
            <v-alert type="success" variant="tonal" class="mt-4">
              Mobile-first design with full-screen modals and touch-optimized interactions.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Responsive Component Examples -->
    <v-row class="mt-4">
      <v-col>
        <v-card variant="outlined">
          <v-card-title>
            <v-icon class="mr-2">mdi-puzzle</v-icon>
            Responsive Component Examples
          </v-card-title>
          <v-card-text>
            <!-- Responsive Button Sizes -->
            <v-row class="mb-4">
              <v-col>
                <h4 class="text-subtitle-1 mb-2">Button Sizes</h4>
                <v-btn
                  v-for="size in buttonSizes"
                  :key="size"
                  :size="size"
                  color="primary"
                  class="ma-1"
                >
                  {{ size }} Button
                </v-btn>
              </v-col>
            </v-row>

            <!-- Responsive Grid -->
            <v-row class="mb-4">
              <v-col>
                <h4 class="text-subtitle-1 mb-2">Responsive Grid</h4>
                <v-row>
                  <v-col
                    v-for="i in gridItems"
                    :key="i"
                    :cols="gridCols"
                    :class="{ 'pa-1': xs }"
                  >
                    <v-card color="primary" dark class="pa-3 text-center">
                      <v-icon>mdi-numeric-{{ i }}</v-icon>
                      <p class="mt-1">Item {{ i }}</p>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

            <!-- Responsive Typography -->
            <v-row class="mb-4">
              <v-col>
                <h4 class="text-subtitle-1 mb-2">Responsive Typography</h4>
                <p :class="responsiveTextClass">
                  This text adapts its size based on screen size.
                  {{ xs ? 'Small mobile text' :
                     sm ? 'Medium tablet text' :
                     'Large desktop text' }}
                </p>
              </v-col>
            </v-row>

            <!-- Responsive Spacing -->
            <v-row>
              <v-col>
                <h4 class="text-subtitle-1 mb-2">Responsive Spacing</h4>
                <v-card
                  :class="spacingClass"
                  color="grey-lighten-4"
                >
                  <v-card-text>
                    This card demonstrates responsive padding and margins.
                    <br>
                    <strong>Current spacing:</strong> {{ spacingDescription }}
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Breakpoint Helper Properties -->
    <v-row class="mt-4">
      <v-col>
        <v-card variant="outlined">
          <v-card-title>
            <v-icon class="mr-2">mdi-code-braces</v-icon>
            Breakpoint Helper Properties
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col v-for="helper in breakpointHelpers" :key="helper.name" cols="6" md="3">
                <v-card
                  :color="helper.active ? 'success' : 'grey-lighten-4'"
                  :class="helper.active ? 'text-white' : ''"
                >
                  <v-card-text class="text-center">
                    <v-icon :color="helper.active ? 'white' : 'grey'">
                      {{ helper.active ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                    </v-icon>
                    <p class="mt-2 text-caption">{{ helper.name }}</p>
                    <p class="text-caption">{{ helper.description }}</p>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Performance Metrics -->
    <v-row class="mt-4">
      <v-col>
        <v-card variant="outlined">
          <v-card-title>
            <v-icon class="mr-2">mdi-speedometer</v-icon>
            Responsive Performance
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col v-for="metric in performanceMetrics" :key="metric.name" cols="6" md="3">
                <v-card color="info" dark>
                  <v-card-text class="text-center">
                    <v-icon size="32">mdi-{{ metric.icon }}</v-icon>
                    <p class="text-h6 mt-2">{{ metric.value }}</p>
                    <p class="text-caption">{{ metric.name }}</p>
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
import { computed } from 'vue';
import { useDisplay } from 'vuetify';

const { xs, sm, md, lg, xl, width, mobile } = useDisplay();

// Breakpoint information
const breakpoints = computed(() => [
  { name: 'xs', width: '< 600px', active: xs.value },
  { name: 'sm', width: '600px+', active: sm.value },
  { name: 'md', width: '960px+', active: md.value },
  { name: 'lg', width: '1264px+', active: lg.value },
  { name: 'xl', width: '1904px+', active: xl.value },
]);

const currentBreakpoint = computed(() => {
  if (xs.value) return 'XS';
  if (sm.value) return 'Small (600px - 959px)';
  if (md.value) return 'Medium (960px - 1263px)';
  if (lg.value) return 'Large (1264px - 1903px)';
  return 'Extra Large (1904px+)';
});

// Responsive component examples
const buttonSizes = computed(() => {
  if (xs.value) return ['small', 'default'];
  if (sm.value) return ['small', 'default', 'large'];
  return ['x-small', 'small', 'default', 'large', 'x-large'];
});

const gridItems = computed(() => {
  if (xs.value) return 2;
  if (sm.value) return 4;
  if (md.value) return 6;
  return 8;
});

const gridCols = computed(() => {
  if (xs.value) return 6;
  if (sm.value) return 3;
  if (md.value) return 2;
  return 3;
});

const responsiveTextClass = computed(() => {
  if (xs.value) return 'text-body-2';
  if (sm.value) return 'text-body-1';
  return 'text-h6';
});

const spacingClass = computed(() => {
  if (xs.value) return 'pa-2 ma-1';
  if (sm.value) return 'pa-4 ma-2';
  return 'pa-6 ma-4';
});

const spacingDescription = computed(() => {
  if (xs.value) return 'Compact (pa-2, ma-1)';
  if (sm.value) return 'Medium (pa-4, ma-2)';
  return 'Spacious (pa-6, ma-4)';
});

// Breakpoint helper properties
const breakpointHelpers = computed(() => [
  {
    name: 'xs',
    description: 'Extra small only',
    active: xs.value,
  },
  {
    name: 'mobile',
    description: 'Mobile devices',
    active: mobile.value,
  },
  {
    name: 'md',
    description: 'Medium and above',
    active: md.value,
  },
  {
    name: 'lg',
    description: 'Large screens',
    active: lg.value,
  },
]);

// Performance metrics
const performanceMetrics = computed(() => [
  {
    name: 'Breakpoint Updates',
    value: 'Real-time',
    icon: 'refresh',
  },
  {
    name: 'Component Rendering',
    value: 'Conditional',
    icon: 'view-dashboard',
  },
  {
    name: 'Layout Adaptation',
    value: 'Automatic',
    icon: 'resize',
  },
  {
    name: 'Touch Optimization',
    value: mobile.value ? 'Enabled' : 'Desktop',
    icon: 'gesture-tap',
  },
]);
</script>

<style scoped>
.responsive-showcase {
  max-width: 1200px;
  margin: 0 auto;
}

/* Smooth transitions for responsive changes */
.v-card {
  transition: all 0.3s ease;
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .responsive-showcase {
    padding: 8px;
  }
}
</style>
