@@ -1,8 +1,12 @@
 <script>
   import { onMount } from 'svelte';
-  import { fetchPoolTransactions } from '../../../api/pool';
+  import { fetchPoolTransactions } from '$api/pool';
+  import { InfiniteScroll } from '$lib/ui';
   
   export let data;
-  let transactions = [];
+  let transactions = [];
+  let loading = false;
+  let hasMore = true;
+  let offset = 0;
+  const LIMIT = 50;
   
   onMount(async () => {
-    transactions = await fetchPoolTransactions(data.pool.id);
+    await loadMore();
   });
+
+  async function loadMore() {
+    if (loading || !hasMore) return;
+    loading = true;
+    try {
+      const newTxs = await fetchPoolTransactions(data.pool.id, LIMIT, offset);
+      if (newTxs.length < LIMIT) hasMore = false;
+      transactions = [...transactions, ...newTxs];
+      offset += LIMIT;
+    } finally {
+      loading = false;
+    }
+  }
 </script>
 
-<table class="w-full text-sm">
-  <thead>
-    <tr class="border-b border-gray-700">
-      <th class="text-left py-2">Type</th>
-      <th class="text-left py-2">Amount</th>
-      <th class="text-left py-2">Time</th>
-    </tr>
-  </thead>
-  <tbody>
-    {#each transactions as tx}
-      <tr class="border-b border-gray-800">
-        <td class="py-2">{tx.type}</td>
-        <td class="py-2">{tx.amount}</td>
-        <td class="py-2">{new Date(tx.timestamp).toLocaleString()}</td>
-      </tr>
-    {/each}
-  </tbody>
-</table>
+<InfiniteScroll {loading} {hasMore} on:loadMore={loadMore}>
+  <table class="w-full text-sm">
+    <thead class="bg-gray-900 sticky top-0">
+      <tr class="border-b border-gray-700 text-gray-400 uppercase text-xs">
+        <th class="text-left py-3 px-4">Type</th>
+        <th class="text-right py-3 px-4">Amount</th>
+        <th class="text-right py-3 px-4">Time</th>
+        <th class="text-right py-3 px-4">Hash</th>
+      </tr>
+    </thead>
+    <tbody>
+      {#each transactions as tx}
+        <tr class="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
+          <td class="py-3 px-4 font-medium text-emerald-400">{tx.typeLabel}</td>
+          <td class="py-3 px-4 text-right tabular-nums">{tx.amountFormatted}</td>
+          <td class="py-3 px-4 text-right text-gray-400">{tx.dateFormatted}</td>
+          <td class="py-3 px-4 text-right">
+            <a href="https://etherscan.io/tx/{tx.hash}" target="_blank" class="text-blue-400 hover:underline text-xs">
+              {tx.hash.slice(0,8)}…
+            </a>
+          </td>
+        </tr>
+      {/each}
+    </tbody>
+  </table>
+</InfiniteScroll>
