# Build Failure Analysis: 2025_03_14_patch_1682

## First error

../../ui/linux/linux_ui.cc:100:52: error: invalid operands to binary expression ('value_type *' (aka 'char *') and 'base::span<char>')
  100 |     snprintf(dst.data(), &cmd_line.args.back() + 1 - dst, "%s", arg.c_str());
      |                          ~~~~~~~~~~~~~~~~~~~~~~~~~ ^ ~~~

## Category
Rewriter needs to handle address of a spanified variable passed into a function.

## Reason
The code calculates the remaining size of a buffer using pointer arithmetic. But after the rewriter replaces `char* dst` with `base::span<char> dst`, the expression `&cmd_line.args.back() + 1 - dst` becomes invalid since it's trying to subtract a span from a pointer. The rewriter failed to account for this use case.

## Solution
The rewriter needs to account for this pattern and generate the proper code to calculate remaining size. The rewriter could have generated:

```c++
snprintf(dst.data(), dst.size(), "%s", arg.c_str());
```

This would require that the `snprintf` call was spanified to take a span instead of a pointer, which isn't the case here. Alternatively, it could use `std::distance` to calculate the distance, since it works on ranges:

```c++
snprintf(dst.data(), std::distance(dst.begin(), &cmd_line.args.back() + 1), "%s", arg.c_str());
```

The best solution would be to use `dst.size()`, which is more readable.

## Note
This issue highlights a general problem: spanifying code that relies on pointer arithmetic is risky and can easily lead to compile errors.