# Build Failure Analysis: 2025_03_14_patch_2008

## First error

../../net/http/http_util.cc:310:7: error: suggest braces around initialization of subobject [-Werror,-Wmissing-braces]
  310 |       "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"};
      |       ^~~~~
      |       {    }

## Category
Rewriter introduced missing braces.

## Reason
The rewriter changed a C-style array initialization to a `std::array`. The original code used a C-style array which implicitly initializes each `char[4]` element. `std::array` requires explicit brace initialization for each subobject.

## Solution
Add braces around the initializers for each day of the week.
```diff
--- a/net/http/http_util.cc
+++ b/net/http/http_util.cc
@@ -304,8 +306,8 @@ bool HttpUtil::ParseRetryAfterHeader(const std::string& retry_after_string,
 
 // static
 std::string HttpUtil::TimeFormatHTTP(base::Time time) {
-  static constexpr char kWeekdayName[7][4] = {"Sun", "Mon", "Tue", "Wed",
-                                              "Thu", "Fri", "Sat"};
+  constexpr static std::array<std::array<char, 4>, 7> kWeekdayName = {
+      {"Sun"}, {"Mon"}, {"Tue"}, {"Wed"}, {"Thu"}, {"Fri"}, {"Sat"}};
   static constexpr char kMonthName[12][4] = {"Jan", "Feb", "Mar", "Apr",
                                               "May", "Jun", "Jul", "Aug",
                                               "Sep", "Oct", "Nov", "Dec"};
```

## Note
There are additional compile errors regarding `base::StringPrintf`. The root cause is `kWeekdayName` is passed into `base::StringPrintf`, and abseil has no support for `std::array<char, 4>`. `base::StringPrintf` should use a character pointer (`const char*`).

```
../../net/http/http_util.cc:316:10: error: no matching function for call to 'StringPrintf'
  316 |   return base::StringPrintf(
      |          ^~~~~~~~~~~~~~~~~~
../../base/strings/stringprintf.h:25:27: note: candidate template ignored: substitution failure [with Args = <value_type, int, char[4], int, int, int, int>]: non-type template argument is not a constant expression
   25 | [[nodiscard]] std::string StringPrintf(const absl::FormatSpec<Args...>& format,
      |                           ^
```

To fix this the rewriter must use `.data()` to convert the `std::array<char, 4>` into a `char*` for `base::StringPrintf`. A better approach is to change base::StringPrintf to use `absl::string_view` for more type-safety.

Here's what the full patch should look like:

```diff
--- a/net/http/http_util.cc
+++ b/net/http/http_util.cc
@@ -2,6 +2,8 @@
 // Use of this source code is governed by a BSD-style license that can be
 // found in the LICENSE file.
 
+#include <string>
+
 #include <array>
 
 #ifdef UNSAFE_BUFFERS_BUILD
@@ -304,9 +306,9 @@ bool HttpUtil::ParseRetryAfterHeader(const std::string& retry_after_string,
 
 // static
 std::string HttpUtil::TimeFormatHTTP(base::Time time) {
-  static constexpr char kWeekdayName[7][4] = {"Sun", "Mon", "Tue", "Wed",
-                                              "Thu", "Fri", "Sat"};
-  static constexpr char kMonthName[12][4] = {"Jan", "Feb", "Mar", "Apr",
+  constexpr static std::array<std::array<char, 4>, 7> kWeekdayName = {
+      {"Sun"}, {"Mon"}, {"Tue"}, {"Wed"}, {"Thu"}, {"Fri"}, {"Sat"}};
+  constexpr static std::array<std::array<char, 4>, 12> kMonthName = {{"Jan"}, {"Feb"}, {"Mar"}, {"Apr"},
                                               "May", "Jun", "Jul", "Aug",
                                               "Sep", "Oct", "Nov", "Dec"};
   static constexpr int kYear = 1900;
@@ -316,7 +318,7 @@ std::string HttpUtil::TimeFormatHTTP(base::Time time) {
   int year = tm.year + kYear;
   int wday = tm.wday;
 
-  return base::StringPrintf(
+  return base::StringPrintf( // raw_ptr<char> is not convertible to StringPiece
       "%s, %02d %s %d %02d:%02d:%02d GMT",
-      kWeekdayName[wday], tm.day_of_month, kMonthName[tm.month], year, tm.hour,
+      kWeekdayName[wday].data(), tm.day_of_month, kMonthName[tm.month].data(), year, tm.hour,
       tm.minute, tm.second);
 }