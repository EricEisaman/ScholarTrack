# Vitest Testing Guide for ScholarTrack

## Overview
This guide covers rigorous testing practices using Vitest with proper Vuetify integration for the ScholarTrack application.

## Key Testing Principles

### 1. Test Structure
- Use descriptive test names that explain the expected behavior
- Group related tests using `describe` blocks
- Test one specific behavior per test case
- Use `beforeEach` and `afterEach` for setup/cleanup

### 2. Component Testing with Vuetify
- Always use `mountWithVuetify` utility for consistent Vuetify setup
- Test component rendering, user interactions, and state changes
- Verify Vuetify component props and events
- Test responsive behavior and accessibility

### 3. Store Testing
- Mock Pinia stores using `createMockStore` utility
- Test store actions, mutations, and computed properties
- Verify store state changes and side effects
- Test error handling and loading states

### 4. Async Testing
- Use `await` for async operations
- Test loading states and error handling
- Use `flushPromises` for complex async scenarios
- Test user interactions that trigger async operations

## Testing Utilities

### Core Utilities
- `mountWithVuetify`: Enhanced mount function with Vuetify setup
- `createMockStore`: Create mock Pinia stores
- `testUtils`: Common assertion helpers
- `dataFactories`: Test data generators

### Mock Utilities
- `mockFetch`: Mock API responses
- `mockLocalStorage`: Mock browser storage
- `mockIntersectionObserver`: Mock intersection observer
- `mockResizeObserver`: Mock resize observer

### Test Data
- `TEST_DATA`: Predefined test data constants
- `mockGenerators`: Random data generators
- `assertionHelpers`: Validation helpers

## Example Test Patterns

### Component Mounting
```typescript
import { mountWithVuetify } from '@/test/utils';

const wrapper = mountWithVuetify(ComponentName, {
  props: { initialData: 'test' },
  global: {
    mocks: { $router: mockRouter }
  }
});
```

### Store Mocking
```typescript
import { createMockStore } from '@/test/utils';

const store = createMockStore({
  students: [],
  addStudent: vi.fn().mockResolvedValue({ success: true })
});
```

### User Interaction Testing
```typescript
// Click button
await wrapper.find('[data-test="submit-btn"]').trigger('click');

// Fill form
await wrapper.setData({ formData: { name: 'Test' } });

// Wait for updates
await wrapper.vm.$nextTick();
```

### Async Operation Testing
```typescript
// Test loading state
expect(wrapper.find('[data-test="loading"]').exists()).toBe(true);

// Wait for operation to complete
await wrapper.vm.submitForm();

// Verify success state
expect(wrapper.find('[data-test="success"]').exists()).toBe(true);
```

## Best Practices

### 1. Test Organization
- Group tests by functionality
- Use descriptive test names
- Keep tests focused and isolated
- Use data-test attributes for element selection

### 2. Mocking Strategy
- Mock external dependencies (API, storage, etc.)
- Use realistic mock data
- Avoid over-mocking
- Test error scenarios with mocks

### 3. Assertions
- Use specific assertions
- Test both positive and negative cases
- Verify component state and UI updates
- Test edge cases and error conditions

### 4. Performance
- Test with realistic data sizes
- Verify efficient rendering
- Test virtual scrolling for large lists
- Monitor test execution time

## Common Test Scenarios

### Form Testing
- Input validation
- Form submission
- Error handling
- Success feedback

### List/Table Testing
- Data rendering
- Pagination
- Sorting/filtering
- Empty states

### Modal/Dialog Testing
- Open/close behavior
- Content rendering
- User interactions
- Accessibility

### Responsive Testing
- Mobile vs desktop layouts
- Viewport changes
- Touch interactions
- Screen reader support

## Running Tests

### Commands
```bash
# Run all tests
npm run test:run

# Run with coverage
npm run test:coverage

# Run specific test files
npm run test:unit

# Watch mode for development
npm run test:watch

# CI mode with coverage reports
npm run test:ci
```

### Coverage Goals
- Minimum 80% coverage for all metrics
- Focus on critical business logic
- Test error handling paths
- Cover user interaction flows

## Debugging Tests

### Common Issues
- Async timing problems
- Component not mounting
- Vuetify components not rendering
- Store mocks not working

### Debug Commands
```bash
# Verbose output
npm run test:debug

# Run specific test
npm run test:run -- --reporter=verbose

# Debug specific file
npm run test:run -- src/components/ComponentName.test.ts
```

## Integration with CI/CD

### Coverage Reports
- Generate HTML coverage reports
- Upload to coverage services
- Enforce coverage thresholds
- Track coverage trends

### Test Parallelization
- Run tests in parallel
- Optimize test execution time
- Handle test isolation
- Manage shared resources

## Resources

### Documentation
- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Vuetify Testing](https://vuetifyjs.com/en/getting-started/testing/)

### Testing Patterns
- Component testing strategies
- Store testing approaches
- Async testing patterns
- Mock data strategies
