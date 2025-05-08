# Build Failure Analysis: 2025_05_02_patch_1603

## First error

../../url/url_canon_fileurl.cc:45:7: error: no matching function for call to 'DoesContainWindowsDriveSpecUntil'
   45 |       DoesContainWindowsDriveSpecUntil(spec, begin, end, end);
      |       ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../url/url_file.h:38:12: note: candidate template ignored: could not match 'base::span<const CHAR>' against 'const char *'
   38 | inline int DoesContainWindowsDriveSpecUntil(base::span<const CHAR> spec,
      |            ^

## Category
Pointer passed into spanified function parameter.

## Reason
The function `DoesContainWindowsDriveSpecUntil` was spanified, but the call site is passing a raw pointer. The rewriter needs to spanify the call site as well.

## Solution
The rewriter needs to find all call sites of spanified functions and rewrite them to use spans as well.
```diff
diff --git a/url/url_canon_fileurl.cc b/url/url_canon_fileurl.cc
index 1026799a0e557..9ba79210a6582 100644
--- a/url/url_canon_fileurl.cc
+++ b/url/url_canon_fileurl.cc
@@ -42,7 +42,7 @@
   // When the filesystem has Windows-style drive letters, we want to canonicalize
   // file URLs like "file:///c:/foo".
   if (base::IsWindows()) {
-    if (DoesContainWindowsDriveSpecUntil(spec, begin, end, end)) {
+    if (DoesContainWindowsDriveSpecUntil(base::span(spec + begin, end - begin), 0, end - begin, end - begin)) {
       // If we get here, the source looks like "c:/foo" or "c:\\foo" (we
       // already know the length). In this case, we want to convert the
       // colon to a slash and prepend a slash: "/C:/foo" or "/C:\\foo" (note
@@ -179,7 +179,7 @@
 
 template <typename CHAR>
 bool DoFindWindowsDriveLetter(const CHAR* spec, int begin, int end) {
-  if (DoesContainWindowsDriveSpecUntil(spec, begin, end, end))
+  if (DoesContainWindowsDriveSpecUntil(base::span(spec + begin, end - begin), 0, end - begin, end - begin))
     return true;
   return false;
 }