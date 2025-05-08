# Build Failure: 2025_05_02_patch_1181

## First error

```
../../storage/browser/file_system/dump_file_system.cc:178:5: error: second parameter of 'main' (argument array) must be of type 'char **'
  178 | int main(int argc, base::span<char*> argv) {
      |     ^
```

## Category
Rewriter spanified main function.

## Reason
The rewriter should not modify the main function signature. The signature must be `int main(int argc, char* argv[])` or `int main()`.

## Solution
The rewriter should avoid spanifying the main function.

## Note
The code also tries to increment the span. It makes no sense because a span is not a pointer. The error messages are:
```
../../storage/browser/file_system/dump_file_system.cc:187:11: error: cannot increment value of type 'base::span<char *>'
  187 |       argv++;
      |       ~~~~^
../../storage/browser/file_system/dump_file_system.cc:191:11: error: cannot increment value of type 'base::span<char *>'
  191 |       argv++;
      |       ~~~~^
../../storage/browser/file_system/dump_file_system.cc:195:11: error: cannot increment value of type 'base::span<char *>'
  195 |       argv++;
      |       ~~~~^