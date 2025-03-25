# Build Failure Analysis: 2025_03_19_patch_133

## First error

../../net/base/file_stream_unittest.cc:81:5: error: no matching function for call to 'WriteFile'

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The rewriter arrayified `kTestData` which is being passed to `base::WriteFile`. The rewriter needs to add `.data()` when that variable is passed to a `base::WriteFile`.

## Solution
The rewriter should recognize this pattern and add .data().

## Note
There are multiple similar errors, but this classification focuses on the first one.