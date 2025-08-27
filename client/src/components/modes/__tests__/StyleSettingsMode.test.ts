import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import StyleSettingsMode from '../StyleSettingsMode.vue'
import { useAppStore } from '../../../stores/appStore'
import type { StyleSettings } from '../../../types'

// Mock the store
vi.mock('../../../stores/appStore', () => ({
  useAppStore: vi.fn()
}))

describe('StyleSettingsMode', () => {
  let store: any

  beforeEach(() => {
    // Create a fresh Pinia instance for each test
    setActivePinia(createPinia())
    
    // Mock store methods
    store = {
      getStyleSettings: vi.fn(),
      updateStyleSettings: vi.fn(),
      styleSettings: null
    }
    
    ;(useAppStore as any).mockReturnValue(store)
  })

  it('renders the component correctly', () => {
    const wrapper = mount(StyleSettingsMode)
    
    expect(wrapper.find('.style-settings-mode').exists()).toBe(true)
    expect(wrapper.find('h5').text()).toContain('Style Settings')
    expect(wrapper.find('button').text()).toContain('Save Settings')
  })

  it('loads existing style settings on mount', () => {
    const mockSettings: StyleSettings = {
      id: 'default',
      primaryColor: '#FF0000',
      secondaryColor: '#00FF00',
      tertiaryColor: '#000000',
      quaternaryColor: '#121212',
      schoolName: 'ScholarTrack',
      logoImage: 'data:image/png;base64,test-logo',
      updatedAt: '2023-01-01T00:00:00Z'
    }
    
    store.getStyleSettings.mockReturnValue(mockSettings)
    
    const wrapper = mount(StyleSettingsMode)
    
    expect(store.getStyleSettings).toHaveBeenCalled()
    expect(wrapper.vm.primaryColor).toBe('#FF0000')
    expect(wrapper.vm.secondaryColor).toBe('#00FF00')
    expect(wrapper.vm.logoPreview).toBe('data:image/png;base64,test-logo')
  })

  it('updates primary color correctly', async () => {
    const wrapper = mount(StyleSettingsMode)
    
    await wrapper.setData({ primaryColor: '#123456' })
    
    expect(wrapper.vm.primaryColor).toBe('#123456')
  })

  it('updates secondary color correctly', async () => {
    const wrapper = mount(StyleSettingsMode)
    
    await wrapper.setData({ secondaryColor: '#654321' })
    
    expect(wrapper.vm.secondaryColor).toBe('#654321')
  })

  it('handles logo file upload', async () => {
    const wrapper = mount(StyleSettingsMode)
    
    const file = new File(['test'], 'test.png', { type: 'image/png' })
    
    await wrapper.vm.handleLogoUpload(file)
    
    // Wait for FileReader to complete - use nextTick since FileReader mock is async
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.logoPreview).toBe('data:image/png;base64,test-base64-data')
  })

  it('removes logo when removeLogo is called', async () => {
    const wrapper = mount(StyleSettingsMode)
    
    // Set initial logo
    await wrapper.setData({ 
      logoPreview: 'data:image/png;base64,test-logo',
      logoFile: new File(['test'], 'test.png', { type: 'image/png' })
    })
    
    await wrapper.vm.removeLogo()
    
    expect(wrapper.vm.logoPreview).toBe('')
    expect(wrapper.vm.logoFile).toBe(null)
  })

  it('saves settings successfully', async () => {
    const wrapper = mount(StyleSettingsMode)
    
    // Set form data
    await wrapper.setData({
      primaryColor: '#FF0000',
      secondaryColor: '#00FF00',
      logoPreview: 'data:image/png;base64,test-logo'
    })
    
    store.updateStyleSettings.mockResolvedValue(undefined)
    
    await wrapper.vm.saveSettings()
    
    expect(store.updateStyleSettings).toHaveBeenCalledWith({
      primaryColor: '#FF0000',
      secondaryColor: '#00FF00',
      logoImage: 'data:image/png;base64,test-logo'
    })
    
    expect(wrapper.vm.showSuccess).toBe(true)
  })

  it('validates form correctly', () => {
    const wrapper = mount(StyleSettingsMode)
    
    // Test with valid data
    wrapper.setData({
      primaryColor: '#FF0000',
      secondaryColor: '#00FF00'
    })
    
    expect(wrapper.vm.isValid).toBe(true)
    
    // Test with invalid data
    wrapper.setData({
      primaryColor: '',
      secondaryColor: ''
    })
    
    expect(wrapper.vm.isValid).toBe(false)
  })

  it('validates image file size', () => {
    const wrapper = mount(StyleSettingsMode)
    
    // Test valid file size
    const smallFile = new File(['test'], 'small.png', { type: 'image/png' })
    Object.defineProperty(smallFile, 'size', { value: 1024 * 1024 }) // 1MB
    
    expect(wrapper.vm.rules.imageSize(smallFile)).toBe(true)
    
    // Test invalid file size
    const largeFile = new File(['test'], 'large.png', { type: 'image/png' })
    Object.defineProperty(largeFile, 'size', { value: 3 * 1024 * 1024 }) // 3MB
    
    expect(wrapper.vm.rules.imageSize(largeFile)).toBe('Image must be less than 2MB')
  })

  it('validates image file type', () => {
    const wrapper = mount(StyleSettingsMode)
    
    // Test valid file types
    const pngFile = new File(['test'], 'test.png', { type: 'image/png' })
    const jpgFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const svgFile = new File(['test'], 'test.svg', { type: 'image/svg+xml' })
    
    expect(wrapper.vm.rules.imageType(pngFile)).toBe(true)
    expect(wrapper.vm.rules.imageType(jpgFile)).toBe(true)
    expect(wrapper.vm.rules.imageType(svgFile)).toBe(true)
    
    // Test invalid file type
    const txtFile = new File(['test'], 'test.txt', { type: 'text/plain' })
    expect(wrapper.vm.rules.imageType(txtFile)).toBe('Please upload a valid image file')
  })

  it('computes preview styles correctly', () => {
    const wrapper = mount(StyleSettingsMode)
    
    wrapper.setData({
      primaryColor: '#FF0000',
      secondaryColor: '#00FF00'
    })
    
    const previewStyles = wrapper.vm.previewStyles
    
    expect(previewStyles['--primary-color']).toBe('#FF0000')
    expect(previewStyles['--secondary-color']).toBe('#00FF00')
  })

  it('handles save error gracefully', async () => {
    const wrapper = mount(StyleSettingsMode)
    
    // Set form data
    await wrapper.setData({
      primaryColor: '#FF0000',
      secondaryColor: '#00FF00'
    })
    
    // Mock store error
    store.updateStyleSettings.mockRejectedValue(new Error('Save failed'))
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    await wrapper.vm.saveSettings()
    
    expect(consoleSpy).toHaveBeenCalledWith('Error saving style settings:', expect.any(Error))
    expect(wrapper.vm.saving).toBe(false)
    
    consoleSpy.mockRestore()
  })
})
