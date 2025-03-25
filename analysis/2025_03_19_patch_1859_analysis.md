# Build Failure Analysis: 2025_03_19_patch_1859

## First error

../../ui/base/l10n/l10n_util.cc:566:33: error: no viable conversion from 'const gchar *const *' (aka 'const char *const *') to 'base::span<const char *const>'

## Category
Rewriter needs to handle address of a spanified variable passed into a function.

## Reason
The rewriter spanified the `languages` variable. However `g_get_language_names()` returns a `const char* const*`. The rewriter is failing to convert this `const char* const*` into a `base::span<const char* const>`. This can be solved by assigning the return value of `g_get_language_names()` to a temporary variable.

## Solution
The rewriter should generate the following code instead of `base::span<const char* const> languages = g_get_language_names();`:

```c++
const char* const* languages_ptr = g_get_language_names();
base::span<const char* const> languages = languages_ptr;
```

## Note
The code also needs to be updated to iterate through the languages `for (; languages[0]; ++languages)` by accessing the underlying pointer with `languages[0]`. This could be another error category, but is likely caused by the same root cause. The correct code should be

```c++
for (; languages.data()[0]; ++languages) {
    candidates.push_back(base::i18n::GetCanonicalLocale(languages.data()[0]));
  }