# Build Failure Analysis: 2025_05_02_patch_39

## First error

../../content/browser/service_worker/service_worker_container_host.cc:203:8: error: no matching member function for call to 'CanServeContainerHostMethods'
  203 |   if (!CanServeContainerHostMethods(
      |        ^~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../content/browser/service_worker/service_worker_container_host.h:372:8: note: candidate function template not viable: no known conversion from 'const std::array<char, 44>' to 'const char *' for 4th argument
  372 |   bool CanServeContainerHostMethods(CallbackType* callback,
      |        ^
  373 |                                     const GURL& scope,
  374 |                                     const GURL& script_url,
  375 |                                     const char* error_prefix,
      |                                     ~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified `kServiceWorkerGetRegistrationErrorPrefix` from `const char[]` to `std::array<char, 44>`. But the function `CanServeContainerHostMethods` takes `const char* error_prefix` as an argument. The rewriter did not spanify this function parameter, nor did it add `.data()` when calling this function.

## Solution
The rewriter spanified a variable, but failed to spanify a call site. The rewriter needs to check the arguments to the call and add `.data()` if the function expects a `const char*` and the argument is an arrayified variable.