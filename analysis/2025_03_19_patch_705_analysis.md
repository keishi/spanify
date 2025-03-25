```
# Build Failure Analysis: 2025_03_19_patch_705

## First error

../../net/websockets/websocket_channel_test.cc:2251:52: error: invalid operands to binary expression ('const array<remove_cv_t<char>, 12UL>' (aka 'const array<char, 12UL>') and 'const size_t' (aka 'const unsigned long'))
 2251 |                                        kBinaryBlob + kBinaryBlobSize)),
      |                                        ~~~~~~~~~~~ ^ ~~~~~~~~~~~~~~~

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The original code used pointer arithmetic on a `char[]` array to pass it to a `std::string` constructor. The rewriter converted the `char[]` to `std::array<char, N>`, which is not implicitly convertible to a pointer, and doesn't support pointer arithmetic in the same way. The code now attempts to add the `std::array` object directly to a `size_t` variable, which is an invalid operation. The correct fix is to use `.data()` to get a pointer to the underlying array.

## Solution
The rewriter needs to add `.data()` to the `kBinaryBlob` variable to convert it to a `char*` so that it can be added to `kBinaryBlobSize` and then be passed to the `std::string` constructor.

For example, the rewriter would produce the following diff:

```diff
--- a/net/websockets/websocket_channel_test.cc
+++ b/net/websockets/websocket_channel_test.cc
@@ -135,8 +137,8 @@ using ::testing::StrictMock;
 
 // A selection of characters that have traditionally been mangled in some
 // environment or other, for testing 8-bit cleanliness.
-constexpr char kBinaryBlob[] = {
-    '\n',   '\r',    // BACKWARDS CRNL
+constexpr auto kBinaryBlob = std::to_array<char>({
+    '\n', '\r',      // BACKWARDS CRNL
     '\0',            // nul
     '\x7F',          // DEL
     '\x80', '\xFF',  // NOT VALID UTF-8
@@ -146,7 +148,7 @@ constexpr char kBinaryBlob[] = {
     '\x1B',          // ESC, often special
     '\b',            // backspace
     '\'',            // single-quote, special in PHP
-};
+});
 constexpr size_t kBinaryBlobSize = std::size(kBinaryBlob);

```

becomes

```diff
--- a/net/websockets/websocket_channel_test.cc
+++ b/net/websockets/websocket_channel_test.cc
@@ -135,8 +137,8 @@ using ::testing::StrictMock;
 
 // A selection of characters that have traditionally been mangled in some
 // environment or other, for testing 8-bit cleanliness.
-constexpr char kBinaryBlob[] = {
-    '\n',   '\r',    // BACKWARDS CRNL
+constexpr auto kBinaryBlob = std::to_array<char>({
+    '\n', '\r',      // BACKWARDS CRNL
     '\0',            // nul
     '\x7F',          // DEL
     '\x80', '\xFF',  // NOT VALID UTF-8
@@ -146,7 +148,7 @@ constexpr char kBinaryBlob[] = {
     '\x1B',          // ESC, often special
     '\b',            // backspace
     '\'',            // single-quote, special in PHP
-};
+});
 constexpr size_t kBinaryBlobSize = std::size(kBinaryBlob);

```

And

```diff
-          AsIOBuffer(std::string(kBinaryBlob, kBinaryBlob + kBinaryBlobSize)),
+          AsIOBuffer(std::string(kBinaryBlob.data(),
+                                       kBinaryBlob + kBinaryBlobSize)),
```

becomes

```diff
-          AsIOBuffer(std::string(kBinaryBlob, kBinaryBlob + kBinaryBlobSize)),
+          AsIOBuffer(std::string(kBinaryBlob.data(),
+                                       kBinaryBlob.data() + kBinaryBlobSize)),
```

## Note
The second error is the same and should be fixed together.