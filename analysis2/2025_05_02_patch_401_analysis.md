# Build Failure Analysis: 2025_05_02_patch_401

## First error

../../chrome/browser/themes/browser_theme_pack.h:359:24: error: no viable conversion from 'std::nullptr_t' to 'base::raw_span<SourceImage, DanglingUntriaged | AllowPtrArithmetic>' (aka 'span<SourceImage, dynamic_extent, raw_ptr<SourceImage, (RawPtrTraits)9U | AllowPtrArithmetic>>')
  359 |       source_images_ = nullptr;
      |                        ^~~~~~~

## Category
Rewriter needs to nullptr initialization of spanified member field to {}.

## Reason
The rewriter converted `source_images_` from `raw_ptr<SourceImage>` to `raw_span<SourceImage>`. `nullptr` is not implicitly convertible to `base::span`. The correct way to initialize it is with `{}`.

## Solution
Change the rewriter to initialize spanified member fields to `{}` instead of `nullptr`.
```c++
  base::raw_span<SourceImage, DanglingUntriaged | AllowPtrArithmetic>
      source_images_ = {};
```

## Note
```