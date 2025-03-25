# Build Failure Analysis: 2025_03_19_patch_1021

## First error

../../content/browser/notifications/notification_database_conversions_unittest.cc:165:15: error: no matching function for call to 'ElementsAreArray'

## Category
Rewriter needs to avoid spanifying a variable that is being passed to testing::ElementsAreArray.

## Reason
The rewriter arrayified a variable `kNotificationVibrationPattern`, but it is being passed to `testing::ElementsAreArray`. The rewriter should recognize this pattern and not rewrite this variable.

## Solution
The rewriter should avoid arrayifying variables that are passed to `testing::ElementsAreArray`.

## Note
There are multiple locations where this error happens.