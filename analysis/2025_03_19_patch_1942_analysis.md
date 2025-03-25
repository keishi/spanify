# Build Failure Analysis: 2025_03_19_patch_1942

## First error

../../chrome/browser/ui/views/permissions/permission_prompt_bubble_one_origin_view_unittest.cc:311:49: error: no matching constructor for initialization of 'const media::AudioDeviceDescription &'

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter changed the type of kMicName to std::array<char, 9>.
```diff
-constexpr char kMicName[] = "mic_name";
+constexpr std::array<char, 9> kMicName{"mic_name"};
```
However, the constructor of `media::AudioDeviceDescription` takes a `std::string` as the first argument.
```c++
../../media/audio/audio_device_description.h:93:3: note: candidate constructor not viable: no known conversion from 'const std::array<char, 9>' to 'std::string' (aka 'basic_string<char>') for 1st argument
   93 |   AudioDeviceDescription(std::string device_name,
```
The fix is to call `.data()` on kMicName to convert it to a `char*` before constructing a `std::string` from it.

## Solution
The rewriter should automatically insert `.data()` when converting a C-style array to std::array in a third_party function call.

The following call site:
```c++
audio_service_.AddFakeInputDeviceBlocking({kMicName, kMicId, kGroupId}));
```

should be rewritten to:
```c++
audio_service_.AddFakeInputDeviceBlocking({std::string(kMicName.data()), kMicId, kGroupId}));
```

## Note
Other errors stem from the same root cause.
```c++
../../chrome/browser/ui/views/permissions/permission_prompt_bubble_one_origin_view_unittest.cc:427:49: error: no matching constructor for initialization of 'const media::AudioDeviceDescription &'