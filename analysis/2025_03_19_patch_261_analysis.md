# Build Failure Analysis: 2025_03_19_patch_261

## First error

../../net/ntlm/ntlm_buffer_reader.h:210:59: error: no viable conversion from returned value of type 'const span<const uint8_t, [...], raw_ptr<const uint8_t, (RawPtrTraits)0U | AllowPtrArithmetic>>' to function return type 'const span<uint8_t, [...], (default) unsigned char *>'

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The rewriter spanified `buffer_` which is a `base::raw_span<const uint8_t>` field. Then the rewriter changed `GetBufferPtr` to return `buffer_`. However, the return type of `GetBufferPtr` is `const base::span<uint8_t>`. So the rewriter failed to add `.data()` to convert it from `const base::raw_span<const uint8_t>` to `const uint8_t*`.

## Solution
Add `.data()` to the return statement of `GetBufferPtr` so that it is correctly converted to the return type `const uint8_t*`.
```diff
--- a/net/ntlm/ntlm_buffer_reader.h
+++ b/net/ntlm/ntlm_buffer_reader.h
@@ -207,16 +207,18 @@ class NET_EXPORT_PRIVATE NtlmBufferReader {
   void AdvanceCursor(size_t count) { SetCursor(GetCursor() + count); }
 
   // Returns a constant pointer to the start of the buffer.
-  const uint8_t* GetBufferPtr() const { return buffer_; }
+  const uint8_t* GetBufferPtr() const { return buffer_.data(); }
```

## Note
The code also contains an instance where it calls `.subspan()` on the return value, but failed to add `.data()` there too. This will be a follow up bug.

```
-  *reader = NtlmBufferReader(
-      base::span(GetBufferPtr() + sec_buf.offset, sec_buf.length));
+  *reader = NtlmBufferReader(base::span(
+      GetBufferPtr().subspan(sec_buf.offset).data(), sec_buf.length));