import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mountWithVuetify, createMockStore, testUtils, dataFactories } from '../../../test/utils';
import { TEST_DATA } from '../../../test/config';
import StyleSettingsMode from '../StyleSettingsMode.vue';
import { useAppStore } from '../../../stores/appStore';
import type { StyleSettings } from '../../../types';
import type { VueWrapper } from '@vue/test-utils';

// Mock the store
vi.mock('../../../stores/appStore', () => ({
  useAppStore: vi.fn(),
}));

describe('StyleSettingsMode', () => {
  let store: ReturnType<typeof createMockStore>;
  let wrapper: VueWrapper<unknown>;

  beforeEach(() => {
    // Create a fresh mock store for each test
    store = createMockStore({
      getStyleSettings: vi.fn(),
      updateStyleSettings: vi.fn(),
      styleSettings: null,
    });

    (useAppStore as ReturnType<typeof vi.fn>).mockReturnValue(store);

    // Mount component with Vuetify
    wrapper = mountWithVuetify(StyleSettingsMode);
  });

  it('renders the component correctly', () => {
    testUtils.assertExists(wrapper);
    expect(wrapper.find('.style-settings-mode').exists()).toBe(true);
    expect(wrapper.find('h5').text()).toContain('Style Settings');
    expect(wrapper.find('button').text()).toContain('Save Settings');
  });

  it('loads existing style settings on mount', () => {
    const mockSettings: StyleSettings = dataFactories.createStyleSettings({
      primaryColor: '#FF0000',
      secondaryColor: '#00FF00',
      logoImage: 'data:image/png;base64,test-logo',
    });

    store.getStyleSettings.mockReturnValue(mockSettings);

    const newWrapper = mountWithVuetify(StyleSettingsMode);

    expect(store.getStyleSettings).toHaveBeenCalled();
    expect(newWrapper.vm.primaryColor).toBe('#FF0000');
    expect(newWrapper.vm.secondaryColor).toBe('#00FF00');
    expect(newWrapper.vm.logoPreview).toBe('data:image/png;base64,test-logo');
  });

  it('updates primary color correctly', async () => {
    await wrapper.setData({ primaryColor: '#123456' });
    expect(wrapper.vm.primaryColor).toBe('#123456');
  });

  it('updates secondary color correctly', async () => {
    await wrapper.setData({ secondaryColor: '#654321' });
    expect(wrapper.vm.secondaryColor).toBe('#654321');
  });

  it('handles logo file upload', async () => {
    const file = new File(['test'], 'test.png', { type: 'image/png' });

    await wrapper.vm.handleLogoUpload(file);

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.logoPreview).toBe('data:image/png;base64,test-base64-data');
  });

  it('removes logo when removeLogo is called', async () => {
    await wrapper.setData({
      logoPreview: 'data:image/png;base64,test-logo',
      logoFile: new File(['test'], 'test.png', { type: 'image/png' }),
    });

    await wrapper.vm.removeLogo();

    expect(wrapper.vm.logoPreview).toBe('');
    expect(wrapper.vm.logoFile).toBe(null);
  });

  it('saves settings successfully', async () => {
    await wrapper.setData({
      primaryColor: '#FF0000',
      secondaryColor: '#00FF00',
      logoPreview: 'data:image/png;base64,test-logo',
    });

    store.updateStyleSettings.mockResolvedValue(undefined);

    await wrapper.vm.saveSettings();

    expect(store.updateStyleSettings).toHaveBeenCalledWith({
      primaryColor: '#FF0000',
      secondaryColor: '#00FF00',
      logoImage: 'data:image/png;base64,test-logo',
    });

    expect(wrapper.vm.showSuccess).toBe(true);
  });

  it('validates form correctly', async () => {
    // Test with valid data
    await wrapper.setData({
      primaryColor: '#FF0000',
      secondaryColor: '#00FF00',
    });

    expect(wrapper.vm.isValid).toBe(true);

    // Test with invalid data
    await wrapper.setData({
      primaryColor: '',
      secondaryColor: '',
    });

    expect(wrapper.vm.isValid).toBe(false);
  });

  it('validates image file size', () => {
    // Test valid file size
    const smallFile = new File(['test'], 'small.png', { type: 'image/png' });
    Object.defineProperty(smallFile, 'size', { value: 1024 * 1024 }); // 1MB

    expect(wrapper.vm.rules.imageSize(smallFile)).toBe(true);

    // Test invalid file size
    const largeFile = new File(['test'], 'large.png', { type: 'image/png' });
    Object.defineProperty(largeFile, 'size', { value: 3 * 1024 * 1024 }); // 3MB

    expect(wrapper.vm.rules.imageSize(largeFile)).toBe('Image must be less than 2MB');
  });

  it('validates image file type', () => {
    // Test valid file types
    const pngFile = new File(['test'], 'test.png', { type: 'image/png' });
    const jpgFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const svgFile = new File(['test'], 'test.svg', { type: 'image/svg+xml' });

    expect(wrapper.vm.rules.imageType(pngFile)).toBe(true);
    expect(wrapper.vm.rules.imageType(jpgFile)).toBe(true);
    expect(wrapper.vm.rules.imageType(svgFile)).toBe(true);

    // Test invalid file type
    const txtFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    expect(wrapper.vm.rules.imageType(txtFile)).toBe('Please upload a valid image file');
  });

  it('computes preview styles correctly', async () => {
    await wrapper.setData({
      primaryColor: '#FF0000',
      secondaryColor: '#00FF00',
    });

    const previewStyles = wrapper.vm.previewStyles;

    expect(previewStyles['--primary-color']).toBe('#FF0000');
    expect(previewStyles['--secondary-color']).toBe('#00FF00');
  });

  it('handles save error gracefully', async () => {
    await wrapper.setData({
      primaryColor: '#FF0000',
      secondaryColor: '#00FF00',
    });

    // Mock store error
    store.updateStyleSettings.mockRejectedValue(new Error('Save failed'));

    await wrapper.vm.saveSettings();

    expect(wrapper.vm.error).toBe('Save failed');
    expect(wrapper.vm.saving).toBe(false);
  });

  it('validates color inputs correctly', async () => {
    // Test valid colors
    const validColors = TEST_DATA.STYLE_SETTINGS.VALID_COLORS;
    
    for (const color of validColors) {
      await wrapper.setData({ primaryColor: color });
      expect(wrapper.vm.isPrimaryColorValid).toBe(true);
    }

    // Test invalid colors
    const invalidColors = TEST_DATA.STYLE_SETTINGS.INVALID_COLORS;
    
    for (const color of invalidColors) {
      await wrapper.setData({ primaryColor: color });
      expect(wrapper.vm.isPrimaryColorValid).toBe(false);
    }
  });

  it('applies theme changes correctly', async () => {
    await wrapper.setData({
      theme: 'dark',
    });

    await wrapper.vm.applyTheme();

    expect(wrapper.vm.currentTheme).toBe('dark');
    testUtils.assertHasClass(wrapper, 'theme-dark');
  });

  it('resets settings to defaults', async () => {
    await wrapper.setData({
      primaryColor: '#FF0000',
      secondaryColor: '#00FF00',
      logoPreview: 'data:image/png;base64,custom-logo',
    });

    await wrapper.vm.resetToDefaults();

    expect(wrapper.vm.primaryColor).toBe(TEST_DATA.STYLE_SETTINGS.DEFAULT.primaryColor);
    expect(wrapper.vm.secondaryColor).toBe(TEST_DATA.STYLE_SETTINGS.DEFAULT.secondaryColor);
    expect(wrapper.vm.logoPreview).toBe('');
  });

  it('exports style configuration', async () => {
    const mockSettings = dataFactories.createStyleSettings();
    store.styleSettings = mockSettings;

    const exportData = await wrapper.vm.exportConfiguration();

    expect(exportData).toEqual(mockSettings);
  });

  it('imports style configuration', async () => {
    const importData = dataFactories.createStyleSettings({
      primaryColor: '#FF0000',
      secondaryColor: '#00FF00',
    });

    await wrapper.vm.importConfiguration(importData);

    expect(wrapper.vm.primaryColor).toBe('#FF0000');
    expect(wrapper.vm.secondaryColor).toBe('#00FF00');
  });
});
