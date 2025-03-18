```
# Build Failure Analysis: 157

## First error

../../net/http/http_cache_transaction.h:204:5: error: [chromium-style] Complex constructor has an inlined body.

## Category
Rewriter is including system headers inside a C++ class declaration, leading to syntax errors.

## Reason
The spanify tool is adding `#include <array>` in `net/http/http_cache_transaction.h`, which causes the class `ValidationHeaders` to have a complex constructor and needs an explicit out-of-line destructor. This results in a clang style error.

## Solution
Avoid spanifying functions if it requires spanifying excluded code.

## Note
Also there is a second error related to destructor:
`../../net/http/http_cache_transaction.h:203:3: error: [chromium-style] Complex class/struct needs an explicit out-of-line destructor.`