# Build Failure Analysis: 2025_05_02_patch_1376

## First error

```
../../mojo/core/channel.cc:1036:7: error: reinterpret_cast from 'base::span<const char>' to 'const Message::LegacyHeader *' is not allowed
 1036 |       reinterpret_cast<const Message::LegacyHeader*>(buffer);
      |       ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter has spanified the `buffer` variable to a `base::span<const char>`, but the code still contains a `reinterpret_cast` that attempts to cast the `span` to `const Message::LegacyHeader*`. This is invalid because you cannot directly cast a `span` to a pointer type using `reinterpret_cast`.

## Solution
The rewriter needs to either remove the `reinterpret_cast` entirely and access the data through the `span`'s `.data()` method, or adjust the code to work directly with the `span` without needing to cast it to a raw pointer.

The fix would be to change:
```c++
reinterpret_cast<const Message::LegacyHeader*>(buffer)
```
to
```c++
reinterpret_cast<const Message::LegacyHeader*>(buffer.data())
```

The rewriter should be able to automatically apply that transformation.

## Note
The rest of the errors are follow-up errors caused by the original `reinterpret_cast` failing. They all revolve around trying to use `->` to access members of a `base::span` when `.` should be used instead, or the fact that there is no member `num_bytes` in the span.
```
../../mojo/core/channel.cc:1038:20: error: member reference type 'base::span<const Message::LegacyHeader>' is not a pointer; did you mean to use '.'?
 1038 |   if (legacy_header->num_bytes < sizeof(Message::LegacyHeader)) {
      |       ~~~~~~~~~~~~~^~
      |                    .
```
```
../../mojo/core/channel.cc:1038:22: error: no member named 'num_bytes' in 'base::span<const mojo::core::Channel::Message::LegacyHeader>'
 1038 |   if (legacy_header->num_bytes < sizeof(Message::LegacyHeader)) {
      |       ~~~~~~~~~~~~~  ^
```
```
../../mojo/core/channel.cc:1046:31: error: member reference type 'base::span<const Message::LegacyHeader>' is not a pointer; did you mean to use '.'?
 1046 |     *size_hint = legacy_header->num_bytes - buffer.size();
      |                  ~~~~~~~~~~~~~^~
      |                               .
```
```
../../mojo/core/channel.cc:1051:20: error: member reference type 'base::span<const Message::LegacyHeader>' is not a pointer; did you mean to use '.'?
 1051 |   if (legacy_header->message_type != Message::MessageType::NORMAL_LEGACY) {
      |       ~~~~~~~~~~~~~^~
      |                    .
```
```
../../mojo/core/channel.cc:1060:15: error: member reference type 'base::span<const Message::Header>' is not a pointer; did you mean to use '.'?
 1060 |     if (header->num_header_bytes < sizeof(Message::Header) ||
      |         ~~~~~~^~
      |               .
```
```
../../mojo/core/channel.cc:1061:15: error: member reference type 'base::span<const Message::Header>' is not a pointer; did you mean to use '.'?
 1061 |         header->num_header_bytes > header->num_bytes) {
      |         ~~~~~~^~
      |               .
```
```
../../mojo/core/channel.cc:1061:42: error: member reference type 'base::span<const Message::Header>' is not a pointer; did you mean to use '.'?
 1061 |         header->num_header_bytes > header->num_bytes) {
      |                                    ~~~~~~^~
      |                                          .
```
```
../../mojo/core/channel.cc:1052:14: error: reinterpret_cast from 'base::span<const Message::LegacyHeader>' to 'const Message::Header *' is not allowed
 1052 |     header = reinterpret_cast<const Message::Header*>(legacy_header);
      |              ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~