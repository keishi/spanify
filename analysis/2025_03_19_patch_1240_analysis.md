# Build Failure Analysis: 2025_03_19_patch_1240

## First error

Overlapping replacements: ./base/atomicops.cc at offset 1865, length 4294967295: "=dst_byte_ptr.subspan()" and offset 2099, length 1: " "

## Category
Overlapping replacements between EraseMemberCall and EraseMemberCall.

## Reason
The rewriter generated overlapping replacements because it seems to be trying to both spanify and remove `*` from the code at the same time. This means the replacements are conflicting.

## Solution
The rewriter logic should be fixed to avoid generating overlapping replacements in this kind of situation. Likely the fix is to avoid spanifying the function parameter at all.

## Note
The diff is small:
```diff
--- a/base/atomicops.cc
+++ b/base/atomicops.cc
@@ -14,7 +15,7 @@
 void RelaxedAtomicWriteMemcpy(base::span<uint8_t> dst,
                               base::span<const uint8_t> src) {
   CHECK_EQ(dst.size(), src.size());
-  size_t bytes = dst.size();
+  size_t bytes = dst.size();
   uint8_t* dst_byte_ptr = dst.data();
   const uint8_t* src_byte_ptr = src.data();
   // Make sure that we can at least copy byte by byte with atomics.
@@ -26,7 +27,7 @@
   // Copy byte by byte until `dst_byte_ptr` is not properly aligned for
   // the happy case.
   while (bytes > 0 && !IsAligned(dst_byte_ptr, kDesiredAlignment)) {
-    std::atomic_ref<uint8_t>(*dst_byte_ptr)
+    std::atomic_ref<uint8_t>(*dst_byte_ptr)
         .store(*src_byte_ptr, std::memory_order_relaxed);
     // SAFETY: We check above that `dst_byte_ptr` and `src_byte_ptr` point
     // to spans of sufficient size.
@@ -39,7 +40,7 @@
   // aligned and the largest possible atomic is used for copying.
   if (IsAligned(src_byte_ptr, kDesiredAlignment)) {
     while (bytes >= sizeof(uintmax_t)) {
-      std::atomic_ref<uintmax_t>(*reinterpret_cast<uintmax_t*>(dst_byte_ptr))
+      std::atomic_ref<uintmax_t>(*reinterpret_cast<uintmax_t*>(dst_byte_ptr))
           .store(*reinterpret_cast<const uintmax_t*>(src_byte_ptr),
                  std::memory_order_relaxed);
       // SAFETY: We check above that `dst_byte_ptr` and `src_byte_ptr` point
@@ -52,7 +53,7 @@
 
   // Copy what's left after the happy-case byte-by-byte.
   while (bytes > 0) {
-    std::atomic_ref<uint8_t>(*dst_byte_ptr)
+    std::atomic_ref<uint8_t>(*dst_byte_ptr)
         .store(*src_byte_ptr, std::memory_order_relaxed);
     // SAFETY: We check above that `dst_byte_ptr` and `src_byte_ptr` point
     // to spans of sufficient size.