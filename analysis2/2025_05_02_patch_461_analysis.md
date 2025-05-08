```
# Build Failure Analysis: 2025_05_02_patch_461

## First error

```
../../base/cpu.cc:248:43: error: member reference base type 'int[4]' is not a structure or union
  248 |   static_assert(kParameterSize * (cpu_info.size() *
      |                                   ~~~~~~~~^~~~~
```

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter has converted the parameters of `__cpuid` and `__cpuidex` to spans. However, the `cpu_info` variable in `CPU::Initialize` is still a C-style array. The code `cpu_info.size()` is therefore invalid because C-style arrays do not have a `.size()` member function. The rewriter shouldn't have modified the code inside the `static_assert` to access `cpu_info.size()` since the variable itself was not arrayified.

## Solution
The rewriter should not modify the code inside the `static_assert`.