# Build Failure Analysis: 2025_03_14_patch_1608

## First error

../../net/filter/brotli_source_stream.cc:167:24: error: no viable conversion from 'size_t *' (aka 'unsigned long *') to 'base::span<size_t>' (aka 'span<unsigned long>')
  167 |     base::span<size_t> array =
      |                        ^
  168 |         reinterpret_cast<size_t*>(malloc(size + sizeof(size_t)));
      |         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The rewriter attempted to use `base::span` with the raw pointer returned by `malloc`, which isn't directly convertible to a span.  The return type from malloc is a raw pointer and needs to be explicitly converted to a span by specifying the address and length.

## Solution
The rewriter needs to explicitly construct a span from the result of `malloc`. The size of the new span is calculated as `size + sizeof(size_t)` because `malloc` allocates memory for metadata used by Brotli. The code can be fixed by using `base::make_span` to make the span:

```diff
diff --git a/net/filter/brotli_source_stream.cc b/net/filter/brotli_source_stream.cc
index 1b569fc85dae7..da2a5a7d1d2a8 100644
--- a/net/filter/brotli_source_stream.cc
+++ b/net/filter/brotli_source_stream.cc
@@ -162,9 +164,10 @@ class BrotliSourceStream : public FilterSourceStream {
   }
 
   void* AllocateMemoryInternal(size_t size) {
-    size_t* array = reinterpret_cast<size_t*>(malloc(size + sizeof(size_t)));
-    if (!array)
+    void* memory = malloc(size + sizeof(size_t));
+    base::span<size_t> array(reinterpret_cast<size_t*>(memory), (size + sizeof(size_t)) / sizeof(size_t));
+    if (array.empty()) {
       return nullptr;
+    }
     used_memory_ += size;
     if (used_memory_maximum_ < used_memory_)
       used_memory_maximum_ = used_memory_;

```

## Note
The division by sizeof(size_t) is important, or else there will be memory access errors due to the wrong size of the allocated buffer being set.