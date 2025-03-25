# Build Failure Analysis: 2025_03_19_patch_1595

## First error

../../third_party/blink/renderer/core/svg/svg_point_list.cc:75:12: error: no matching member function for call to 'Parse'
  75 |     return Parse(chars.data(), chars.data() + chars.size());
      |            ^~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the `Parse` function to take a `base::span` as its first argument. However, the rewriter didn't update the call site at `svg_point_list.cc:75`. The code is still passing a raw pointer `chars.data()` and an end pointer `chars.data() + chars.size()`.

## Solution
The rewriter needs to recognize when a function has been spanified and update call sites accordingly. In this case, the rewriter should have changed the code to pass `chars` directly to the `Parse` function, like this:

```c++
return Parse(chars, chars.data() + chars.size());
```

Ideally the logic should add an if statement to handle other cases.

```c++
if (function_is_spanified) {
  return Parse(chars, chars.data() + chars.size());
} else {
  return Parse(chars.data(), chars.data() + chars.size());
}
```

This is a better rewrite so that we are passing a full span in to Parse, and the generated call matches the signature.

## Note
No other errors were seen.