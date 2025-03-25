# Build Failure Analysis: 2025_03_19_patch_817

## First error

../../gpu/command_buffer/client/raster_implementation.cc:1251:51: error: expected expression
 1251 |       base::span<GLbyte>(mailboxes).subspan(sizeof).data()(source_mailbox.name),
      |                                                   ^

## Category
Conflict between ".data()" and ".subspan()" replacements.

## Reason
The rewriter attempted to add both `.data()` and `.subspan()` to the same expression which resulted in malformed code and the compiler error.

## Solution
The rewriter should be smarter about how it inserts `.data()` and `.subspan()` calls to avoid conflicts. In this case it should generate `base::span<GLbyte>(mailboxes).subspan(sizeof).data()` as  `base::span<GLbyte>(mailboxes).subspan(sizeof(source_mailbox.name))`.

## Note
The diff shows that the rewriter added `.data()` after `.subspan(sizeof)`:

```diff
--- a/gpu/command_buffer/client/raster_implementation.cc
+++ b/gpu/command_buffer/client/raster_implementation.cc
@@ -1245,12 +1245,13 @@ void RasterImplementation::CopySharedImage(const gpu::Mailbox& source_mailbox,
     SetGLError(GL_INVALID_VALUE, "glCopySharedImage", "height < 0");
     return;
   }
-  GLbyte mailboxes[sizeof(source_mailbox.name) * 2];
-  memcpy(mailboxes, source_mailbox.name, sizeof(source_mailbox.name));
-  memcpy(mailboxes + sizeof(source_mailbox.name), dest_mailbox.name,
-         sizeof(dest_mailbox.name));
+  std::array<GLbyte, sizeof(source_mailbox.name) * 2> mailboxes;
+  memcpy(mailboxes.data(), source_mailbox.name, sizeof(source_mailbox.name));
+  memcpy(
+      base::span<GLbyte>(mailboxes).subspan(sizeof).data()(source_mailbox.name),
+      dest_mailbox.name, sizeof(dest_mailbox.name));
   helper_->CopySharedImageINTERNALImmediate(xoffset, yoffset, x, y, width,
-                                            height, mailboxes);
+                                            height, mailboxes.data());
   CheckGLError();
 }