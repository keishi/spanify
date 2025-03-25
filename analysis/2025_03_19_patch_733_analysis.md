# Build Failure Analysis: 2025_03_19_patch_733

## First error

../../base/cpu.cc:248:43: error: member reference base type 'int[4]' is not a structure or union
  248 |   static_assert(kParameterSize * (cpu_info.size() *
      |                                   ~~~~~~~~^~~~~

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The function `__cpuidex` and `__cpuid` were spanified. The original code used C-style arrays. And `static_assert` uses `cpu_info.size()`. But `cpu_info` is a C-style array, and shouldn't have `.size()` member. Likely static_assert is code that was not meant to be spanified.

## Solution
The rewriter should not spanify `__cpuidex` and `__cpuid` because this function calls static_assert which will cause errors. The rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Note
There was a second error:
```
../../base/cpu.cc:249:42: error: 'decltype(cpu_info)' (aka 'int[4]') is not a class, namespace, or enumeration
  249 |                                   sizeof(decltype(cpu_info)::value_type)) ==
      |                                          ^
```