# Build Failure: 2025_05_02_patch_432

## First error

```
../../mojo/core/message_pipe_unittest.cc:334:43: error: member reference base type 'MojoHandle[30]' (aka 'unsigned long[30]') is not a structure or union
  334 |     WriteMessageWithHandles(h, "", handles.data(),
      |                                    ~~~~~~~^~~~~
```

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The code changed from using a C-style array `MojoHandle handles[kPingPongHandlesPerIteration];` to using `std::array<MojoHandle, kPingPongHandlesPerIteration> handles;`. The `WriteMessageWithHandles` function takes a raw pointer to the handle data, but the rewriter failed to update the call sites to use `.data()` on the `std::array`.  The original C-style array implicitly decayed to a pointer, but `std::array` does not.

## Solution
The rewriter needs to recognize when a spanified `std::array` variable is being passed as a raw pointer, and automatically insert `.data()` at the call site.

## Note
There are more errors.

```
../../mojo/core/message_pipe_unittest.cc:348:60: error: use of undeclared identifier 'p'
  348 |     EXPECT_EQ(MOJO_RESULT_OK, MojoCreateDataPipe(nullptr, &p, &c[i]));
      |                                                            ^
../../mojo/core/message_pipe_unittest.cc:349:15: error: use of undeclared identifier 'p'
  349 |     MojoClose(p);
      |               ^
../../mojo/core/message_pipe_unittest.cc:366:31: error: no matching function for call to 'MojoCreateDataPipe'
  366 |     EXPECT_EQ(MOJO_RESULT_OK, MojoCreateDataPipe(nullptr, &p[i], &c));
      |                               ^~~~~~~~~~~~~~~~~~
../../mojo/public/c/system/data_pipe.h:215:1: note: candidate function not viable: no known conversion from 'std::array<MojoHandle, kPingPongHandlesPerIteration> *' (aka 'array<unsigned long, kPingPongHandlesPerIteration> *') to 'MojoHandle *' (aka 'unsigned long *') for 3rd argument
  215 | MojoCreateDataPipe(const struct MojoCreateDataPipeOptions* options,
      | ^
  216 |                    MojoHandle* data_pipe_producer_handle,
  217 |                    MojoHandle* data_pipe_consumer_handle);
      |                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../mojo/core/message_pipe_unittest.cc:367:5: error: no matching function for call to 'MojoClose'
  367 |     MojoClose(c);
      |     ^~~~~~~~~
../../mojo/public/c/system/functions.h:84:31: note: candidate function not viable: no known conversion from 'std::array<MojoHandle, kPingPongHandlesPerIteration>' (aka 'array<unsigned long, kPingPongHandlesPerIteration>') to 'MojoHandle' (aka 'unsigned long') for 1st argument
   84 | MOJO_SYSTEM_EXPORT MojoResult MojoClose(MojoHandle handle);