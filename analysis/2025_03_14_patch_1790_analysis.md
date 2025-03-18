```
# Build Failure Analysis: 2025_03_14_patch_1790

## First error

../../gpu/command_buffer/client/share_group.cc:71:30: error: no viable conversion from 'base::span<const GLuint>' (aka 'span<const unsigned int>') to 'const GLuint *' (aka 'const unsigned int *')
   71 |     (gl_impl->*delete_fn)(n, ids);

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified `IdHandlerInterface::FreeIds`, but failed to spanify the call sites within `ShareGroup`.

## Solution
The rewriter needs to spanify the call sites as well as the function declarations.

```diff
diff --git a/gpu/command_buffer/client/share_group.h b/gpu/command_buffer/client/share_group.h
index 6ba0c652b6bdc..457aaf128c89f 100644
--- a/gpu/command_buffer/client/share_group.h
+++ b/gpu/command_buffer/client/share_group.h
@@ -71,9 +73,9 @@ class IdHandlerInterface {
       GLuint id_offset, GLsizei n, GLuint* ids) = 0;
 
   // Frees some ids.
-  virtual bool FreeIds(
-      GLES2Implementation* gl_impl, GLsizei n, const GLuint* ids,
-      DeleteFn delete_fn) = 0;
+  virtual bool FreeIds(GLES2Implementation* gl_impl, GLsizei n,
+                       base::span<const GLuint> ids,
+                       DeleteFn delete_fn) = 0;
 
   // Marks an id as used for glBind functions. id = 0 does nothing.
   virtual bool MarkAsUsedForBind(

```

## Note
The other two errors are the same.