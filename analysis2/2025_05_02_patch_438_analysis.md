# Build Failure Analysis: 2025_05_02_patch_438

## First error

```
Overlapping replacements: ./remoting/protocol/auth_util.cc at offset 1239, length 17: "(out_bytes.size() * sizeof(decltype(out_bytes)::value_type))" and offset 1245, length 0: ".data()"
```

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to add `.data()` to the `out_bytes` variable, but it is also generating code to calculate the size of the array. The `.data()` replacement is overlapping with the replacement to calculate the array size.

## Solution
The rewriter needs to avoid generating overlapping replacements. It should either calculate the array size before adding `.data()`, or it should add `.data()` before calculating the array size.

## Note
None