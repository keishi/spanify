```
# Build Failure Analysis: 2025_03_14_patch_384

## First error

../../third_party/blink/renderer/platform/fonts/script_run_iterator_test.cc:52:5: error: call to implicitly-deleted default constructor of 'WTF::StaticSingleton<const MockScriptData>::WrapperType' (aka 'const blink::MockScriptData')

## Category
Rewriter needs to nullptr initialization of spanified member field to {}.

## Reason
The code defines a `MockScriptData` class with a `kTable` member, which is a `const std::array<int, 16>`. The rewriter converted the raw array `kTable` to a `std::array`, but the default constructor of `MockScriptData` is implicitly deleted because it cannot initialize the `const` member `kTable`. This is happening inside a `DEFINE_THREAD_SAFE_STATIC_LOCAL` macro.

## Solution
The rewriter needs to change the definition of the member field to initialize `kTable` to `{}` in the class definition. This will allow the implicit construction in the DEFINE_THREAD_SAFE_STATIC_LOCAL to succeed.

```c++
  const std::array<int, 16> kTable{};
```

## Note
Other errors are related to `kTable` also needing to be initialized inside the class definition. The rewriter has also attempted to rewrite code outside of third_party to use `std::array`. This is incorrect.