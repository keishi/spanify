# Build Failure Analysis: 2025_03_19_patch_115

## First error

../../net/proxy_resolution/proxy_config_service_linux.cc:921:23: error: no viable conversion from 'std::array<char, BUFFER_SIZE>' to 'std::string' (aka 'basic_string<char>')
  921 |           std::string key = line;
      |                       ^     ~~~~

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The code is trying to assign a `std::array<char, BUFFER_SIZE>` to a `std::string`. The rewriter should add `.data()` to the `line` variable to convert it to a `const char*`, which is compatible with the `std::string` constructor.

## Solution
The rewriter needs to append `.data()` to the variable `line` on line 921 to convert it to `const char*` type.

```c++
-          std::string key = line;
+          std::string key = line.data();
```

## Note
There are other similar errors in the file.
```
../../net/proxy_resolution/proxy_config_service_linux.cc:907:29: error: no matching function for call to 'strncmp'
  907 |           in_proxy_settings = !strncmp(line.data(), "[Proxy Settings]", 16);
      |                                ^~~~~~~
../../net/proxy_resolution/proxy_config_service_linux.cc:924:27: error: no matching function for call to 'strchr'
  924 |           char* split = strchr(line.data(), '=');
      |                           ^~~~~~