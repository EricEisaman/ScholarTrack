import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mountWithVuetify, createMockStore, testUtils, dataFactories } from '../../../test/utils';
import { TEST_DATA, assertionHelpers } from '../../../test/config';
import StandardMode from '../StandardMode.vue';
import { useAppStore } from '../../../stores/appStore';
import type { Student, Class, Transaction } from '../../../types';
import type { VueWrapper } from '@vue/test-utils';

// Mock the store
vi.mock('../../../stores/appStore', () => ({
  useAppStore: vi.fn(),
}));

describe('StandardMode', () => {
  let store: ReturnType<typeof createMockStore>;
  let wrapper: VueWrapper<unknown>;

  beforeEach(() => {
    // Create a fresh mock store for each test
    store = createMockStore({
      students: [],
      classes: [],
      transactions: [],
      currentMode: 'standard',
      isLoading: false,
      error: null,
      addStudent: vi.fn().mockResolvedValue({ success: true }),
      updateStudent: vi.fn().mockResolvedValue({ success: true }),
      deleteStudent: vi.fn().mockResolvedValue({ success: true }),
      addClass: vi.fn().mockResolvedValue({ success: true }),
      updateClass: vi.fn().mockResolvedValue({ success: true }),
      deleteClass: vi.fn().mockResolvedValue({ success: true }),
      addTransaction: vi.fn().mockResolvedValue({ success: true }),
      updateTransaction: vi.fn().mockResolvedValue({ success: true }),
      deleteTransaction: vi.fn().mockResolvedValue({ success: true }),
      getStudents: vi.fn().mockResolvedValue([]),
      getClasses: vi.fn().mockResolvedValue([]),
      getTransactions: vi.fn().mockResolvedValue([]),
    });

    (useAppStore as ReturnType<typeof vi.fn>).mockReturnValue(store);

    // Mount component with Vuetify
    wrapper = mountWithVuetify(StandardMode);
  });

  afterEach(() => {
    vi.clearAllMocks();
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe('Component Rendering', () => {
    it('should mount successfully with Vuetify components', () => {
      testUtils.assertExists(wrapper);
      expect(wrapper.find('.standard-mode').exists()).toBe(true);
    });

    it('should display the correct title', () => {
      testUtils.assertContainsText(wrapper, 'Standard Mode');
    });

    it('should render all main sections', () => {
      const sections = ['students-section', 'classes-section', 'transactions-section'];
      sections.forEach(section => {
        expect(wrapper.find(`[data-test="${section}"]`).exists()).toBe(true);
      });
    });
  });

  describe('Student Management', () => {
    it('should display student form when add student button is clicked', async () => {
      const addButton = wrapper.find('[data-test="add-student-btn"]');
      expect(addButton.exists()).toBe(true);

      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('[data-test="student-form"]').exists()).toBe(true);
    });

    it('should validate student form inputs correctly', async () => {
      // Test with valid data
      const validStudent = dataFactories.createStudent();
      
      await wrapper.setData({
        newStudent: validStudent,
        showStudentForm: true,
      });

      expect(wrapper.vm.isStudentFormValid).toBe(true);

      // Test with invalid data
      const invalidStudent = { ...validStudent, firstName: '' };
      
      await wrapper.setData({
        newStudent: invalidStudent,
      });

      expect(wrapper.vm.isStudentFormValid).toBe(false);
    });

    it('should add a new student successfully', async () => {
      const newStudent = dataFactories.createStudent({
        firstName: 'Jane',
        lastName: 'Smith',
        grade: '11th',
      });

      await wrapper.setData({
        newStudent,
        showStudentForm: true,
      });

      const submitButton = wrapper.find('[data-test="submit-student-btn"]');
      await submitButton.trigger('click');

      expect(store.addStudent).toHaveBeenCalledWith(newStudent);
      expect(wrapper.vm.showStudentForm).toBe(false);
    });

    it('should display existing students in a list', async () => {
      const mockStudents = dataFactories.createStudents(3);
      store.students = mockStudents;

      await wrapper.vm.$nextTick();

      const studentItems = wrapper.findAll('[data-test="student-item"]');
      expect(studentItems).toHaveLength(3);

      // Verify first student details
      const firstStudent = studentItems[0];
      testUtils.assertContainsText(firstStudent, mockStudents[0].firstName);
      testUtils.assertContainsText(firstStudent, mockStudents[0].lastName);
      testUtils.assertContainsText(firstStudent, mockStudents[0].grade);
    });

    it('should handle student deletion with confirmation', async () => {
      const mockStudents = dataFactories.createStudents(1);
      store.students = mockStudents;

      await wrapper.vm.$nextTick();

      const deleteButton = wrapper.find('[data-test="delete-student-btn"]');
      await deleteButton.trigger('click');

      // Should show confirmation dialog
      expect(wrapper.vm.showDeleteConfirmation).toBe(true);
      expect(wrapper.vm.itemToDelete).toEqual(mockStudents[0]);

      // Confirm deletion
      const confirmButton = wrapper.find('[data-test="confirm-delete-btn"]');
      await confirmButton.trigger('click');

      expect(store.deleteStudent).toHaveBeenCalledWith(mockStudents[0].id);
    });
  });

  describe('Class Management', () => {
    it('should display class form when add class button is clicked', async () => {
      const addButton = wrapper.find('[data-test="add-class-btn"]');
      expect(addButton.exists()).toBe(true);

      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('[data-test="class-form"]').exists()).toBe(true);
    });

    it('should validate class form inputs correctly', async () => {
      // Test with valid data
      const validClass = dataFactories.createClass();
      
      await wrapper.setData({
        newClass: validClass,
        showClassForm: true,
      });

      expect(wrapper.vm.isClassFormValid).toBe(true);

      // Test with invalid data
      const invalidClass = { ...validClass, name: '' };
      
      await wrapper.setData({
        newClass: invalidClass,
      });

      expect(wrapper.vm.isClassFormValid).toBe(false);
    });

    it('should add a new class successfully', async () => {
      const newClass = dataFactories.createClass({
        name: 'Advanced Physics',
        subject: 'Physics',
        teacher: 'Dr. Johnson',
      });

      await wrapper.setData({
        newClass,
        showClassForm: true,
      });

      const submitButton = wrapper.find('[data-test="submit-class-btn"]');
      await submitButton.trigger('click');

      expect(store.addClass).toHaveBeenCalledWith(newClass);
      expect(wrapper.vm.showClassForm).toBe(false);
    });

    it('should display existing classes in a grid layout', async () => {
      const mockClasses = dataFactories.createClasses(4);
      store.classes = mockClasses;

      await wrapper.vm.$nextTick();

      const classCards = wrapper.findAll('[data-test="class-card"]');
      expect(classCards).toHaveLength(4);

      // Verify first class details
      const firstClass = classCards[0];
      testUtils.assertContainsText(firstClass, mockClasses[0].name);
      testUtils.assertContainsText(firstClass, mockClasses[0].subject);
      testUtils.assertContainsText(firstClass, mockClasses[0].teacher);
    });
  });

  describe('Transaction Management', () => {
    it('should display transaction form when add transaction button is clicked', async () => {
      const addButton = wrapper.find('[data-test="add-transaction-btn"]');
      expect(addButton.exists()).toBe(true);

      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('[data-test="transaction-form"]').exists()).toBe(true);
    });

    it('should validate transaction form inputs correctly', async () => {
      // Test with valid data
      const validTransaction = dataFactories.createTransaction();
      
      await wrapper.setData({
        newTransaction: validTransaction,
        showTransactionForm: true,
      });

      expect(wrapper.vm.isTransactionFormValid).toBe(true);

      // Test with invalid data
      const invalidTransaction = { ...validTransaction, studentId: '' };
      
      await wrapper.setData({
        newTransaction: invalidTransaction,
      });

      expect(wrapper.vm.isTransactionFormValid).toBe(false);
    });

    it('should add a new transaction successfully', async () => {
      const newTransaction = dataFactories.createTransaction({
        type: 'attendance',
        status: 'present',
        date: new Date().toISOString(),
      });

      await wrapper.setData({
        newTransaction,
        showTransactionForm: true,
      });

      const submitButton = wrapper.find('[data-test="submit-transaction-btn"]');
      await submitButton.trigger('click');

      expect(store.addTransaction).toHaveBeenCalledWith(newTransaction);
      expect(wrapper.vm.showTransactionForm).toBe(false);
    });

    it('should display transactions in a table format', async () => {
      const mockTransactions = dataFactories.createTransactions(5);
      store.transactions = mockTransactions;

      await wrapper.vm.$nextTick();

      const transactionRows = wrapper.findAll('[data-test="transaction-row"]');
      expect(transactionRows).toHaveLength(5);

      // Verify first transaction details
      const firstTransaction = transactionRows[0];
      testUtils.assertContainsText(firstTransaction, mockTransactions[0].type);
      testUtils.assertContainsText(firstTransaction, mockTransactions[0].status);
    });

    it('should filter transactions by date range', async () => {
      const mockTransactions = dataFactories.createTransactions(10);
      store.transactions = mockTransactions;

      await wrapper.vm.$nextTick();

      // Set date filter
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      
      await wrapper.setData({
        dateFilter: { start: startDate, end: endDate },
      });

      await wrapper.vm.applyDateFilter();

      expect(wrapper.vm.filteredTransactions).toHaveLength(10);
    });
  });

  describe('Data Validation', () => {
    it('should validate student data according to business rules', () => {
      const validStudent = dataFactories.createStudent();
      expect(wrapper.vm.validateStudent(validStudent)).toBe(true);

      // Test invalid cases
      const invalidStudent = { ...validStudent, firstName: '' };
      expect(wrapper.vm.validateStudent(invalidStudent)).toBe(false);

      const tooLongName = { ...validStudent, firstName: 'A'.repeat(51) };
      expect(wrapper.vm.validateStudent(tooLongName)).toBe(false);
    });

    it('should validate class data according to business rules', () => {
      const validClass = dataFactories.createClass();
      expect(wrapper.vm.validateClass(validClass)).toBe(true);

      // Test invalid cases
      const invalidClass = { ...validClass, name: '' };
      expect(wrapper.vm.validateClass(invalidClass)).toBe(false);

      const invalidPeriod = { ...validClass, period: 0 };
      expect(wrapper.vm.validateClass(invalidPeriod)).toBe(false);
    });

    it('should validate transaction data according to business rules', () => {
      const validTransaction = dataFactories.createTransaction();
      expect(wrapper.vm.validateTransaction(validTransaction)).toBe(true);

      // Test invalid cases
      const invalidTransaction = { ...validTransaction, studentId: '' };
      expect(wrapper.vm.validateTransaction(invalidTransaction)).toBe(false);

      const invalidDate = { ...validTransaction, date: 'invalid-date' };
      expect(wrapper.vm.validateTransaction(invalidDate)).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should display error messages when store operations fail', async () => {
      // Mock store error
      store.addStudent.mockRejectedValue(new Error('Failed to add student'));

      const newStudent = dataFactories.createStudent();
      await wrapper.setData({
        newStudent,
        showStudentForm: true,
      });

      const submitButton = wrapper.find('[data-test="submit-student-btn"]');
      await submitButton.trigger('click');

      // Should display error message
      expect(wrapper.vm.error).toBe('Failed to add student');
      expect(wrapper.find('[data-test="error-message"]').exists()).toBe(true);
    });

    it('should clear errors when starting new operations', async () => {
      await wrapper.setData({ error: 'Previous error' });

      const addButton = wrapper.find('[data-test="add-student-btn"]');
      await addButton.trigger('click');

      expect(wrapper.vm.error).toBe('');
    });
  });

  describe('Loading States', () => {
    it('should show loading indicators during async operations', async () => {
      store.isLoading = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.find('[data-test="loading-spinner"]').exists()).toBe(true);
    });

    it('should disable form submission during loading', async () => {
      store.isLoading = true;
      await wrapper.vm.$nextTick();

      const submitButton = wrapper.find('[data-test="submit-student-btn"]');
      expect(submitButton.attributes('disabled')).toBeDefined();
    });
  });

  describe('Responsive Behavior', () => {
    it('should adapt layout for mobile devices', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      // Trigger resize event
      window.dispatchEvent(new Event('resize'));
      await wrapper.vm.$nextTick();

      // Should use mobile layout
      expect(wrapper.vm.isMobile).toBe(true);
      testUtils.assertHasClass(wrapper, 'mobile-layout');
    });

    it('should adapt layout for desktop devices', async () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      // Trigger resize event
      window.dispatchEvent(new Event('resize'));
      await wrapper.vm.$nextTick();

      // Should use desktop layout
      expect(wrapper.vm.isMobile).toBe(false);
      testUtils.assertHasClass(wrapper, 'desktop-layout');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const addStudentButton = wrapper.find('[data-test="add-student-btn"]');
      expect(addStudentButton.attributes('aria-label')).toBeDefined();

      const studentForm = wrapper.find('[data-test="student-form"]');
      if (studentForm.exists()) {
        expect(studentForm.attributes('aria-labelledby')).toBeDefined();
      }
    });

    it('should support keyboard navigation', async () => {
      const addButton = wrapper.find('[data-test="add-student-btn"]');
      
      // Test Enter key
      await addButton.trigger('keydown.enter');
      expect(wrapper.vm.showStudentForm).toBe(true);

      // Test Space key
      await wrapper.setData({ showStudentForm: false });
      await addButton.trigger('keydown.space');
      expect(wrapper.vm.showStudentForm).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', async () => {
      const largeStudentList = dataFactories.createStudents(1000);
      store.students = largeStudentList;

      const startTime = performance.now();
      await wrapper.vm.$nextTick();
      const endTime = performance.now();

      // Should render within reasonable time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should implement virtual scrolling for large lists', async () => {
      const largeTransactionList = dataFactories.createTransactions(1000);
      store.transactions = largeTransactionList;

      await wrapper.vm.$nextTick();

      // Should only render visible items
      const visibleRows = wrapper.findAll('[data-test="transaction-row"]');
      expect(visibleRows.length).toBeLessThan(1000);
    });
  });
});
