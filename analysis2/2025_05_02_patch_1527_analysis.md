# Build Failure Analysis: 2025_05_02_patch_1527

## First error

../../components/sessions/core/session_command.h:54:40: error: no viable conversion from returned value of type 'char *' to function return type 'base::span<char>'

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter is trying to change the return type of `SessionCommand::contents()` to `base::span<char>`. However, this change is causing a compilation error because the original return type was `char*`. The error message "no viable conversion from returned value of type 'char *' to function return type 'base::span<char>'" indicates that the rewriter changed the return type of `contents()` in `SessionCommand` to `base::span<char>`, which isn't compatible with the existing code. The problem is that `content_` is `std::string`, and `std::string::c_str()` returns `const char*`. In the next iteration of the rewriter, we apply constness correctly and should be able to generate `base::span<const char>` instead.

## Solution
The rewriter should not spanify `SessionCommand::contents()` function.

## Note
None