# Build Failure Analysis: 2025_05_02_patch_1043

## First error

../../chrome/browser/webauthn/test_util.cc:85:11: error: no matching function for call to 'StringToUint'

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The rewriter converted `char port_str[6]` to `std::array<char, 6> port_str`.  However, `base::StringToUint` expects a `std::string_view` as input. The `port_str` variable needs to be converted to `std::string_view`. The rewriter failed to add `.data()` to the arrayified variable when it is used with `base::StringToUint`.

## Solution
The rewriter should recognize this pattern and add `.data()` when a `char[]` variable is converted to `std::array` and then used as an argument to `base::StringToUint`.

```diff
--- a/chrome/browser/webauthn/test_util.cc
+++ b/chrome/browser/webauthn/test_util.cc
@@ -82,7 +82,7 @@
     CHECK(enclave_process->IsValid());
     close(fds[1]);
 
-    const ssize_t read_bytes =
-        HANDLE_EINTR(read(fds[0], port_str, sizeof(port_str)));
+    const ssize_t read_bytes = HANDLE_EINTR(read(fds[0], port_str.data(), port_str.size()));
     close(fds[0]);
 #endif
 
+   CHECK(base::StringToUint(std::string_view(port_str.data(), read_bytes), &u_port)) << std::string_view(port_str.data(), read_bytes);

```

## Note
The other error relates to the `CHECK` macro which attempts to print the `port_str` to the output stream.  The rewriter should also add `.data()` in this situation.