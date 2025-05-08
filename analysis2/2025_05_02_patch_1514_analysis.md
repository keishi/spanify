# Build Failure Analysis: 2025_05_02_patch_1514

## First error

../../chrome/browser/devtools/device/usb/android_usb_browsertest.cc:372:9: error: reinterpret_cast from 'const std::string' (aka 'const basic_string<char>') to 'const uint8_t *' (aka 'const unsigned char *') is not allowed

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter has spanified the variable `body` (which is a `std::string`), but left a `reinterpret_cast` that is applied to it. The `reinterpret_cast` is no longer valid because `body` is now a `base::span<const uint8_t>`.

## Solution
The rewriter needs to remove the reinterpret_cast when it spanifies a variable that is being casted. The `std::string` does not need to be reinterpret_casted to `const uint8_t*` because it can create a `base::span<const uint8_t>`. This can be achieved by changing:

```c++
base::span<const uint8_t> body_head = reinterpret_cast<const uint8_t*>(body);
```

to

```c++
base::span<const uint8_t> body_head = base::make_span(reinterpret_cast<const uint8_t*>(body.data()), body.size());
```

or

```c++
base::span<const uint8_t> body_head = base::as_bytes(base::make_span(body));
```

## Note
None