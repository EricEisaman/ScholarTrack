import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ManageTransactionsMode from '../ManageTransactionsMode.vue';
import { useAppStore } from '../../../stores/appStore';
import type { CustomStatusType, CustomTeacherEventType } from '../../../types';

// Mock the validation utilities
vi.mock('../../../utils/validation', () => ({
  validateCustomStatusType: vi.fn(() => ({ isValid: true, errors: [], warnings: [] })),
  validateCustomTeacherEventType: vi.fn(() => ({ isValid: true, errors: [], warnings: [] })),
}));

// Helper function to generate random string
const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

describe('ManageTransactionsMode', () => {
  let pinia: any;
  let store: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    store = useAppStore();

    // Mock store methods
    store.addCustomStatusType = vi.fn().mockResolvedValue({ isValid: true, errors: [], warnings: [] });
    store.addCustomTeacherEventType = vi.fn().mockResolvedValue({ isValid: true, errors: [], warnings: [] });
    store.removeCustomStatusType = vi.fn().mockResolvedValue(undefined);
    store.removeCustomTeacherEventType = vi.fn().mockResolvedValue(undefined);
    store.updateCustomStatusType = vi.fn().mockResolvedValue({ isValid: true, errors: [], warnings: [] });
    store.updateCustomTeacherEventType = vi.fn().mockResolvedValue({ isValid: true, errors: [], warnings: [] });
    store.validateTransactionData = vi.fn().mockResolvedValue({ orphanedStatuses: [], orphanedEvents: [] });
    store.exportDatabaseBackup = vi.fn().mockResolvedValue('{"test": "data"}');
    store.importDatabaseBackup = vi.fn().mockResolvedValue(undefined);
    store.clearAllData = vi.fn().mockResolvedValue(undefined);

    // Mock reactive state
    store.customStatusTypes = [];
    store.customTeacherEventTypes = [];
  });

  it('should mount successfully', () => {
    const wrapper = mount(ManageTransactionsMode);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.text-h4').text()).toBe('MANAGE TRANSACTIONS');
  });

  it('should add a custom status type with random name', async () => {
    const wrapper = mount(ManageTransactionsMode);
    const randomName = generateRandomString(10);

    // Set the status name
    await wrapper.setData({
      newStatusName: randomName,
      newStatusColor: '#FF5722',
    });

    // Trigger the add status type action
    await wrapper.vm.addStatusType();

    // Verify the store method was called with correct parameters
    expect(store.addCustomStatusType).toHaveBeenCalledWith(randomName, '#FF5722');

    // Verify form was reset
    expect(wrapper.vm.newStatusName).toBe('');
    expect(wrapper.vm.newStatusColor).toBe('#1976D2');
  });

  it('should add a custom teacher event type with random name', async () => {
    const wrapper = mount(ManageTransactionsMode);
    const randomName = generateRandomString(10);

    // Set the event name
    await wrapper.setData({
      newEventName: randomName,
    });

    // Trigger the add event type action
    await wrapper.vm.addEventType();

    // Verify the store method was called with correct parameters
    expect(store.addCustomTeacherEventType).toHaveBeenCalledWith(randomName);

    // Verify form was reset
    expect(wrapper.vm.newEventName).toBe('');
  });

  it('should display existing custom status types', async () => {
    const mockStatusTypes: CustomStatusType[] = [
      {
        id: '1',
        name: generateRandomString(8),
        color: '#FF5722',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: generateRandomString(8),
        color: '#4CAF50',
        createdAt: new Date().toISOString(),
      },
    ];

    store.customStatusTypes = mockStatusTypes;

    const wrapper = mount(ManageTransactionsMode);

    // Wait for reactive updates
    await wrapper.vm.$nextTick();

    // Verify status types are displayed
    const statusItems = wrapper.findAll('.custom-status-item');
    expect(statusItems).toHaveLength(2);

    // Verify first status type details
    expect(statusItems[0].text()).toContain(mockStatusTypes[0].name);
    expect(statusItems[0].text()).toContain(mockStatusTypes[0].color);
  });

  it('should display existing custom teacher event types', async () => {
    const mockEventTypes: CustomTeacherEventType[] = [
      {
        id: '1',
        name: generateRandomString(8),
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: generateRandomString(8),
        createdAt: new Date().toISOString(),
      },
    ];

    store.customTeacherEventTypes = mockEventTypes;

    const wrapper = mount(ManageTransactionsMode);

    // Wait for reactive updates
    await wrapper.vm.$nextTick();

    // Verify event types are displayed
    const eventItems = wrapper.findAll('.custom-event-item');
    expect(eventItems).toHaveLength(2);

    // Verify first event type details
    expect(eventItems[0].text()).toContain(mockEventTypes[0].name);
  });

  it('should handle validation errors for invalid status type names', async () => {
    const wrapper = mount(ManageTransactionsMode);
    const invalidName = 'a'; // Too short

    // Mock validation to return error
    const { validateCustomStatusType } = await import('../../../utils/validation');
    vi.mocked(validateCustomStatusType).mockReturnValue({
      isValid: false,
      errors: ['Status name must be at least 2 characters'],
      warnings: [],
    });

    // Set invalid name
    await wrapper.setData({
      newStatusName: invalidName,
    });

    // Trigger validation
    await wrapper.vm.validateStatusName();

    // Verify validation result
    expect(wrapper.vm.statusValidation).toEqual({
      isValid: false,
      errors: ['Status name must be at least 2 characters'],
      warnings: [],
    });
  });

  it('should handle validation errors for invalid event type names', async () => {
    const wrapper = mount(ManageTransactionsMode);
    const invalidName = 'a'; // Too short

    // Mock validation to return error
    const { validateCustomTeacherEventType } = await import('../../../utils/validation');
    vi.mocked(validateCustomTeacherEventType).mockReturnValue({
      isValid: false,
      errors: ['Event name must be at least 2 characters'],
      warnings: [],
    });

    // Set invalid name
    await wrapper.setData({
      newEventName: invalidName,
    });

    // Trigger validation
    await wrapper.vm.validateEventName();

    // Verify validation result
    expect(wrapper.vm.eventValidation).toEqual({
      isValid: false,
      errors: ['Event name must be at least 2 characters'],
      warnings: [],
    });
  });

  it('should export database backup', async () => {
    const wrapper = mount(ManageTransactionsMode);

    // Mock URL.createObjectURL and URL.revokeObjectURL
    const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
    const mockRevokeObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    // Mock document.createElement and appendChild
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
      remove: vi.fn(),
    };
    const mockCreateElement = vi.fn(() => mockLink);
    const mockAppendChild = vi.fn();
    const mockRemoveChild = vi.fn();

    Object.defineProperty(document, 'createElement', {
      value: mockCreateElement,
      writable: true,
    });
    Object.defineProperty(document.body, 'appendChild', {
      value: mockAppendChild,
      writable: true,
    });
    Object.defineProperty(document.body, 'removeChild', {
      value: mockRemoveChild,
      writable: true,
    });

    // Trigger export
    await wrapper.vm.exportBackup();

    // Verify store method was called
    expect(store.exportDatabaseBackup).toHaveBeenCalled();

    // Verify download was triggered
    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockLink.click).toHaveBeenCalled();
  });

  it('should validate data integrity', async () => {
    const wrapper = mount(ManageTransactionsMode);

    // Mock validation result with orphaned data
    store.validateTransactionData.mockResolvedValue({
      orphanedStatuses: ['INVALID_STATUS'],
      orphanedEvents: ['INVALID_EVENT'],
    });

    // Trigger validation
    await wrapper.vm.validateData();

    // Verify store method was called
    expect(store.validateTransactionData).toHaveBeenCalled();

    // Verify validation results are stored
    expect(wrapper.vm.validationResults).toEqual({
      orphanedStatuses: ['INVALID_STATUS'],
      orphanedEvents: ['INVALID_EVENT'],
    });
  });

  it('should handle data management dialog for orphaned data', async () => {
    const wrapper = mount(ManageTransactionsMode);

    // Mock validation result with orphaned data
    store.validateTransactionData.mockResolvedValue({
      orphanedStatuses: ['CUSTOM_STATUS'],
      orphanedEvents: [],
    });

    // Set up item to delete
    await wrapper.setData({
      itemToDelete: {
        id: '1',
        name: 'CUSTOM_STATUS',
        type: 'status',
      },
    });

    // Trigger removal (should show data management dialog)
    await wrapper.vm.removeStatusType('1');

    // Verify data management dialog is shown
    expect(wrapper.vm.showDataManagementDialog).toBe(true);
    expect(wrapper.vm.validationResults).toEqual({
      orphanedStatuses: ['CUSTOM_STATUS'],
      orphanedEvents: [],
    });
  });

  it('should handle successful migration', async () => {
    const wrapper = mount(ManageTransactionsMode);

    // Mock successful migration
    store.performDataMigration = vi.fn().mockResolvedValue({
      success: true,
      affectedRecords: 5,
      snapshotId: 'snapshot-123',
      rollbackPerformed: false,
    });

    // Set up migration scenario
    await wrapper.setData({
      itemToDelete: {
        id: '1',
        name: 'OLD_STATUS',
        type: 'status',
      },
      orphanedDataAction: 'migrate',
      migrationTargetStatus: 'NEW_STATUS',
    });

    // Trigger data management
    await wrapper.vm.handleDataManagement();

    // Verify migration was called
    expect(store.performDataMigration).toHaveBeenCalledWith('status', 'OLD_STATUS', 'NEW_STATUS');

    // Verify success dialog is shown
    expect(wrapper.vm.showMigrationSuccessDialog).toBe(true);
    expect(wrapper.vm.migrationSuccessData).toEqual({
      success: true,
      affectedRecords: 5,
      snapshotId: 'snapshot-123',
      rollbackPerformed: false,
    });
  });

  it('should handle failed migration with rollback', async () => {
    const wrapper = mount(ManageTransactionsMode);

    // Mock failed migration with rollback
    store.performDataMigration = vi.fn().mockResolvedValue({
      success: false,
      error: 'Migration failed',
      snapshotId: 'snapshot-123',
      rollbackPerformed: true,
    });

    // Set up migration scenario
    await wrapper.setData({
      itemToDelete: {
        id: '1',
        name: 'OLD_STATUS',
        type: 'status',
      },
      orphanedDataAction: 'migrate',
      migrationTargetStatus: 'NEW_STATUS',
    });

    // Trigger data management
    await wrapper.vm.handleDataManagement();

    // Verify migration was called
    expect(store.performDataMigration).toHaveBeenCalledWith('status', 'OLD_STATUS', 'NEW_STATUS');

    // Verify error dialog is shown
    expect(wrapper.vm.showMigrationErrorDialog).toBe(true);
    expect(wrapper.vm.migrationError).toBe('Migration failed');
    expect(wrapper.vm.migrationResultData).toEqual({
      success: false,
      error: 'Migration failed',
      snapshotId: 'snapshot-123',
      rollbackPerformed: true,
    });
  });

  it('should clear all data with confirmation', async () => {
    const wrapper = mount(ManageTransactionsMode);

    // Set up clear data scenario
    await wrapper.setData({
      showClearDataDialog: true,
    });

    // Trigger clear data
    await wrapper.vm.clearAllData();

    // Verify store method was called
    expect(store.clearAllData).toHaveBeenCalled();

    // Verify dialog is closed
    expect(wrapper.vm.showClearDataDialog).toBe(false);
  });

  it('should provide validation rules for status names', () => {
    const wrapper = mount(ManageTransactionsMode);

    const rules = wrapper.vm.getStatusNameRules();

    expect(rules).toHaveLength(3);
    expect(rules[0]('')).toBe('Status name is required');
    expect(rules[0]('valid')).toBe(true);
    expect(rules[1]('a')).toBe('Status name must be at least 2 characters');
    expect(rules[1]('valid')).toBe(true);
    expect(rules[2]('a'.repeat(51))).toBe('Status name cannot exceed 50 characters');
    expect(rules[2]('valid')).toBe(true);
  });

  it('should provide validation rules for event names', () => {
    const wrapper = mount(ManageTransactionsMode);

    const rules = wrapper.vm.getEventNameRules();

    expect(rules).toHaveLength(3);
    expect(rules[0]('')).toBe('Event name is required');
    expect(rules[0]('valid')).toBe(true);
    expect(rules[1]('a')).toBe('Event name must be at least 2 characters');
    expect(rules[1]('valid')).toBe(true);
    expect(rules[2]('a'.repeat(51))).toBe('Event name cannot exceed 50 characters');
    expect(rules[2]('valid')).toBe(true);
  });
});
