```
# Build Failure Analysis: 2025_03_19_patch_186

## First error

../../remoting/host/linux/remoting_user_session.cc:259:23: error: no viable conversion from 'char **' to 'base::span<char *>'

## Category
Rewriter needs to handle `pam_getenvlist` which returns a null terminated `char**` as a `base::span<char*>`.

## Reason
pam_getenvlist returns a `char **`, which is a null-terminated array of `char *`. This type is not implicitly convertible to `base::span<char*>`, which requires a size. The rewriter replaced the `char **` with a `base::span<char*>` but did not generate any code to determine its size. Additionally comparing that span to `nullptr` is invalid.

## Solution
The rewriter needs to generate code to compute the size of the null-terminated array before constructing the `base::span`. Add code to compute the size of the `environment` before the loop.

```c++
  std::optional<base::EnvironmentMap> GetEnvironment() {
    char** environment = pam_getenvlist(pam_handle_);
    if (environment == nullptr) {
      return std::nullopt;
    }

    // Calculate the size of the environment array.
    size_t env_size = 0;
    while (environment[env_size] != nullptr) {
      ++env_size;
    }

    base::span<char*> environment_span(environment, env_size);
    base::EnvironmentMap environment_map;

    for (char* variable : environment_span) {
      char* delimiter = std::strchr(variable, '=');
      if (delimiter != nullptr) {
        environment_map[std::string(variable, delimiter)] =
            std::string(delimiter + 1);
      }
      std::free(variable);
    }
    std::free(environment);

    return environment_map;
  }
```

## Note
There are errors for comparing to `nullptr` and incrementing the span. This is because the `base::span` has no `operator==` with `nullptr`, and `base::span` cannot be incremented. Adding code to compute its size and loop through it should fix those errors as well.