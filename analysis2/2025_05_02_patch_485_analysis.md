# Build Failure Analysis: 2025_05_02_patch_485

## First error

Overlapping replacements: ./components/services/filesystem/directory_impl_unittest.cc at offset 10085, length 15: ".subspan( strlen(kData))" and offset 10099, length 0: ".data()"

## Category
Conflict between ".data()" and ".subspan()" replacements.

## Reason
The rewriter is attempting to add both `.data()` and `.subspan()` to the same expression, resulting in overlapping replacements. The original code was using `kData` (now a `std::array`) to initialize a `std::vector<uint8_t>` named `data`. The rewriter incorrectly added both `.data()` and attempts to call `strlen` on the spanified value.

The corrected code initializes the `data` vector using the `.data()` method to get the raw pointer, but the subspan calculation is incorrect, causing the overlapping replacements due to attempts to also rewrite `strlen(kData)`. The `strlen` function expects a `const char*`, which `.data()` provides, but the subspan is redundant.

## Solution
The rewriter needs to avoid applying both `.data()` and `.subspan()` when a `std::array` is used in this way. The `strlen()` function is likely the cause of the issue since it is not compatible with a span. The rewriter should be updated to identify cases like these, since the vector initialization already copies the relevant parts of the data.

The line in question is:
`std::vector<uint8_t> data(kData.data(), kData + strlen(kData.data()));`
should become
`std::vector<uint8_t> data(kData.data(), kData.data() + kData.size());`

## Note
The overlapping replacements suggest the rewriter is not correctly handling the interaction between the conversion to `std::array` and subsequent usage in `std::vector` initialization.