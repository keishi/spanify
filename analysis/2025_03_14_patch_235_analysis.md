# Build Failure Analysis: 2025_03_14_patch_235

## First error
../../gpu/command_buffer/service/common_decoder.cc:42:56: error: 'CommandInfo' is a private member of 'gpu::CommonDecoder'

## Category
The rewriter created code that accesses private members.

## Reason
The `command_info` array is a private member of the `CommonDecoder` class. The rewriter moved the array definition from inside the class to outside the class, thus making it impossible to access private members from the array initialization list.

## Solution
The `command_info` array should be moved back inside the `CommonDecoder` class as a public static member. Or make the handlers public.

## Note
The other errors are all related to the same root cause.