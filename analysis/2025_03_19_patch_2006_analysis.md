# Build Failure Analysis: 2025_03_19_patch_2006

## First error

../../media/cdm/aes_decryptor_unittest.cc:692:43: error: invalid operands to binary expression ('const std::string_view' (aka 'const basic_string_view<char>') and 'decltype(__c.size())' (aka 'unsigned long'))

## Category
Rewriter needs to handle string_view passed with size to `std::vector`.

## Reason
The original code used a `uint8_t` array to initialize a `std::vector<uint8_t>`. The rewriter changed this to use `std::string_view`. The test `AesDecryptorTest.MultipleKeysAndFrames` then attempted to construct a vector from `kOriginalData2.data()` and `kOriginalData2 + std::size(kOriginalData2) - 1`. `std::size` is calculating bytes, but the `+` operator is working with the string view type and not an iterator.

## Solution
The rewriter should check for `std::string_view` and use `.length()` rather than `std::size()` to calculate the size.

```c++
-      std::vector<uint8_t>(kOriginalData2.data(),
+      std::vector<uint8_t>(kOriginalData2.data(),
                            kOriginalData2 + std::size(kOriginalData2) - 1),
```

should be:

```c++
-      std::vector<uint8_t>(kOriginalData2.data(),
+      std::vector<uint8_t>(kOriginalData2.data(),
                            kOriginalData2.data() + kOriginalData2.length()),
```

## Note
The diff introduced a compilation error by replacing a `uint8_t` array with a `std::string_view`, but the code constructing the vector was still using the array size not the new length.