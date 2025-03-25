# Build Failure Analysis: 2025_03_19_patch_17

## First error

../../third_party/blink/renderer/core/xml/xslt_unicode_sort.cc:393:5: error: no matching function for call to 'xsltSetCtxtSortFunc'

## Category
Pointer passed into spanified function parameter.

## Reason
The function `xsltSetCtxtSortFunc` expects a raw pointer `xmlNode**` as its second argument, but the code is now passing `base::span<xmlNodePtr>`. The rewriter spanified `XsltUnicodeSortFunction`, but failed to spanify the call site.

## Solution
The rewriter needs to spanify the call site of `XsltUnicodeSortFunction` as well.
```
diff --git a/third_party/blink/renderer/core/xml/xslt_processor_libxslt.cc b/third_party/blink/renderer/core/xml/xslt_processor_libxslt.cc
index b51336269cf87..c2049eb3f378a 100644
--- a/third_party/blink/renderer/core/xml/xslt_processor_libxslt.cc
+++ b/third_party/blink/renderer/core/xml/xslt_processor_libxslt.cc
@@ -390,7 +390,7 @@
 
   xsltTransformContextPtr transform_context = ctxt->transformContext;
   if (transform_context && ctxt->sort) {
-    xsltSetCtxtSortFunc(transform_context, XsltUnicodeSortFunction);
+    xsltSetCtxtSortFunc(transform_context, XsltUnicodeSortFunction, ctxt->sort->sorts, ctxt->sort->nbsorts);
   }
 
   ctxt->state = XSLT_STATE_APPLY_IMPORT;
```

## Note
There are other instances where raw pointers are passed into spanified methods. A systematic approach is needed to solve this problem.