# Build Failure Analysis: 2025_03_19_patch_1006

## First error

../../media/gpu/chromeos/generic_dmabuf_video_frame_mapper.cc:35:10: error: no viable conversion from returned value of type 'uint8_t *' (aka 'unsigned char *') to function return type 'base::span<uint8_t>' (aka 'span<unsigned char>')
   35 |   return static_cast<uint8_t*>(addr);
      |          ^~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The function `Mmap` was spanified.

```c++
-uint8_t* Mmap(const size_t length, const int fd, int permissions) {
+base::span<uint8_t> Mmap(const size_t length, const int fd, int permissions) {
```

Therefore the `return` value must be converted to `base::span<uint8_t>`. To accomplish that, `.data()` must be added to the return value.

## Solution
The code
```c++
   return static_cast<uint8_t*>(addr);
```
should be changed to
```c++
   return base::span<uint8_t>(static_cast<uint8_t*>(addr), length);
```

## Note
There is a secondary error in the logs as well. The code
```c++
plane_addrs[j] = mapped_addr.subspan(planes[j].offset);
```
should be changed to
```c++
plane_addrs[j] = mapped_addr.subspan(planes[j].offset).data();
```
This is an instance of category "Rewriter failed to add `.data()` to a spanified return value."