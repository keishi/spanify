# Build Failure Analysis: 2025_03_19_patch_114

## First error

../../net/proxy_resolution/proxy_config_service_linux.cc:913:28: error: no viable conversion from 'char *' to 'base::span<char>'

## Category
Rewriter failed to handle raw pointer assigned to spanified variable.

## Reason
The code was attempting to assign the result of `strchr(line, '=')`, which is a `char*`, directly to a `base::span<char>`. The rewriter converted `split` to be a `base::span<char>`, but it did not update the assignment to create a span from the `char*`.

## Solution
The rewriter needs to wrap `strchr(line, '=')` in a span to perform the assignment. Check for other raw pointer types assigned to spanified variables. Use `base::make_span` or brace initialization:

```c++
base::span<char> split = base::make_span(strchr(line, '='));
// or
base::span<char> split = {strchr(line, '=')};
```

However it is important to also check if strchr returns `nullptr` and handle this situation. If it can return `nullptr` then the solution should be:

```c++
char* split_ptr = strchr(line, '=');
base::span<char> split = split_ptr ? base::make_span(split_ptr,1) : base::span<char>();
```

It seems the intent was for split to be a span over a single character from that pointer to the = sign. But it could also be `nullptr`.

## Note
The subsequent errors stem from the incorrect type of the `split` variable after the attempted spanification.  The attempted increment `split++` is invalid for a span, and the span is not implicitly convertible to `std::string`.