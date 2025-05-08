# Build Failure Analysis: 2025_05_02_patch_396

## First error

../../components/sync_device_info/device_info_util.cc:60:26: error: member reference base type 'const char[]' is not a structure or union
   60 |   return kClientTagPrefix.data() + specifics.cache_guid();
      |          ~~~~~~~~~~~~~~~~^~~~~

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter incorrectly added `.data()` to `kClientTagPrefix`, which is a `const char[]` and not a spanified/arrayified variable. The `.data()` member is only valid for `std::string`, `std::string_view`, and similar container types. Applying it to a C-style string causes a compilation error. The rewriter likely misidentified this usage as requiring the `.data()` decay.

## Solution
The rewriter needs to avoid adding `.data()` to variables that were not rewritten to spans or arrays. It should specifically check the type of the variable before adding `.data()`. If the variable is a C-style array (e.g., `const char[]`), the rewriter should not add `.data()`.
```
const char DeviceInfoUtil::kClientTagPrefix[] = "DeviceInfo_"; // type is const char[]

const std::string_view kClientTagPrefix = "DeviceInfo_"; // this code must compile.
```

## Note
The same error occurs on line 66.
```
../../components/sync_device_info/device_info_util.cc:66:44: error: member reference base type 'const char[]' is not a structure or union
   66 |   return tag.substr(strlen(kClientTagPrefix.data()));
      |                            ~~~~~~~~~~~~~~~~^~~~~