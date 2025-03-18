# Build Failure Analysis: 15

## First error

../../content/browser/notifications/notification_database_conversions_unittest.cc:165:15: error: no matching function for call to 'ElementsAreArray'
  165 |               testing::ElementsAreArray(kNotificationVibrationPattern.data()));
      |               ^~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to handle .data() to arrayified `char[]` variable used with `testing::ElementsAreArray`.

## Reason
The original code uses a C-style array, `kNotificationVibrationPattern`, with `testing::ElementsAreArray`. The rewriter converts the array to `std::array`, which requires `.data()` to be used when passing it to `testing::ElementsAreArray`.

## Solution
The rewriter needs to add `.data()` when an arrayified `char[]` variable is passed to a function that takes `const value_type*`.

The rewriter should identify that `kNotificationVibrationPattern` is now a `std::array` and automatically insert the `.data()` call.

## Note
The code changes also adjusted line 55 to use `.data()` and `.subspan()` calls when initializing the `vibration_pattern` vector to enable it to compile.