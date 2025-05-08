# Build Failure Analysis: 2025_05_02_patch_476

## First error

../../url/url_util.cc:82:45: error: no matching constructor for initialization of 'std::vector<std::string>' (aka 'vector<basic_string<char>>')
   82 |   std::vector<std::string> secure_schemes = {
      |                                             ^
   83 |       kHttpsScheme,

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter incorrectly changed `url::kDataScheme` from a `const char*` to `std::array<char, 5>`. This caused the `std::vector<std::string>` initialization to fail since it was expecting a `std::string` or a `const char*` that can be implicitly converted to a `std::string`, but got a `std::array<char, 5>`. The rewriter should not be modifying unrelated code.

## Solution
The rewriter should avoid adding `.data()` to `url::kDataScheme` since it is not a spanified variable. This is likely a bug in the rewriter's logic for identifying variables that need to be spanified.

## Note
The error occurs because the rewriter incorrectly modifies the type of `url::kDataScheme` to `std::array<char, 5>` without making corresponding changes to the vector initialization. The vector initialization expects strings that can be implicitly constructed from `const char*`, not `std::array<char, 5>`.