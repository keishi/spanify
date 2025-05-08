```
# Build Failure Analysis: 2025_05_02_patch_617

## First error

```
../../components/gcm_driver/crypto/encryption_header_parsers_unittest.cc:226:27: error: no matching function for call to 'to_array'
  226 |   auto expected_results = std::to_array<ExpectedResults>({
      |                           ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../third_party/libc++/src/include/array:543:1: note: candidate function [with _Tp = ExpectedResults, _Size = 4] not viable: cannot convert initializer list argument to 'ExpectedResults'
  543 | to_array(_Tp (&__arr)[_Size]) noexcept(is_nothrow_constructible_v<_Tp, _Tp&>) {
```

## Category
Rewriter needs to rewrite `std::to_array` when the inner type has changed, but failed.

## Reason
The code uses `std::to_array` to create an array. The rewriter has changed the member `parsed_values` of `ExpectedResults` from an array to a `std::array`. But the rewriter failed to modify the `std::to_array` call to account for the change in the `parsed_values` member. The parameter being passed to `std::to_array` is an initializer list that expects an array of `ExpectedResults`, but it is receiving a list of `ExpectedResults` where that member is a `std::array`.

## Solution
When rewriting a member from array to `std::array` the rewriter must change any calls to `std::to_array` to account for the nested structure. In this case `ParsedValues` was originally
```c++
    struct {
      const char* const keyid;
      const char* const aesgcm128;
      const char* const dh;
    } parsed_values[kNumberOfValues];
```
which was changed to
```c++
    struct ParsedValues {
      const char* const keyid;
      const char* const aesgcm128;
      const char* const dh;
    };
    std::array<ParsedValues, kNumberOfValues> parsed_values;
```
To resolve this it is possible that a direct initialization is required:
```c++
    auto expected_results = std::array<ExpectedResults,SIZE>{
        ExpectedResults{...},
        ExpectedResults{...},
    };
```

## Note
N/A