# Build Failure: 2025_05_02_patch_435

## First error

Error: need to run `siso login`: failed to run helper: need to run `gcert`: required key not available

## Category
Rewriter changes signature of main() function.

## Reason
The rewriter transformed the signature of the `main()` function from `int main(int argc, char** argv)` to `int main(int argc, base::span<char*> argv)`. This is problematic as it changes the ABI of the main function, which is specified by the C++ standard. Specifically:
* The program needs to be launched with correct arguments. The OS loader expects `char**` when invoking the `main` function, so using a `base::span` prevents the program from being loaded.
* In particular, the GN action to build the binary and the OS call to execute the binary do not agree on the `main` function signature.

## Solution
The rewriter should avoid transforming the signature of `main()` function since it is special. It should only rewrite the signatures of functions other than `main()`.

## Note
This error appeared in many files in the `base`, `chrome`, `cc`, `chrome/browser`, `components`, `gpu`, `ipc`, `media`, `mojo`, `net`, `pdf`, `remoting`, `sandbox`, `services`, `sql`, `storage`, `testing`, `third_party`, `ui` directories.