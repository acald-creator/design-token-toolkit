# 2. ReScript Performance Optimization Strategy

Date: 2025-09-25

## Status

Accepted

## Context

Performance benchmarking of the design-token-toolkit revealed significant performance gains from ReScript implementations compared to JavaScript libraries, but also exposed critical issues in the colorjs.io bindings that are preventing full performance optimization.

### Benchmark Results
- ReScript Delta-E calculations are **6.96x faster** than colorjs.io (2.53ms vs 17.63ms for 1000 iterations)
- ReScript colorjs.io bindings are **1.5x faster** than direct colorjs.io calls
- OKLCH adjustment functions (`setOklchLightness`, `setOklchChroma`, `setOklchHue`) are failing with TypeError

### Current Architecture
The system uses a three-layer approach:
1. **Core ReScript layer** - High-performance color mathematics
2. **Integration layer** - Bridges ReScript and TypeScript/JavaScript
3. **Fallback layer** - JavaScript implementations for compatibility

## Decision

We will prioritize fixing the ReScript colorjs.io bindings while maintaining the fallback system for reliability. The architecture will follow these principles:

1. **Fix OKLCH Binding Issues First**
   - Correct the colorjs.io API usage in `ColorJsIo.res`
   - Ensure proper parameter passing for coordinate adjustments
   - Add comprehensive error handling

2. **Maintain Performance-First Approach**
   - Keep ReScript as the primary implementation for all color math
   - Use colorjs.io only for advanced color space operations not available in ReScript
   - Measure and document performance for all critical paths

3. **Implement Proper TypeScript Integration**
   - Create `Js.gen.ts` for ReScript built-in types
   - Ensure all `@genType` annotations are properly configured
   - Maintain type safety across the ReScript/TypeScript boundary

4. **Error Handling Strategy**
   - Silent fallback for production stability
   - Detailed logging in development mode
   - Performance metrics tracking for both ReScript and fallback paths

## Consequences

### Positive
- **7x performance improvement** for color calculations when ReScript path succeeds
- Type-safe integration between ReScript and TypeScript
- Reliable fallback ensures system stability
- Clear performance metrics for optimization tracking

### Negative
- Increased complexity from maintaining dual implementations
- Debugging overhead when ReScript bindings fail silently
- Additional maintenance burden for keeping bindings in sync with colorjs.io updates

### Risks
- colorjs.io API changes could break bindings
- Performance gains may be lost if fallback is triggered frequently
- TypeScript integration adds build complexity

## Technical Debt

1. **Immediate fixes needed**:
   - Fix OKLCH coordinate adjustment functions
   - Add `"type": "module"` to package.json
   - Improve error handling in ColorJsIo bindings

2. **Future improvements**:
   - Implement native ReScript OKLCH operations to eliminate colorjs.io dependency
   - Add performance monitoring dashboard
   - Create comprehensive binding tests

## Metrics for Success

- All ReScript functions execute without fallback in production
- Maintain >5x performance improvement over pure JavaScript
- Zero runtime errors from type mismatches
- 100% TypeScript compilation success with generated types

## References

- Benchmark results: `node dist/benchmarks/bridge.js`
- ReScript documentation: https://rescript-lang.org/
- colorjs.io API: https://colorjs.io/docs/