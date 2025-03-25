# Build Failure Analysis: 2025_03_19_patch_830

## First error

../../net/http/http_util.cc:312:7: error: suggest braces around initialization of subobject [-Werror,-Wmissing-braces]

## Category
Rewriter dropped mutable qualifier.

## Reason
The original code had a `static constexpr char kMonthName[12][4]` variable. But the rewriter arrayified it into `constexpr static std::array<std::array<char, 4>, 12> kMonthName`. The original code was probably relying on array decay from `char[4]` to `char*` which worked with base::StringPrintf. However, the rewriter didn't add .data() so base::StringPrintf received std::array<char, 4> which is not supported.

## Solution
The rewriter should add .data() to arrayified char[] variable used with std::string.

## Note
There are other errors later in the build log, but they all seem to be related to this root cause.