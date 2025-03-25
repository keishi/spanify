# Build Failure Analysis: 2025_03_19_patch_1635

## First error

../../mojo/public/c/system/tests/core_api_unittest.cc:115:38: error: no viable conversion from 'MojoHandleSignals *' (aka 'unsigned int *') to 'base::span<const MojoHandleSignals>' (aka 'span<const unsigned int>')
  115 |             mojo::WaitMany(&handle0, &sig, 1, &result_index, states));
      |                                      ^~~~

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `mojo::WaitMany` was spanified. However, the rewriter failed to recognize a call site passing a raw pointer. The size of the pointed-to memory is known from `1`, so the compiler is expecting that an explicit conversion from `MojoHandleSignals*` to span can be performed.

## Solution
The rewriter needs to recognize size info available rhs value in this case. Insert code to convert raw pointer into base::span.

```
-    MojoResult rv = WaitMany(wh.data(), sigs.data(), wh.size(), &result_index);
+    MojoResult rv = WaitMany(wh.data(), base::span<const MojoHandleSignals>(sigs.data(), sigs.size()), wh.size(), &result_index);