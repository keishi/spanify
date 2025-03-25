```
# Build Failure Analysis: 2025_03_19_patch_1954

## First error

../../chrome/updater/certificate_tag.cc:690:47: error: invalid operands to binary expression ('std::array<char, 64>' and 'uint16_t' (aka 'unsigned short'))
  690 |             UNSAFE_BUFFERS(sig_dir_entry.name + sig_dir_entry.num_name_bytes),
      |                            ~~~~~~~~~~~~~~~~~~ ^ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter changed `char[]` to `std::array`, but it failed to rewrite the call sites to use `.data()` because there is pointer arithmetic on that variable. The rewriter should recognize this limitation and avoid spanifying that variable. Also the function is annotated `UNSAFE_BUFFERS` which means it should be excluded from spanification.

## Solution
The rewriter should avoid spanifying functions if it requires spanifying excluded code.

## Note
The second fix is incorrect
```
--- a/chrome/updater/certificate_tag.cc
+++ b/chrome/updater/certificate_tag.cc
@@ -686,7 +686,7 @@
         dir_sector * sector_format_.size + i * kNumDirEntryBytes;
     std::memcpy(&sig_dir_entry, &contents_[offset], sizeof(MSIDirEntry));
     if (std::equal(
-            sig_dir_entry.name,
+            sig_dir_entry.name.data(),
             UNSAFE_BUFFERS(sig_dir_entry.name + sig_dir_entry.num_name_bytes),
             std::begin(kSignatureName))) {
       return {sig_dir_entry, offset, true};
```

This line should not have been touched by the rewriter since it is inside `UNSAFE_BUFFERS`.