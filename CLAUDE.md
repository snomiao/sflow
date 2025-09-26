# sflow Development Guide for Claude

## Project Overview
sflow is a TypeScript library for stream processing based on WebStreams API, providing functional programming utilities for stream manipulation.

## Key Commands

### Development
```bash
# Install dependencies
bun install

# Run tests
bun test

# Type checking
bunx tsc --incremental --noEmit

# Lint (if available)
npm run lint

# Build
npm run build
```

### Testing
- Test files are located in the test directory
- Tests use bun's built-in test runner
- Run specific test: `bun test <filename>`

## Project Structure
- `src/` - Source code files
- `test/` - Test files
- `dist/` - Built output (generated)
- Main entry: `src/sflow.ts`

## Common Issues & Solutions

### TypeScript Errors
When fixing TypeScript errors:
1. Check for strict null checks
2. Add appropriate type assertions or non-null assertions where safe
3. Ensure all changes pass: `bunx tsc --incremental --noEmit`

### Stream Processing
- Core concept: All operations are based on ReadableStream/TransformStream
- Use `sflow()` to wrap data sources
- Chain operations using method calls
- End chains with terminal operations like `.toArray()` or `.reduce()`

## Code Conventions
- Use TypeScript strict mode
- Prefer functional programming patterns
- Keep functions pure when possible
- Export both individual utilities and main sflow function
- Use descriptive variable names

## Important Files
- `src/sflow.ts` - Main sflow class and exports
- `src/mergeStream.ts` - Stream merging utilities
- `src/mergeAscends.ts` - Ordered stream merging
- `src/rangeStream.ts` - Range generation utilities
- `src/mergeStreamsBy.ts` - Custom merge strategies

## Git Workflow
1. Make changes
2. Test: `bun test`
3. Type check: `bunx tsc --incremental --noEmit`
4. Commit with descriptive messages
5. Push to main branch

## Dependencies
- Main runtime: WebStreams API (native)
- Development: TypeScript, Bun
- No major external dependencies for core functionality

## Performance Considerations
- Use lazy evaluation where possible
- Minimize intermediate stream creations
- Consider backpressure in stream pipelines
- Use appropriate buffer sizes for chunks