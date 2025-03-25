# Build Failure Analysis: 2025_03_19_patch_253

## First error

../../chrome/browser/ui/webui/new_tab_page/untrusted_source.cc:109:10: error: no viable conversion from returned value of type 'const std::array<char, 33>' to function return type 'std::string' (aka 'basic_string<char>')

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The rewriter arrayified `chrome::kChromeUIUntrustedNewTabPageUrl` from `char[]` to `std::array`, but the code expects a `std::string`. The `chrome::kChromeUIUntrustedNewTabPageUrl` variable is being returned. The rewriter should recognize this pattern and add `.data()`.

## Solution
The rewriter should add `.data()` to a spanified return value of `std::array<char, 33>`

## Note
The second error in the log is similar:
```
../../chrome/browser/search/background/ntp_custom_background_service.cc:449:5: error: no viable conversion from 'base::span<char>' to 'const char *'
  449 |     GURL timestamped_url(local_string + "?ts=" + time_string);
      |     ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```
This is the "Rewriter needs to add .data() to arrayified `char[]` variable used with std::string." category.