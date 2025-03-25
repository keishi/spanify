# Build Failure Analysis: 2025_03_19_patch_842

## First error

../../net/dns/dns_query_unittest.cc:179:40: error: no matching function for call to 'ElementsAreArray'
  179 |   EXPECT_THAT(AsTuple(q1.io_buffer()), ElementsAreArray(query_data.data()));
      |                                        ^~~~~~~~~~~~~~~~

## Category
Rewriter needs to handle `.data()` on arrayified `char[]` variable used with gmock `ElementsAreArray`.

## Reason
The rewriter converted a C-style array `query_data` to `std::array`, but `gmock::ElementsAreArray` has multiple overloads and the overload that takes `.data()` is not being selected.

## Solution
Add `.data()` when passing arrayified `char[]` variable to `gmock::ElementsAreArray`.

## Note
The second error is due to `reinterpret_cast` applied to `std::array` which should be fixed at the same time.