# Build Failure Analysis: 2025_03_19_patch_1038

## First error

../../components/safe_browsing/core/browser/hashprefix_realtime/ohttp_key_service_unittest.cc:95:45: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
   95 |     return kExpectedKeyFetchServerUrl.data().subspan(key_param_);
      |            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The rewriter is converting a C-style array `char[]` to `std::array`, and is properly adding `.data()` to the variable. But when a `subspan` is called on the result, it expects that the return value should also add `.data()` at the end when used as a return statement.

## Solution
The rewriter needs to add `.data()` to the end of the `subspan` call so the return type will be `char*`.

For example, the following code:

```c++
return kExpectedKeyFetchServerUrl.data().subspan(key_param_);
```

should be rewritten to:

```c++
return kExpectedKeyFetchServerUrl.data().subspan(key_param_).data();