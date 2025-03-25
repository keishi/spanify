# Build Failure Analysis: 2025_03_19_patch_627

## First error

../../gpu/command_buffer/client/gles2_implementation.cc:1726:22: error: cannot initialize a parameter of type 'DeleteFn' (aka 'void (GLES2Implementation::*)(GLsizei, const GLuint *)') with an rvalue of type 'void (gpu::gles2::GLES2Implementation::*)(GLsizei, base::span<const GLuint>)'

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified `GLES2Implementation::DeleteSyncStub`, but failed to spanify a call site in `GLES2Implementation::DeleteSyncHelper`.

## Solution
The rewriter needs to find all call sites of spanified functions and spanify the arguments being passed in.