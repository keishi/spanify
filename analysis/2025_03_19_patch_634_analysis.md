# Build Failure Analysis: 2025_03_19_patch_634

## First error

../../content/browser/content_index/content_index_database.cc:41:28: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
  41 |   return kIconPrefix.data().subspan(id);
      |          ~~~~~~~~~~~~~~~~~~^~~~~~~~

## Category
Rewriter failed to add .data() to a spanified return value.

## Reason
`kIconPrefix` was converted to `std::array`, so `kIconPrefix.data()` returns a span. The rewriter then failed to add `.data()` again when calling `.subspan()` because the return type of `.data()` is now a `span` instead of a `char*`.

## Solution
Add `.data()` when calling `.subspan()` on a spanified variable. So change this:

```c++
return kIconPrefix.data().subspan(id);
```

to

```c++
return kIconPrefix.data().subspan(id).data();
```

## Note
There is a second error which is related to the code using string literals when a `std::vector<std::string>` is expected.