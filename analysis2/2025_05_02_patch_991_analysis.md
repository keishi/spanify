# Build Failure Analysis: 2025_05_02_patch_991

## First error

```
Overlapping replacements: ./services/device/public/cpp/test/fake_hid_manager.cc at offset 2552, length 21: ").subspan( sizeof(kResult) - 1)" and offset 2554, length 15: "(kResult.size() * sizeof(decltype(kResult)::value_type))"
```

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to apply two conflicting replacements at overlapping offsets. One replacement is generated from RewriteArraySizeof, while the other is from AppendDataCall. This usually means that the matcher is too broad, or there is a bug in the replacement logic that is causing it to generate overlapping replacements.

## Solution
The rewriter needs to be more careful in how it generates replacements, or the matcher is too broad. The generated code should be inspected to see what replacements were generated, and then either narrow the matcher or fix the replacement logic.

## Note
The overlapping replacements occur because kResult is being rewritten as a `std::string_view` and used to initialize a `std::vector<uint8_t>`. This triggers both the `RewriteArraySizeof` and `AppendDataCall` matchers, resulting in overlapping replacements.