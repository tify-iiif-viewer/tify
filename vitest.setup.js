// Prevent canvas-related error in unit tests
// https://github.com/wobsoriano/vitest-canvas-mock
import 'vitest-canvas-mock';

// Prevent error "jest is not defined" when using vitest-canvas-mock
// https://github.com/vitest-dev/vitest/issues/2667#issuecomment-1383071037
import { vi } from 'vitest';

global.jest = vi;

// Prevent console.warn from polluting test output
vi.spyOn(console, 'warn').mockImplementation(() => {});
