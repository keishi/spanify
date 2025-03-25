```
# Build Failure Analysis: 2025_03_19_patch_224

## First error

../../base/files/file_unittest.cc:628:42: error: invalid operands to binary expression ('const std::string_view' (aka 'const basic_string_view<char>') and 'int')
  628 |             file.WriteAtCurrentPos(kData + first_chunk_size,
      |                                    ~~~~~ ^ ~~~~~~~~~~~~~~~~

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter has made a mistake, where it has converted the first parameter of `file.WriteAtCurrentPos` to `span<char>`. But the intent of the tool is to *avoid* spanifying code in `third_party/` or similar. `file.WriteAtCurrentPos`'s first parameter should still take a raw `char*`.

## Solution
The rewriter should avoid spanifying `file.WriteAtCurrentPos`.

## Note
The other error in the log is:

```
../../base/files/file_unittest.cc:631:15: error: variable length arrays in C++ are a Clang extension [-Werror,-Wvla-cxx-extension]
  631 |   char buffer[kDataSize];
      |               ^~~~~~~~~
../../base/files/file_unittest.cc:631:15: note: initializer of 'kDataSize' is not a constant expression
../../base/files/file_unittest.cc:621:13: note: declared here
  621 |   const int kDataSize =
      |             ^
```

This error is a result of this change

```
-  const char kData[] = "test";
-  const int kDataSize = sizeof(kData) - 1;
+  const std::string_view kData = "test";
+  const int kDataSize =
+      (kData.size() * sizeof(decltype(kData)::value_type)) - 1;
```

`sizeof(kData)` can be evaluated at compile time if `kData` is a C-style array. However, if `kData` is a `std::string_view`, `kData.size()` can only be evaluated at runtime. Thus we are declaring a variable length array, which is not valid C++.