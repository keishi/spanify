# Build Failure: 2025_05_02_patch_523

## First error

```
no matching function for call to 'ElementsAreArray'
```

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with gmock matchers.

## Reason
The rewriter converted `kNotificationVibrationPattern` from a C-style array to a `std::array`. The `testing::ElementsAreArray` matcher in gmock has several overloads, but none of them accept a `std::array` directly in this context. The error arises because `ElementsAreArray` expects either a C-style array, a range (begin and end iterators), or an initializer list.

## Solution
The rewriter should recognize when a `std::array` is being used with `testing::ElementsAreArray` and automatically call `.data()` on the `std::array` to pass a raw pointer to the first element of the array, which is compatible with the `ElementsAreArray` overloads. The correct code would be:

```c++
EXPECT_THAT(copied_notification_data.vibration_pattern,
              testing::ElementsAreArray(kNotificationVibrationPattern.data()));
```

## Note
The rewriter also added `.data()` in this line:

```c++
      base::span<const int>(kNotificationVibrationPattern)
          .subspan(std::size(kNotificationVibrationPattern))
          .data());
```

It's unnecessary because `base::span` already can be constructed from `std::array`. The code should be:

```c++
      kNotificationVibrationPattern.data(),
      base::span<const int>(kNotificationVibrationPattern)
          .subspan(std::size(kNotificationVibrationPattern)));