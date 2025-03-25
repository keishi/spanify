# Build Failure Analysis: 2025_03_19_patch_1753

## First error

Overlapping replacements: ./device/bluetooth/floss/floss_adapter_client_unittest.cc at offset 43259, length 18: "(kFakeBytes.size() * sizeof(decltype(kFakeBytes)::value_type))" and offset 43265, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to both rewrite the `sizeof` expression and add `.data()` to the array. These replacements overlap, resulting in the error. The overlapping replacements are happening because the rewriter first converted `kFakeBytes` to a `std::array`, and then it's trying to add `.data()` to the variable where it is used in `sizeof`.

## Solution
Prevent the rewriter from generating both of these replacements when they conflict. Priority should be given to replacing the `sizeof` expression.

## Note
There are other overlapping replacements further down in the file.