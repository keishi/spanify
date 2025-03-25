# Build Failure Analysis: 1819

## First error

../../base/trace_event/trace_arguments.h:532:32: error: member reference base type 'char[1]' is not a structure or union
  532 |     return data_ ? data_->chars.data() : nullptr;
      |                    ~~~~~~~~~~~~^~~~~

## Category
Rewriter failing to add `.data()` to a spanified return value.

## Reason
The rewriter attempted to add `.data()` to the `chars` member, but `chars` is now a `std::array<char, N>`, so `.data()` must be called directly on `data_->chars`. However, since the return type is `const char*`, the rewriter is not adding `.data()` to the spanified data() return value.

## Solution
The rewriter must add .data() to the return type of data(). Additionally it needs to ensure that if data_ is nullptr, that an appropriate default span is returned that is compatible with an empty span.

```c++
//Before:
constexpr const char* data() const { return data_ ? data_->chars : nullptr; }
//After:
constexpr const char* data() const { return data_ ? data_->chars.data() : nullptr; }

//Before:
constexpr base::span<char> data() { return data_ ? data_->chars : {}; }
//After:
constexpr base::span<char> data() { return data_ ? base::span(data_->chars.data(), data_->chars.size()) : {}; }

```

## Note
There are several other errors related to this. The first two stem from the fact that the span is not correctly initialized when data_ is nullptr and the next three come from adding `.data()` in some places, but not others.