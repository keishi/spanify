# Build Failure Analysis: 2025_03_19_patch_616

## First error

../../gpu/command_buffer/client/share_group.h:45:1: error: [chromium-style] Complex class/struct needs an explicit out-of-line constructor.
   45 | class ShareGroupContextData {
      | ^

## Category
Rewriter is including system headers inside a C++ class declaration, leading to syntax errors.

## Reason
The rewriter added `#include <array>` inside the class definition which violates Chromium's style guidelines. 

## Solution
The rewriter should avoid including new headers inside class declarations. It should include the header outside of the class definition.
```c++
 #include <array>
 
 class ShareGroupContextData {
```

## Note
The build log contains another error:
```
../../gpu/command_buffer/client/share_group.h:45:1: error: [chromium-style] Complex class/struct needs an explicit out-of-line destructor.