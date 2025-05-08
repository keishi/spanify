# Build Failure Analysis: 2025_05_02_patch_1327

## First error

```
../../gpu/command_buffer/common/gles2_cmd_utils.cc:1554:69: error: invalid operands to binary expression ('base::span<const EnumToString>' and 'const EnumToString *')
```

## Category
Rewriter failed to properly rewrite code using span.

## Reason
The rewriter attempted to use `base::span` in a way that is incompatible with the existing code. Specifically, it changed a raw pointer `EnumToString* table` to a `base::span<const EnumToString> table`, but then it didn't update the code that iterates through the table correctly. The loop condition `table < end` is no longer valid because `table` is now a `span` and `end` is still a raw pointer. Further, the original code uses `table->value` to access the members of the struct, which is incorrect when table is a span.

## Solution
The rewriter needs to generate correct span iteration code. The original code:

```c++
std::string GLES2Util::GetQualifiedEnumString(const EnumToString* table,
                                              size_t count,
                                              uint32_t value) {
  for (const EnumToString* end = table + count; table < end; ++table) {
    if (table->value == value) {
      return table->name;
    }
```

should be rewritten as:

```c++
std::string GLES2Util::GetQualifiedEnumString(base::span<const EnumToString> table,
                                              size_t count,
                                              uint32_t value) {
  for (size_t i = 0; i < table.size(); ++i) {
    if (table[i].value == value) {
      return table[i].name;
    }
```

Or as a range-based for loop:

```c++
std::string GLES2Util::GetQualifiedEnumString(base::span<const EnumToString> table,
                                              size_t count,
                                              uint32_t value) {
  for (const auto& entry : table) {
    if (entry.value == value) {
      return entry.name;
    }
```

## Note
The other errors are consequences of the first error. The rewriter should ideally replace the `count` parameter with `table.size()`. The lines where the function is called (e.g. `return GLES2Util::GetQualifiedEnumString(nullptr, 0, value);`) should have also been rewritten.