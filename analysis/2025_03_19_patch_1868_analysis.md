# Build Failure Analysis: 2025_03_19_patch_1868

## First error

../../chrome/browser/themes/browser_theme_pack_unittest.cc:501:28: error: out-of-line definition of 'VerifyCalculatedColorContrast' does not match any declaration in 'BrowserThemePackTest'

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified a function, but failed to spanify a call site. The function declaration in the header file has not been updated to reflect the changes in the function definition in the cc file.

## Solution
The rewriter should update the declaration in the header file along with definition in the cc file when spanifying a function.
For example, change the header file to
```c++
 static void VerifyCalculatedColorContrast(base::span<const SkColor> colors,
                                                         int colors_num,
                                                         float contrast_ratio);
```

## Note
The first error is clear enough. The next error messages are likely to be caused by the first error.