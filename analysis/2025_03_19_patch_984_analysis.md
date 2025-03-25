# Build Failure Analysis: 2025_03_19_patch_984

## First error

../../google_apis/drive/drive_api_requests_unittest.cc:497:55: error: no viable conversion from 'const std::string_view' (aka 'const basic_string_view<char>') to 'const std::string' (aka 'const basic_string<char>')

## Category
Rewriter needs to add .data() to a spanified return value.

## Reason
In the original code, `kTestDownloadPathPrefix` is a `const char[]` which implicitly converts to `std::string` when used in the `RemovePrefix` function. After the spanify change, `kTestDownloadPathPrefix` became a `std::string_view`. The compiler is complaining that there is no implicit conversion from `std::string_view` to `std::string` for the function argument. Adding `.data()` to `kTestDownloadPathPrefix` would solve this because `kTestDownloadPathPrefix.data()` would return a `const char*` which can implicitly convert to `std::string`. This is consistent with `kTestDownloadPathPrefix` being a C-style array in the original code.

## Solution
Add `.data()` to the spanified return value.

```diff
--- a/google_apis/drive/drive_api_requests_unittest.cc
+++ b/google_apis/drive/drive_api_requests_unittest.cc
@@ -72,7 +72,7 @@ const char kTestPermissionResponse[] =
 
 const char kTestUploadExistingFilePath[] = "/upload/existingfile/path";
 const char kTestUploadNewFilePath[] = "/upload/newfile/path";
-const char kTestDownloadPathPrefix[] = "/drive/v2/files/";
+const std::string_view kTestDownloadPathPrefix = "/drive/v2/files/";

```

And

```diff
--- a/google_apis/drive/drive_api_requests_unittest.cc
+++ b/google_apis/drive/drive_api_requests_unittest.cc
@@ -2028,8 +2030,9 @@ TEST_F(DriveApiRequestsTest, DownloadFileRequest) {
 
   EXPECT_EQ(HTTP_SUCCESS, result_code);
   EXPECT_EQ(net::test_server::METHOD_GET, http_request_.method);
-  EXPECT_EQ(kTestDownloadPathPrefix + kTestId + "?" + kTestDownloadFileQuery,
-            http_request_.relative_url);
+  EXPECT_EQ(
+      kTestDownloadPathPrefix.data() + kTestId + "?" + kTestDownloadFileQuery,
+      http_request_.relative_url);
   EXPECT_EQ(kDownloadedFilePath, temp_file);

```

## Note
There are more errors like this:

```
../../google_apis/drive/drive_api_requests_unittest.cc:533:55: error: no viable conversion from 'const std::string_view' (aka 'const basic_string_view<char>') to 'const std::string' (aka 'const basic_string<char>')
  533 |     if (test_util::RemovePrefix(absolute_url.path(), kTestDownloadPathPrefix,
      |                                                       ^~~~~~~~~~~~~~~~~~~~~~~
../../third_party/libc++/src/include/string:980:71: note: candidate constructor not viable: no known conversion from 'const std::string_view' (aka 'const basic_string_view<char>') to 'const string &' for 1st argument
  980 |   _LIBCPP_CONSTEXPR_SINCE_CXX20 _LIBCPP_STRING_INTERNAL_MEMORY_ACCESS basic_string(const basic_string& __str)
      |                                                                       ^            ~~~~~~~~~~~~~~~~~~~~~~~~~
../../third_party/libc++/src/include/string:1000:55: note: candidate constructor not viable: no known conversion from 'const std::string_view' (aka 'const basic_string_view<char>') to 'string &&' for 1st argument
 1000 |   _LIBCPP_HIDE_FROM_ABI _LIBCPP_CONSTEXPR_SINCE_CXX20 basic_string(basic_string&& __str)
      |                                                       ^            ~~~~~~~~~~~~~~~~~~~~
../../third_party/libc++/src/include/string:1040:55: note: candidate constructor template not viable: no known conversion from 'const std::string_view' (aka 'const basic_string_view<char>') to 'const char * _Nonnull' for 1st argument
 1040 |   _LIBCPP_HIDE_FROM_ABI _LIBCPP_CONSTEXPR_SINCE_CXX20 basic_string(const _CharT* _LIBCPP_DIAGNOSE_NULLPTR __s) {
      |                                                       ^            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../third_party/libc++/src/include/string:1175:55: note: candidate constructor not viable: no known conversion from 'const std::string_view' (aka 'const basic_string_view<char>') to 'initializer_list<char>' for 1st argument
 1175 |   _LIBCPP_HIDE_FROM_ABI _LIBCPP_CONSTEXPR_SINCE_CXX20 basic_string(initializer_list<_CharT> __il) {
      |                                                       ^            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../third_party/libc++/src/include/string:970:64: note: explicit constructor is not a candidate
  970 |   _LIBCPP_HIDE_FROM_ABI _LIBCPP_CONSTEXPR_SINCE_CXX20 explicit basic_string(const allocator_type& __a)
      |                                                                ^
../../third_party/libc++/src/include/string:1133:42: note: explicit constructor is not a candidate
 1133 |   _LIBCPP_CONSTEXPR_SINCE_CXX20 explicit basic_string(const _Tp& __t) {
      |                                          ^
../../google_apis/common/test_util.h:56:38: note: passing argument to parameter 'prefix' here
   56 |                   const std::string& prefix,
      |                                      ^
../../google_apis/drive/drive_api_requests_unittest.cc:2028:15: error: no viable conversion from 'const std::string_view' (aka 'const basic_string_view<char>') to 'std::string' (aka 'basic_string<char>')
 2028 |   EXPECT_EQ(HTTP_SUCCESS, result_code);
      |   ~~~~~~~~~^~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../third_party/libc++/src/include/gtest/gtest_lite.h:218:5: note: in instantiation of function template specialization 'EXPECT_EQ<std::string, std::string_view>' requested here
  218 |   EXPECT_PRED_FORMAT2(::testing::internal::EqHelper::Compare, expected,
      |   ^
../../third_party/libc++/src/include/string:980:71: note: candidate constructor not viable: no known conversion from 'const std::string_view' (aka 'const basic_string_view<char>') to 'const string &' for 1st argument
  980 |   _LIBCPP_CONSTEXPR_SINCE_CXX20 _LIBCPP_STRING_INTERNAL_MEMORY_ACCESS basic_string(const basic_string& __str)
      |                                                                       ^            ~~~~~~~~~~~~~~~~~~~~~~~~~
../../third_party/libc++/src/include/string:1000:55: note: candidate constructor not viable: no known conversion from 'const std::string_view' (aka 'const basic_string_view<char>') to 'string &&' for 1st argument
 1000 |   _LIBCPP_HIDE_FROM_ABI _LIBCPP_CONSTEXPR_SINCE_CXX20 basic_string(basic_string&& __str)
      |                                                       ^            ~~~~~~~~~~~~~~~~~~~~
../../third_party/libc++/src/include/string:1040:55: note: candidate constructor template not viable: no known conversion from 'const std::string_view' (aka 'const basic_string_view<char>') to 'const char * _Nonnull' for 1st argument
 1040 |   _LIBCPP_HIDE_FROM_ABI _LIBCPP_CONSTEXPR_SINCE_CXX20 basic_string(const _CharT* _LIBCPP_DIAGNOSE_NULLPTR __s) {
      |                                                       ^            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../third_party/libc++/src/include/string:1175:55: note: candidate constructor not viable: no known conversion from 'const std::string_view' (aka 'const basic_string_view<char>') to 'initializer_list<char>' for 1st argument
 1175 |   _LIBCPP_HIDE_FROM_ABI _LIBCPP_CONSTEXPR_SINCE_CXX20 basic_string(initializer_list<_CharT> __il) {
      |                                                       ^            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../third_party/libc++/src/include/string:970:64: note: explicit constructor is not a candidate
  970 |   _LIBCPP_HIDE_FROM_ABI _LIBCPP_CONSTEXPR_SINCE_CXX20 explicit basic_string(const allocator_type& __a)
      |                                                                ^
../../third_party/libc++/src/include/string:1133:42: note: explicit constructor is not a candidate
 1133 |   _LIBCPP_CONSTEXPR_SINCE_CXX20 explicit basic_string(const _Tp& __t) {
      |                                          ^
../../third_party/libc++/src/include/gtest/gtest_lite.h:232:3: note: passing argument to parameter '__y' here
  232 |   return __x == __y;
      |          ^
../../google_apis/drive/drive_api_requests_unittest.cc:2062:15: error: no viable conversion from 'const std::string_view' (aka 'const basic_string_view<char>') to 'std::string' (aka 'basic_string<char>')
 2062 |   EXPECT_EQ(HTTP_SUCCESS, result_code);
      |   ~~~~~~~~~^~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../third_party/libc++/src/include/gtest/gtest_lite.h:218:5: note: in instantiation of function template specialization 'EXPECT_EQ<std::string, std::string_view>' requested here
  218 |   EXPECT_PRED_FORMAT2(::testing::internal::EqHelper::Compare, expected,
      |   ^
../../third_party/libc++/src/include/string:980:71: note: candidate constructor not viable: no known conversion from 'const std::string_view' (aka 'const basic_string_view<char>') to 'const string &' for 1st argument
  980 |   _LIBCPP_CONSTEXPR_SINCE_CXX20 _LIBCPP_STRING_INTERNAL_MEMORY_ACCESS basic_string(const basic_string& __str)
      |                                                                       ^            ~~~~~~~~~~~~~~~~~~~~~~~~~
../../third_party/libc++/src/include/string:1000:55: note: candidate constructor not viable: no known conversion from 'const std::string_view' (aka 'const basic_string_view<char>') to 'string &&' for 1st argument
 1000 |   _LIBCPP_HIDE_FROM_ABI _LIBCPP_CONSTEXPR_SINCE_CXX20 basic_string(basic_string&& __str)
      |                                                       ^            ~~~~~~~~~~~~~~~~~~~~
../../third_party/libc++/src/include/string:1040:55: note: candidate constructor template not viable: no known conversion from 'const std::string_view' (aka 'const basic_string_view<char>') to 'const char * _Nonnull' for 1st argument
 1040 |   _LIBCPP_HIDE_FROM_ABI _LIBCPP_CONSTEXPR_SINCE_CXX20 basic_string(const _CharT* _LIBCPP_DIAGNOSE_NULLPTR __s) {
      |                                                       ^            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../third_party/libc++/src/include/string:1175:55: note: candidate constructor not viable: no known conversion from 'const std::string_view' (aka 'const basic_string_view<char>') to 'initializer_list<char>' for 1st argument
 1175 |   _LIBCPP_HIDE_FROM_ABI _LIBCPP_CONSTEXPR_SINCE_CXX20 basic_string(initializer_list<_CharT> __il) {
      |                                                       ^            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../third_party/libc++/src/include/string:970:64: note: explicit constructor is not a candidate
  970 |   _LIBCPP_HIDE_FROM_ABI _LIBCPP_CONSTEXPR_SINCE_CXX20 explicit basic_string(const allocator_type& __a)
      |                                                                ^
../../third_party/libc++/src/include/string:1133:42: note: explicit constructor is not a candidate
 1133 |   _LIBCPP_CONSTEXPR_SINCE_CXX20 explicit basic_string(const _Tp& __t) {
      |                                          ^
../../third_party/libc++/src/include/gtest/gtest_lite.h:232:3: note: passing argument to parameter '__y' here
  232 |   return __x == __y;
      |          ^
4 errors generated.