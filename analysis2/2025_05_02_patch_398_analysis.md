# Build Failure Analysis: 2025_05_02_patch_398

## First error

../../chrome/browser/themes/browser_theme_pack.h:344:7: error: no viable conversion from 'std::nullptr_t' to 'base::raw_span<ColorPair, DanglingUntriaged | AllowPtrArithmetic>' (aka 'span<ColorPair, dynamic_extent, raw_ptr<ColorPair, (RawPtrTraits)9U | AllowPtrArithmetic>>')

## Category
Rewriter needs to nullptr initialization of spanified member field to {}.

## Reason
The rewriter converted a raw pointer member field to `base::raw_span`, but it initialized to `nullptr` in the class definition.
```c++
  base::raw_span<ColorPair, DanglingUntriaged | AllowPtrArithmetic> colors_ =
      nullptr;
```

This is invalid because `base::raw_span` cannot be directly initialized with `nullptr`.

## Solution
The rewriter needs to replace `nullptr` initialization of spanified member fields with `{}`.

```c++
  base::raw_span<ColorPair, DanglingUntriaged | AllowPtrArithmetic> colors_ = {};
```

## Note
The rewriter should be updated to handle this case.