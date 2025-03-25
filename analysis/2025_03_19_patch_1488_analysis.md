# Build Failure Analysis: 2025_03_19_patch_1488

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:1177:34: error: no viable conversion from 'GLuint *' (aka 'unsigned int *') to 'base::span<const GLuint>' (aka 'span<const unsigned int>')
 1177 |       !GenRenderbuffersHelper(n, renderbuffers_safe)) {
      |                                  ^~~~~~~~~~~~~~~~~~

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The rewriter spanified `GenRenderbuffersHelper`, but failed to spanify a call site.
The function `GenRenderbuffersHelper` was changed to take a `base::span<const GLuint>`, but the call site in `GLES2DecoderImpl::DoGenRenderbuffers` is still passing a raw `GLuint*`.

## Solution
The rewriter should be able to recognize and spanify the call site with `base::make_span` function.
```c++
!GenRenderbuffersHelper(n, base::make_span(renderbuffers_safe, n))
```

## Note
The build log shows many attempts to match `span` constructors, indicating the compiler is trying hard to find a match.
```
note: candidate constructor not viable: no known conversion from 'GLuint *' (aka 'unsigned int *') to 'std::initializer_list<value_type>' (aka 'initializer_list<unsigned int>') for 1st argument
note: candidate constructor not viable: no known conversion from 'GLuint *' (aka 'unsigned int *') to 'const span<const unsigned int> &' for 1st argument
note: candidate constructor not viable: no known conversion from 'GLuint *' (aka 'unsigned int *') to 'span<const unsigned int> &&' for 1st argument
note: candidate template ignored: could not match 'unsigned int[N]' against 'GLuint *' (aka 'unsigned int *')
note: candidate template ignored: constraints not satisfied [with R = GLuint *&]
```
These messages indicate the generated code is not correct.
```
1 error generated.