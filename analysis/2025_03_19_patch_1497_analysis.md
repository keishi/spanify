# Build Failure Analysis: 2025_03_19_patch_1497

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:16157:7: error: volatile lvalue reference to type 'const volatile Mailbox' cannot bind to a temporary of type 'const volatile Mailbox *'

## Category
Rewriter needs to handle span access.

## Reason
The code was rewritten to take span as an argument. In the implementation the code tries to dereference it using array index access, which is illegal. The rewriter doesn't know how to get the underlying pointer from the span object.

## Solution
The rewriter should use `.data()` to access the underlying pointer.

## Note
The second error is a direct consequence of the first one, because after fixing the first error the compiler will attempt to spanify the caller.