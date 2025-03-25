# Build Failure Analysis: 2025_03_19_patch_90

## First error
../../chrome/browser/devtools/devtools_file_system_indexer.cc:110:19: error: no viable overloaded '='
  110 |     trigram_chars = new TrigramChar[256];
      |     ~~~~~~~~~~~~~ ^ ~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter does not handle assignment of spanified variable from an allocation using new.

## Reason
The rewriter spanified the `trigram_chars` variable, but failed to recognize that it is assigned the result of a `new` allocation. The assignment of spanified variable from an allocation using new is not handled by the rewriter because this code should use a owned type like unique_ptr or a collection.

```c++
   static TrigramChar* trigram_chars = nullptr;
   if (!trigram_chars) {
     trigram_chars = new TrigramChar[256];
```

## Solution
The rewriter should not rewrite this code because it uses unsafe raw pointer usage with `new`. There is no way to spanify this variable because it is not safe. The spanified code would also not compile.

## Note
The code needs to be refactored to use a safe container type to prevent this error.
```c++
 static std::unique_ptr<TrigramChar[]> trigram_chars;
   if (!trigram_chars) {
     trigram_chars = std::make_unique<TrigramChar[]>(256);