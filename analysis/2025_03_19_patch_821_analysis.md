# Build Failure Analysis: 2025_03_19_patch_821

## First error

../../mojo/core/invitation_unittest.cc:485:31: error: no matching conversion for functional-style cast from 'MojoHandle *' (aka 'unsigned long *') to 'base::span<MojoHandle, 1>' (aka 'span<unsigned long, 1>')
  485 |       "SendInvitationClient", base::span<MojoHandle, 1>(&primordial_pipe), 1,
      |                               ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `LaunchChildTestClient` has been spanified, requiring the second parameter to be a `base::span<MojoHandle>`. However, the code is attempting to construct a `base::span` from the address of a single `MojoHandle` variable (`&primordial_pipe`). The compiler can't find a matching conversion because it expects the size of the array and it's failing to deduce that the size is 1.

## Solution
The rewriter needs to recognize the pattern of taking the address of a single variable to be passed into a spanified function parameter and generate a `base::make_span` call.

```c++
// Instead of
base::span<MojoHandle>(&primordial_pipe)

// Generate
base::make_span(&primordial_pipe, 1)
```

## Note
The same error occurs multiple times in `mojo/core/invitation_unittest.cc`.
```
../../mojo/core/invitation_unittest.cc:617:30: error: no matching conversion for functional-style cast from 'MojoHandle *' (aka 'unsigned long *') to 'base::span<MojoHandle, 1>' (aka 'span<unsigned long, 1>')
../../mojo/core/invitation_unittest.cc:746:29: error: no matching conversion for functional-style cast from 'MojoHandle *' (aka 'unsigned long *') to 'base::span<MojoHandle, 1>' (aka 'span<unsigned long, 1>')
../../mojo/core/invitation_unittest.cc:791:7: error: no matching conversion for functional-style cast from 'MojoHandle *' (aka 'unsigned long *') to 'base::span<MojoHandle, 1>' (aka 'span<unsigned long, 1>')
../../mojo/core/invitation_unittest.cc:805:31: error: no matching conversion for functional-style cast from 'MojoHandle *' (aka 'unsigned long *') to 'base::span<MojoHandle, 1>' (aka 'span<unsigned long, 1>')
../../mojo/core/invitation_unittest.cc:863:33: error: no matching conversion for functional-style cast from 'MojoHandle *' (aka 'unsigned long *') to 'base::span<MojoHandle, 1>' (aka 'span<unsigned long, 1>')
../../mojo/core/invitation_unittest.cc:870:33: error: no matching conversion for functional-style cast from 'MojoHandle *' (aka 'unsigned long *') to 'base::span<MojoHandle, 1>' (aka 'span<unsigned long, 1>')
../../mojo/core/invitation_unittest.cc:888:26: error: no matching conversion for functional-style cast from 'MojoHandle *' (aka 'unsigned long *') to 'base::span<MojoHandle, 1>' (aka 'span<unsigned long, 1>')
../../mojo/core/invitation_unittest.cc:892:26: error: no matching conversion for functional-style cast from 'MojoHandle *' (aka 'unsigned long *') to 'base::span<MojoHandle, 1>' (aka 'span<unsigned long, 1>')
../../mojo/core/invitation_unittest.cc:904:32: error: no matching conversion for functional-style cast from 'MojoHandle *' (aka 'unsigned long *') to 'base::span<MojoHandle, 1>' (aka 'span<unsigned long, 1>')
../../mojo/core/invitation_unittest.cc:918:32: error: no matching conversion for functional-style cast from 'MojoHandle *' (aka 'unsigned long *') to 'base::span<MojoHandle, 1>' (aka 'span<unsigned long, 1>')
../../mojo/core/invitation_unittest.cc:936:35: error: no matching conversion for functional-style cast from 'MojoHandle *' (aka 'unsigned long *') to 'base::span<MojoHandle, 1>' (aka 'span<unsigned long, 1>')