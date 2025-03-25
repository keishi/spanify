```
# Build Failure Analysis: 2025_03_19_patch_382

## First error

../../chrome/browser/webauthn/test_util.cc:85:11: error: no matching function for call to 'StringToUint'
   85 |     CHECK(base::StringToUint(port_str, &u_port)) << port_str;
      |           ^~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with `base::StringToUint`.

## Reason
The `port_str` variable, originally a `char[]`, was converted to `std::array<char, 6>`. The `base::StringToUint` function requires a `std::string_view` (or `std::u16string_view`) as its first argument.  However, the rewriter forgot to add `.data()` to the `port_str` argument, resulting in a type mismatch and a compile error.

## Solution
The rewriter must identify cases where a `char[]` is converted to `std::array` and passed to `base::StringToUint` and add `.data()` to the argument, resolving the type mismatch.

```diff
--- a/chrome/browser/webauthn/test_util.cc
+++ b/chrome/browser/webauthn/test_util.cc
@@ -82,7 +82,7 @@
 #endif
 
     const ssize_t read_bytes = HANDLE_EINTR(
-        read(fds[0], port_str.data(),
+        read(fds[0], port_str.data(),
              (port_str.size() * sizeof(decltype(port_str)::value_type))));
     close(fds[0]);
 #endif

@@ -85,7 +85,7 @@
     close(fds[0]);
 #endif
 
-    CHECK(base::StringToUint(port_str, &u_port)) << port_str;
+    CHECK(base::StringToUint(port_str.data(), &u_port)) << port_str;
     port = checked_cast<uint16_t>(u_port);

     if (port) {

```

## Note
The code also produced another error, because it failed to compile with `port_str` variable in the stream. This is likely because `std::array<char, 6>` is not directly printable with `std::ostream`.

```
../../chrome/browser/webauthn/test_util.cc:85:50: error: invalid operands to binary expression ('std::ostream' (aka 'basic_ostream<char>') and 'std::array<char, 6>')
  144 |     stream() << streamed_type;
      |     ~~~~~~~~ ^  ~~~~~~~~~~~~~
```
The rewriter should also add `.data()` when printing `std::array<char, 6>` to a stream. The fix is similar.
```diff
--- a/chrome/browser/webauthn/test_util.cc
+++ b/chrome/browser/webauthn/test_util.cc
@@ -82,7 +82,7 @@
 #endif
 
     const ssize_t read_bytes = HANDLE_EINTR(
-        read(fds[0], port_str.data(),
+        read(fds[0], port_str.data(),
              (port_str.size() * sizeof(decltype(port_str)::value_type))));
     close(fds[0]);
 #endif

@@ -85,7 +85,7 @@
     close(fds[0]);
 #endif
 
-    CHECK(base::StringToUint(port_str, &u_port)) << port_str;
+    CHECK(base::StringToUint(port_str.data(), &u_port)) << port_str.data();
     port = checked_cast<uint16_t>(u_port);

     if (port) {

```
This could be a new category, but it can be also addressed as part of the fix.