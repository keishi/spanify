# Build Failure Analysis: 2025_03_19_patch_915

## First error

../../mojo/public/cpp/test_support/lib/test_support.cc:21:21: error: no viable conversion from 'char **' to 'base::span<char *>'
   21 |   base::span<char*> names = MojoTestSupportEnumerateSourceRootRelativeDirectory(
      |                     ^       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   22 |       relative_path.c_str());

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `MojoTestSupportEnumerateSourceRootRelativeDirectory` returns a raw pointer `char**`.  The rewriter is attempting to assign the result directly to a `base::span<char*>`, but there is no information available to deduce the size of the span.

## Solution
The rewriter needs to handle cases where a size info unavailable value is passed into span.

## Note
The second error `cannot increment value of type 'base::span<char *>'` is a consequence of the first error. It happens because the code expects an incrementable `char**` but gets a non-incrementable `base::span<char*>`.