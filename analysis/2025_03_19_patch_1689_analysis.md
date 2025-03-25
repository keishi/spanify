# Build Failure Analysis: 2025_03_19_patch_1689

## First error

../../content/public/browser/webui_config.h:80:12: error: no matching constructor for initialization of 'content::DefaultWebUIConfig<FlagsUI>'
   80 |   explicit DefaultWebUIConfig(std::string_view scheme, std::string_view host)

## Category
Rewriter needs to add .data() to arrayified variable used with std::string.

## Reason
The code was constructing a `DefaultWebUIConfig` with `chrome::kChromeUIFlagsHost`, which was converted to `std::array<char, 6>`. `DefaultWebUIConfig` expects a `std::string_view` as the second argument.  The rewriter needs to add `.data()` to the array to convert it to a `char*` which can then implicitly convert to `std::string_view`.

## Solution
The rewriter needs to identify when an arrayified `char[]` variable is being used in a context where a `char*` or `std::string_view` is expected and add `.data()` to the variable.

## Note
The diff shows two instances where `kChromeUIFlagsHost.data()` is added. The other instance is in `chrome/browser/ui/webui/chrome_web_ui_controller_factory.cc`, which is also needed.