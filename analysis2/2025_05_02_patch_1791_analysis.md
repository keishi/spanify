# Build Failure Analysis: 2025_05_02_patch_1791

## First error

```
../../net/dns/dns_query_unittest.cc:179:40: error: no matching function for call to 'ElementsAreArray'
  179 |   EXPECT_THAT(AsTuple(q1.io_buffer()), ElementsAreArray(query_data.data()));
      |                                        ^~~~~~~~~~~~~~~~
```

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted `query_data` to `std::array`, but `ElementsAreArray` from googletest expects a C-style array. The rewriter should have added `.data()` when passing the converted `std::array` to `ElementsAreArray`.

## Solution
The rewriter should add `.data()` to the converted `std::array` when passed to `ElementsAreArray` in `EXPECT_THAT`.

## Note
The second error is:
```
../../net/dns/dns_query_unittest.cc:182:33: error: reinterpret_cast from 'const array<remove_cv_t<unsigned char>, 52UL>' (aka 'const array<unsigned char, 52UL>') to 'const char *' is not allowed
  182 |       base::span<const uint8_t>(reinterpret_cast<const char*>(query_data))
      |                                 ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```
The rewriter needs to avoid using reinterpret_cast on spanified variable. The rewriter converted `query_data` to `std::array`. The rewriter should also update `reinterpret_cast<const char*>(query_data)` to `reinterpret_cast<const char*>(query_data.data())`.