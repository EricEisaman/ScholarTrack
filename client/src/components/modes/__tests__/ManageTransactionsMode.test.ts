import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mountWithVuetify, createMockStore, testUtils, dataFactories } from '../../../test/utils';
import { TEST_DATA } from '../../../test/config';
import ManageTransactionsMode from '../ManageTransactionsMode.vue';
import { useAppStore } from '../../../stores/appStore';
import type { CustomStatusType, CustomTeacherEventType } from '../../../types';
import type { VueWrapper } from '@vue/test-utils';

// Mock the store
vi.mock('../../../stores/appStore', () => ({
  useAppStore: vi.fn(),
}));

describe('ManageTransactionsMode', () => {
  let store: ReturnType<typeof createMockStore>;
  let wrapper: VueWrapper<unknown>;

  beforeEach(() => {
    // Create a fresh mock store for each test
    store = createMockStore({
      customStatusTypes: [],
      customTeacherEventTypes: [],
      addCustomStatusType: vi.fn().mockResolvedValue({ isValid: true, errors: [], warnings: [] }),
      addCustomTeacherEventType: vi.fn().mockResolvedValue({ isValid: true, errors: [], warnings: [] }),
      removeCustomStatusType: vi.fn().mockResolvedValue(undefined),
      removeCustomTeacherEventType: vi.fn().mockResolvedValue(undefined),
      updateCustomStatusType: vi.fn().mockResolvedValue({ isValid: true, errors: [], warnings: [] }),
      updateCustomTeacherEventType: vi.fn().mockResolvedValue({ isValid: true, errors: [], warnings: [] }),
      validateTransactionData: vi.fn().mockResolvedValue({ orphanedStatuses: [], orphanedEvents: [] }),
      exportDatabaseBackup: vi.fn().mockResolvedValue('{"test": "data"}'),
      importDatabaseBackup: vi.fn().mockResolvedValue(undefined),
      clearAllData: vi.fn().mockResolvedValue(undefined),
    });

    (useAppStore as ReturnType<typeof vi.fn>).mockReturnValue(store);

    // Mount component with Vuetify
    wrapper = mountWithVuetify(ManageTransactionsMode);
  });

  it('should mount successfully', () => {
    testUtils.assertExists(wrapper);
    expect(wrapper.find('.text-h4').text()).toBe('MANAGE TRANSACTIONS');
  });

  it('should add a custom status type', async () => {
    const statusName = 'Test Status';
    
    await wrapper.setData({
      newStatusName: statusName,
      newStatusColor: '#FF5722',
    });

    await wrapper.vm.addStatusType();

    expect(store.addCustomStatusType).toHaveBeenCalledWith(statusName, '#FF5722');
    expect(wrapper.vm.newStatusName).toBe('');
    expect(wrapper.vm.newStatusColor).toBe('#1976D2');
  });

  it('should add a custom teacher event type', async () => {
    const eventName = 'Test Event';
    
    await wrapper.setData({
      newEventName: eventName,
    });

    await wrapper.vm.addEventType();

    expect(store.addCustomTeacherEventType).toHaveBeenCalledWith(eventName);
    expect(wrapper.vm.newEventName).toBe('');
  });

  it('should display existing custom status types', async () => {
    const mockStatusTypes: CustomStatusType[] = [
      {
        id: '1',
        name: 'Present',
        color: '#FF5722',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Absent',
        color: '#4CAF50',
        createdAt: new Date().toISOString(),
      },
    ];

    store.customStatusTypes = mockStatusTypes;

    await wrapper.vm.$nextTick();

    const statusItems = wrapper.findAll('.custom-status-item');
    expect(statusItems).toHaveLength(2);

    testUtils.assertContainsText(statusItems[0], mockStatusTypes[0].name);
    testUtils.assertContainsText(statusItems[0], mockStatusTypes[0].color);
  });

  it('should display existing custom teacher event types', async () => {
    const mockEventTypes: CustomTeacherEventType[] = [
      {
        id: '1',
        name: 'Late Arrival',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Early Departure',
        createdAt: new Date().toISOString(),
      },
    ];

    store.customTeacherEventTypes = mockEventTypes;

    await wrapper.vm.$nextTick();

    const eventItems = wrapper.findAll('.custom-event-item');
    expect(eventItems).toHaveLength(2);

    testUtils.assertContainsText(eventItems[0], mockEventTypes[0].name);
  });

  it('should handle validation errors for invalid status type names', async () => {
    const invalidName = 'a'; // Too short

    await wrapper.setData({
      newStatusName: invalidName,
    });

    await wrapper.vm.validateStatusName();

    expect(wrapper.vm.statusValidation.isValid).toBe(false);
    expect(wrapper.vm.statusValidation.errors).toContain('Status name must be at least 2 characters');
  });

  it('should handle validation errors for invalid event type names', async () => {
    const invalidName = 'a'; // Too short

    await wrapper.setData({
      newEventName: invalidName,
    });

    await wrapper.vm.validateEventName();

    expect(wrapper.vm.eventValidation.isValid).toBe(false);
    expect(wrapper.vm.eventValidation.errors).toContain('Event name must be at least 2 characters');
  });

  it('should export database backup', async () => {
    const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
    const mockRevokeObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

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

    await wrapper.vm.exportBackup();

    expect(store.exportDatabaseBackup).toHaveBeenCalled();
    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockLink.click).toHaveBeenCalled();
  });

  it('should validate data integrity', async () => {
    store.validateTransactionData.mockResolvedValue({
      orphanedStatuses: ['INVALID_STATUS'],
      orphanedEvents: ['INVALID_EVENT'],
    });

    await wrapper.vm.validateData();

    expect(store.validateTransactionData).toHaveBeenCalled();
    expect(wrapper.vm.validationResults).toEqual({
      orphanedStatuses: ['INVALID_STATUS'],
      orphanedEvents: ['INVALID_EVENT'],
    });
  });

  it('should handle data management dialog for orphaned data', async () => {
    store.validateTransactionData.mockResolvedValue({
      orphanedStatuses: ['CUSTOM_STATUS'],
      orphanedEvents: [],
    });

    await wrapper.setData({
      itemToDelete: {
        id: '1',
        name: 'CUSTOM_STATUS',
        type: 'status',
      },
    });

    await wrapper.vm.removeStatusType('1');

    expect(wrapper.vm.showDataManagementDialog).toBe(true);
    expect(wrapper.vm.validationResults).toEqual({
      orphanedStatuses: ['CUSTOM_STATUS'],
      orphanedEvents: [],
    });
  });

  it('should handle successful migration', async () => {
    store.performDataMigration = vi.fn().mockResolvedValue({
      success: true,
      affectedRecords: 5,
      snapshotId: 'snapshot-123',
      rollbackPerformed: false,
    });

    await wrapper.setData({
      itemToDelete: {
        id: '1',
        name: 'OLD_STATUS',
        type: 'status',
      },
      orphanedDataAction: 'migrate',
      migrationTargetStatus: 'NEW_STATUS',
    });

    await wrapper.vm.handleDataManagement();

    expect(store.performDataMigration).toHaveBeenCalledWith('status', 'OLD_STATUS', 'NEW_STATUS');
    expect(wrapper.vm.showMigrationSuccessDialog).toBe(true);
    expect(wrapper.vm.migrationSuccessData).toEqual({
      success: true,
      affectedRecords: 5,
      snapshotId: 'snapshot-123',
      rollbackPerformed: false,
    });
  });

  it('should handle failed migration with rollback', async () => {
    store.performDataMigration = vi.fn().mockResolvedValue({
      success: false,
      error: 'Migration failed',
      snapshotId: 'snapshot-123',
      rollbackPerformed: true,
    });

    await wrapper.setData({
      itemToDelete: {
        id: '1',
        name: 'OLD_STATUS',
        type: 'status',
      },
      orphanedDataAction: 'migrate',
      migrationTargetStatus: 'NEW_STATUS',
    });

    await wrapper.vm.handleDataManagement();

    expect(store.performDataMigration).toHaveBeenCalledWith('status', 'OLD_STATUS', 'NEW_STATUS');
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
    await wrapper.setData({
      showClearDataDialog: true,
    });

    await wrapper.vm.clearAllData();

    expect(store.clearAllData).toHaveBeenCalled();
    expect(wrapper.vm.showClearDataDialog).toBe(false);
  });

  it('should provide validation rules for status names', () => {
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
