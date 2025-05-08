# Build Failure Analysis: 2025_05_02_patch_1750

## First error

../../net/proxy_resolution/proxy_config_service_linux.cc:922:23: error: no viable conversion from 'std::array<char, BUFFER_SIZE>' to 'std::string' (aka 'basic_string<char>')

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The rewriter arrayified `line` from `char line[BUFFER_SIZE]` to `std::array<char, BUFFER_SIZE> line`. But the code was trying to assign the array to a `std::string`, which requires a `const char*`. The rewriter should have added `.data()` to `line` to make it `line.data()`.

## Solution
The rewriter should add `.data()` to arrayified `char[]` variables when assigning them to `std::string` variables.
```
# Build Failure Analysis: 2025_05_02_patch_1750

## First error

../../net/proxy_resolution/proxy_config_service_linux.cc:922:23: error: no viable conversion from 'std::array<char, BUFFER_SIZE>' to 'std::string' (aka 'basic_string<char>')

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The rewriter arrayified `line` from `char line[BUFFER_SIZE]` to `std::array<char, BUFFER_SIZE> line`. But the code was trying to assign the array to a `std::string`, which requires a `const char*`. The rewriter should have added `.data()` to `line` to make it `line.data()`.

## Solution
The rewriter should add `.data()` to arrayified `char[]` variables when assigning them to `std::string` variables.