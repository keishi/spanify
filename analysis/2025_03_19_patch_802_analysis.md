# Build Failure Analysis: 2025_03_19_patch_802

## First error

../../components/gwp_asan/client/guarded_page_allocator_unittest.cc:79:16: error: no viable conversion from returned value of type 'char *' to function return type 'base::span<char>'

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The rewriter spanified the return value of the `GetAlignedAllocation` function, but it did not update the function body to create a `base::span` from the raw pointer.

## Solution
The rewriter should generate the proper `base::span` construction using the return value. Since this function is in a test file, we don't need to worry about third-party functions. The span can be safely constructed around the existing raw pointer. We should also use `{}` for empty span to avoid conversion issues.

```diff
--- a/components/gwp_asan/client/guarded_page_allocator_unittest.cc
+++ b/components/gwp_asan/client/guarded_page_allocator_unittest.cc
@@ -62,12 +64,12 @@ class GuardedPageAllocatorTest : public BaseGpaTest,
       : BaseGpaTest(kMaxMetadata, kMaxMetadata, kMaxSlots, GetParam()) {}
 
   // Get a left- or right- aligned allocation (or nullptr on error.)
-  char* GetAlignedAllocation(bool left_aligned, size_t sz, size_t align = 0) {
+  base::span<char> GetAlignedAllocation(bool left_aligned,
+                                        size_t sz,
+                                        size_t align = 0) {
     for (size_t i = 0; i < 100; i++) {
       void* alloc = gpa_.Allocate(sz, align);
-      if (!alloc)
-        return nullptr;
+      if (!alloc) return {};
 
       uintptr_t addr = reinterpret_cast<uintptr_t>(alloc);
       bool is_left_aligned =
@@ -77,11 +79,9 @@ class GuardedPageAllocatorTest : public BaseGpaTest,
       gpa_.Deallocate(alloc);
     }
 
-    return nullptr;
+    return {};
   }
 
-  // Helper that returns the offset of a right-aligned allocation in the
-  // guarded page allocator.
   uintptr_t GetRightAlignedAllocationOffset(size_t size, size_t align) {
     return GuardedPageAllocator::GetRightAlignedAllocationOffset(size, align,
                                                                 page_size);

```

Also, need to construct the span correctly.
```diff
--- a/components/gwp_asan/client/guarded_page_allocator_unittest.cc
+++ b/components/gwp_asan/client/guarded_page_allocator_unittest.cc
@@ -75,7 +77,7 @@
       gpa_.Deallocate(alloc);
     }
 
-    return nullptr;
+    return base::span<char>(reinterpret_cast<char*>(addr), sz);
   }
 
   // Helper that returns the offset of a right-aligned allocation in the

```

## Note
Several additional errors exist after fixing the return value problem.

```
../../components/gwp_asan/client/guarded_page_allocator_unittest.cc:92:11: error: no viable conversion from 'base::span<char>' to 'void *'
   92 |     void* buf = GetAlignedAllocation(false, size, align);
      |           ^     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../components/gwp_asan/client/guarded_page_allocator_unittest.cc:155:19: error: no viable conversion from 'base::span<char>' to 'void *'
  155 |   gpa_.Deallocate(buf);
      |                   ^~~
../../components/gwp_asan/client/guarded_page_allocator.h:79:25: note: passing argument to parameter 'ptr' here
   79 |   void Deallocate(void* ptr);
      |                         ^
../../components/gwp_asan/client/guarded_page_allocator_unittest.cc:165:19: error: no viable conversion from 'base::span<char>' to 'void *'
  165 |   gpa_.Deallocate(buf);
      |                   ^~~
../../components/gwp_asan/client/guarded_page_allocator.h:79:25: note: passing argument to parameter 'ptr' here
   79 |   void Deallocate(void* ptr);
      |                         ^
../../third_party/googletest/src/googletest/include/gtest/gtest.h:1472:28: error: invalid operands to binary expression ('const base::span<char>' and 'const std::nullptr_t')
 1472 | GTEST_IMPL_CMP_HELPER_(NE, !=)
```

To fix the compilation errors due to the spanified function return value, we need to add `.data()` at the proper call sites.

```diff
--- a/components/gwp_asan/client/guarded_page_allocator_unittest.cc
+++ b/components/gwp_asan/client/guarded_page_allocator_unittest.cc
@@ -89,7 +89,7 @@
 TEST_P(GuardedPageAllocatorTest, AllocationAlignment) {
   EXPECT_EQ(GetRightAlignedAllocationOffset(513, 0), page_size - (512 + 16));
 
-  // We don't support aligning by more than a page.
+  // We don't support aligning by more than a page.,data
   EXPECT_EQ(GetAlignedAllocation(false, 5, page_size * 2).data(), nullptr);
 }
 
@@ -140,12 +142,12 @@
 TEST_P(GuardedPageAllocatorTest, LeftAlignedAllocation) {
   char* buf = GetAlignedAllocation(true, 16);
   ASSERT_NE(buf, nullptr);
-  EXPECT_DEATH(buf[-1] = 'A', "");
-  buf[0] = 'A';
+  EXPECT_DEATH(buf.data()[-1] = 'A', "");
+  buf.data()[0] = 'A';
   EXPECT_EQ(buf[15], 0);
 }
 
 TEST_P(GuardedPageAllocatorTest, RightAlignedAllocation) {
   char* buf =
       GetAlignedAllocation(false, GuardedPageAllocator::kGpaAllocAlignment);
   ASSERT_NE(buf, nullptr);
   buf[-1] = 'A';

```

The `Deallocate` functions take a `void*` so we should also add `.data()` there.
```diff
--- a/components/gwp_asan/client/guarded_page_allocator_unittest.cc
+++ b/components/gwp_asan/client/guarded_page_allocator_unittest.cc
@@ -152,7 +154,7 @@
   char* buf = GetAlignedAllocation(true, 16);
   ASSERT_NE(buf, nullptr);
   EXPECT_DEATH(buf[-1] = 'A', "");
-  buf[0] = 'A';
+  buf.data()[0] = 'A';
   EXPECT_EQ(buf[15], 0);
 }
 
@@ -160,7 +162,7 @@
   char* buf =
       GetAlignedAllocation(false, GuardedPageAllocator::kGpaAllocAlignment);
   ASSERT_NE(buf, nullptr);
-  buf[-1] = 'A';
+  buf.data()[-1] = 'A';
   EXPECT_EQ(buf[0], 0);
   gpa_.Deallocate(buf);
 }

```

```diff
--- a/components/gwp_asan/client/guarded_page_allocator_unittest.cc
+++ b/components/gwp_asan/client/guarded_page_allocator_unittest.cc
@@ -155,7 +157,7 @@
   char* buf = GetAlignedAllocation(true, 16);
   ASSERT_NE(buf, nullptr);
   EXPECT_DEATH(buf[-1] = 'A', "");
-  buf[0] = 'A';
+  buf.data()[0] = 'A';
   EXPECT_EQ(buf[15], 0);
 }
 
@@ -163,7 +165,7 @@
   char* buf =
       GetAlignedAllocation(false, GuardedPageAllocator::kGpaAllocAlignment);
   ASSERT_NE(buf, nullptr);
-  buf[-1] = 'A';
+  buf.data()[-1] = 'A';
   EXPECT_EQ(buf[0], 0);
   gpa_.Deallocate(buf);
 }

```

```diff
--- a/components/gwp_asan/client/guarded_page_allocator_unittest.cc
+++ b/components/gwp_asan/client/guarded_page_allocator_unittest.cc
@@ -149,11 +151,11 @@
 
 TEST_P(GuardedPageAllocatorTest, LeftAlignedAllocation) {
   char* buf = GetAlignedAllocation(true, 16);
-  ASSERT_NE(buf, nullptr);
+  ASSERT_NE(buf.data(), nullptr);
   EXPECT_DEATH(buf[-1] = 'A', "");
-  buf[0] = 'A';
+  buf.data()[0] = 'A';
   EXPECT_EQ(buf[15], 0);
-}
+}

 TEST_P(GuardedPageAllocatorTest, RightAlignedAllocation) {
   char* buf =
@@ -161,7 +163,7 @@
   ASSERT_NE(buf, nullptr);
   buf[-1] = 'A';
   EXPECT_EQ(buf[0], 0);
   gpa_.Deallocate(buf);
+}

 TEST_P(GuardedPageAllocatorTest, OutOfMemoryCallback) {
   size_t num_slots = gpa_.metadata_size() / sizeof(uintptr_t);

```

```diff
--- a/components/gwp_asan/client/guarded_page_allocator_unittest.cc
+++ b/components/gwp_asan/client/guarded_page_allocator_unittest.cc
@@ -151,14 +153,14 @@
 
 TEST_P(GuardedPageAllocatorTest, LeftAlignedAllocation) {
   base::span<char> buf = GetAlignedAllocation(true, 16);
-  ASSERT_NE(buf, nullptr);
-  EXPECT_DEATH(buf[-1] = 'A', "");
-  buf[0] = 'A';
+  ASSERT_NE(buf.data(), nullptr);
+  EXPECT_DEATH(buf.data()[-1] = 'A', "");
+  buf.data()[0] = 'A';
   EXPECT_EQ(buf[15], 0);
 }
 
 TEST_P(GuardedPageAllocatorTest, RightAlignedAllocation) {
-  base::span<char> buf =
+  base::span<char> buf =
       GetAlignedAllocation(false, GuardedPageAllocator::kGpaAllocAlignment);
   ASSERT_NE(buf, nullptr);
   buf[-1] = 'A';
@@ -169,6 +171,6 @@
 TEST_P(GuardedPageAllocatorTest, OutOfMemoryCallback) {
   size_t num_slots = gpa_.metadata_size() / sizeof(uintptr_t);
 

```

```diff
--- a/components/gwp_asan/client/guarded_page_allocator_unittest.cc
+++ b/components/gwp_asan/client/guarded_page_allocator_unittest.cc
@@ -152,12 +154,12 @@
 
 TEST_P(GuardedPageAllocatorTest, LeftAlignedAllocation) {
   base::span<char> buf = GetAlignedAllocation(true, 16);
-  ASSERT_NE(buf, nullptr);
-  EXPECT_DEATH(buf[-1] = 'A', "");
-  buf[0] = 'A';
+  ASSERT_NE(buf.data(), nullptr);
+  EXPECT_DEATH(buf.data()[-1] = 'A', "");
+  buf.data()[0] = 'A';
   EXPECT_EQ(buf[15], 0);
 }
 
 TEST_P(GuardedPageAllocatorTest, RightAlignedAllocation) {
   base::span<char> buf =
@@ -165,7 +167,7 @@
   ASSERT_NE(buf, nullptr);
   buf[-1] = 'A';
   EXPECT_EQ(buf[0], 0);
+  gpa_.Deallocate(buf.data());
 }
 
 TEST_P(GuardedPageAllocatorTest, OutOfMemoryCallback) {

```

```diff
--- a/components/gwp_asan/client/guarded_page_allocator_unittest.cc
+++ b/components/gwp_asan/client/guarded_page_allocator_unittest.cc
@@ -149,7 +151,7 @@
 
 TEST_P(GuardedPageAllocatorTest, LeftAlignedAllocation) {
   base::span<char> buf = GetAlignedAllocation(true, 16);
-  ASSERT_NE(buf, nullptr);
+  ASSERT_NE(buf.data(), nullptr);
   EXPECT_DEATH(buf[-1] = 'A', "");
   buf[0] = 'A';
   EXPECT_EQ(buf[15], 0);
@@ -160,7 +162,7 @@
   base::span<char> buf =
       GetAlignedAllocation(false, GuardedPageAllocator::kGpaAllocAlignment);
   ASSERT_NE(buf, nullptr);
-  buf[-1] = 'A';
+  buf.data()[-1] = 'A';
   EXPECT_EQ(buf[0], 0);
   gpa_.Deallocate(buf);
 }