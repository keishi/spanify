# Build Failure Analysis: 2025_03_19_patch_1002

## First error

../../media/parsers/jpeg_parser.cc:277:14: error: use of undeclared identifier 'code_value'

## Category
Rewriter failed to add .data() to arrayified `char[]` variable used with std::string.

## Reason
In `media/parsers/jpeg_parser.cc`, the rewriter converted `uint8_t code_value[162]` to `std::array<uint8_t, 162> code_value;`. However, the expression `sizeof(table->code_value)` became `(code_value.size() * sizeof(decltype(code_value)::value_type))` which caused a compilation error because `code_value` is not in scope. The correct variable is `table->code_value`, which is accessible in the current scope.

## Solution
The rewriter should be modified to correctly use `table->code_value` in the `InRange` check.

## Note
The original code:
```c++
if (!InRange(count, 0u, sizeof(table->code_value)))
```

The broken code after spanification:
```c++
if (!InRange(
            count, 0u,
            (code_value.size() * sizeof(decltype(code_value)::value_type))))
```

The corrected code:
```c++
if (!InRange(
            count, 0u,
            (table->code_value.size() * sizeof(decltype(table->code_value)::value_type))))