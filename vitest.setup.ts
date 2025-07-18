import { vi } from 'vitest'

globalThis.jest = vi as unknown as typeof jest // patch for jest globals in vitest