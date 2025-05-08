# Build Failure Analysis: 2025_05_02_patch_1809

## First error

Overlapping replacements: ./chrome/common/net/x509_certificate_model_unittest.cc at offset 13956, length 18: "(kExtension.size() * sizeof(decltype(kExtension)::value_type))" and offset 13962, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to add both `.data()` and `(kExtension.size() * sizeof(decltype(kExtension)::value_type))` to the same expression. This is likely due to the rewriter first identifying the need to calculate the size of the array and then, in a separate step, identifying the need to add `.data()` when passing the array to the `std::string` constructor.

## Solution
The rewriter needs to be aware of the potential for overlapping replacements and avoid generating code that conflicts. The fix depends on the desired outcome. One possible fix is to add the `.data()` call before the calculation of the array size. Another option is to prevent `RewriteArraySizeof` from running in the same location as `AppendDataCall`.

## Note
The overlapping replacements logic is complex and will need to be carefully addressed to ensure that all cases are handled correctly.