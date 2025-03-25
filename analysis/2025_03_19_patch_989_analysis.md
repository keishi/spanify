# Build Failure Analysis: 2025_03_19_patch_989

## First error

../../components/viz/common/quads/render_pass_io.cc:633:23: error: no matching function for call to 'FloatArrayFromList'
  633 |       if (!matrix || !FloatArrayFromList(*matrix, 20u, &mat[0]))
      |                       ^~~~~~~~~~~~~~~~~~

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `FloatArrayFromList` was spanified, but the call site is passing a raw pointer `&mat[0]` where the size is not available. This seems to be a bug with the rewriter where it failed to recognize a size info unavailable rhs value.

## Solution
The rewriter should recognize and be able to spanify this call site.

## Note
There are two errors that both have the same root cause.