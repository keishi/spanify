# Build Failure Analysis: 2025_03_19_patch_808

## First error

../../gpu/command_buffer/service/common_decoder.cc:42:56: error: 'CommandInfo' is a private member of 'gpu::CommonDecoder'

## Category
Rewriter needs to preserve access modifiers when using `std::to_array`.

## Reason
The `CommandInfo` struct is private within the `CommonDecoder` class.  The rewriter converted the declaration of `command_info` to use `std::to_array`, but it failed to take into account the private access modifier, resulting in a compile error because the anonymous namespace now needs access to `CommandInfo` from outside the class.

## Solution
The rewriter should not move private members of a class to outside the class definition. It should detect this pattern and avoid applying the `std::to_array` rewrite in this case.

## Note
The remaining errors are all caused by the first error.  The subsequent errors relate to accessing other private members of the class within the `COMMON_COMMAND_BUFFER_CMDS` macro.  The final error at line 248 is also related to the `std::to_array` usage.