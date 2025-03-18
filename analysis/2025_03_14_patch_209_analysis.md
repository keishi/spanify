# Build Failure Analysis: 2025_03_14_patch_209

## First error

../../components/omnibox/browser/history_quick_provider_performance_unittest.cc:65:37: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
  65 |   URLRow row{GURL(kPopularUrl.data().subspan(fake_hash))};
      |                   ~~~~~~~~~~~~~~~~~~^~~~~~~~

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The rewriter converted a `char[]` to `std::array<char, N>`.  The code then attempts to use `.subspan()` on the result of `.data()`.  This is valid as `.data()` returns a `char*`. However, the `GURL` constructor expects a `std::string` which requires calling `.data()` on the `std::array` variable.

## Solution
Add `.data()` after `kPopularUrl` so it constructs properly

```c++
URLRow row{GURL(kPopularUrl.data().subspan(fake_hash))};
```

should be

```c++
URLRow row{GURL(kPopularUrl.data().data().subspan(fake_hash))};
```