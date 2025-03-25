```
# Build Failure Analysis: 2025_03_19_patch_1512

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:8760:27: error: const_cast from 'base::span<const volatile GLfloat>' (aka 'span<const volatile float>') to 'const GLfloat *' (aka 'const float *') is not allowed
 8760 |                           const_cast<const GLfloat*>(value));
      |                           ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter has spanified a variable `value` but left a `const_cast` that is applied to it. Rewriter needs to be able to remove it.

## Solution
The rewriter logic should be changed to remove the `const_cast` when spanifying a variable.

```c++
-                           const_cast<const GLfloat*>(value));
+                           value);
```

## Note
The second error is 

```
../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:3600:33: error: no viable conversion from 'const volatile GLfloat *' (aka 'const volatile float *') to 'base::span<const volatile GLfloat>' (aka 'span<const volatile float>')
 3600 |   DoUniform4fv(location, count, v);
      |                                 ^
```

This is an example of Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.
`gles2_cmd_decoder_autogen.h` is generated code, so it is excluded from the rewriter. Thus we shouldn't spanify functions that require rewriting excluded code.