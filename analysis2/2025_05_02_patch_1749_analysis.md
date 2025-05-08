# Build Failure Analysis: 2025_05_02_patch_1749

## First error

../../net/proxy_resolution/proxy_config_service_linux.cc:441:24: error: no viable conversion from 'gchar **' (aka 'char **') to 'base::span<gchar *>' (aka 'span<char *>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The function `g_settings_get_strv` returns a `gchar**`, which is a pointer to an array of C-style strings.  The rewriter is attempting to directly assign this to a `base::span<gchar*>`, which is not a valid conversion.  `base::span` needs to be constructed with a size and data pointer, but the size information is not available without iterating the `gchar**` array (by searching for the `nullptr` terminator). Because `g_settings_get_strv` is a third party function, the size cannot be determined by the rewriter automatically.

## Solution
The rewriter should generate code that creates a span from the returned `gchar**`, but it is not possible to know the size and it is not possible to rewrite third party code. One option is to create a container type that adopts the pointer and frees it on destruction. Or perhaps the function can be excluded since its third party code.

## Note
The `g_free(list.data());` line is also incorrect. It should be `g_free(list[i]);` inside the loop, and then `g_free(list);` after the loop.