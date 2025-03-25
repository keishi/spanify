# Build Failure Analysis: 2025_03_19_patch_1476

## First error

../../gpu/command_buffer/service/context_state_unittest.cc:36:5: error: no matching member function for call to 'SetValues'

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified a function, but failed to spanify a call site. In this case, `Vec4::SetValues` was spanified, but the call sites in `context_state_unittest.cc` were not updated to pass a span.

```c++
  const GLfloat kFloatValues[4] = { 2.f, 3.f, 4.f, 5.f };
  v.SetValues(kFloatValues);
```

## Solution
The rewriter spanified a function, but failed to spanify a call site. This is likely due to the rewriter not being able to correctly identify the size of the array at the call site. The rewriter should be updated to handle this case by converting the C-style array to a `std::array` or `base::span` at the call site.

```c++
  const std::array<GLfloat, 4> kFloatValues = {2.f, 3.f, 4.f, 5.f};
  v.SetValues(kFloatValues);
```

## Note
There are multiple call sites in this file that were not correctly spanified. The solution must be applied to all of them.