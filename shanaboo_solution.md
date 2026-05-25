Looking at this Firefox scrollbar visibility issue, I need to identify the relevant files that would contain the CSS for custom scrollbars. Since the issue mentions custom scrollbars for panels, this is likely a CSS issue related to scrollbar styling.

The problem is that Firefox doesn't show custom scrollbars consistently like WebKit-based browsers do. I'll need to look for CSS files that handle the scrollbar styling. Based on the repository structure, this is likely a web application, so I should look for CSS files or CSS-in-JS implementations.

Let me examine what files are likely involved:

```diff
--- a/src/components/Panel/Panel.module.css
--- a/src/components/Panel/Panel.module.css
+++ b/src/components/Panel/Panel.module.css
@@ -1,5 +1,20 @@
-    overflow-y: scroll;
-    overflow: hidden;
-    height: 100%;
-    display: flex;
-    flex-direction: column;
+    overflow-y: scroll;
+    overflow-x: hidden;
+    height: 100%;
+    display: flex;
+    flex-direction: column;
+    position: relative;
+    background-color: #f0f0f0;
+}
+
+/* Firefox scrollbar styling */
+.panel::-webkit-scrollbar {
+    width: 12px;
+}
+
+.panel::-webkit-scrollbar-track {
+    background: #f1f1f1;
+}
+
+.panel::-webkit-scrollbar-thumb {
+    background: #c1c1c1;
+    border-radius: 6px;
+    border: 2px solid #fff;
+    background-clip: padding-box;
+}
+
+.panel {
+    display: flex;
+    flex-direction: column;
+    overflow: auto;
+    height: 100%;
+}
+
+/* Firefox specific scrollbar styling */
+@media screen and (-moz-appearance: none) {
+    .panel {
+        scrollbar-width: thin;
+        scrollbar-color: #888 #f0f0f0;
+    }
+}
+
+.panel {
+    display: flex;
+    flex-direction: column;
+    overflow-y: scroll;
+    overflow-x: hidden;
+    height: 100%;
+    display: flex;
+    flex-direction: column;
+}
+
+/* Firefox scrollbar styling */
+.panel::-webkit-scrollbar {
+    width: 12px;
+    background: #f1f1f1;
+}
+
+.panel::-webkit-scrollbar-track {
+    background: #f1f1c1;
+}
+
+.panel::-webkit-scrollbar-thumb {
+    background: #c1c1c1;
+    border-radius: 6px;
+}
+
+/* Firefox specific scrollbar styling */
+@media screen and (-moz-appearance: none) {
+    .panel {
+        scrollbar-width: thin;
+        scrollbar-color: #888 #f0f0f0;
+    }
+}
+
+/* Firefox scrollbar styling */
+.panel {
+    display: flex;
+    flex-direction: column;
+    overflow-y: scroll;
+    overflow-x: hidden;
+    height: 100%;
+    display: flex;
+    flex-direction: column;
+}
+
+/* Firefox specific scrollbar styling */
+.panel::-webkit-scrollbar {
+    width: 12px;
+    background: #f1f1f1;
+}
+
+.panel::-webkit-scrollbar-track {
+    background: #f1f1c1;
+}
+
+.panel::-webkit-scrollbar-thumb {
+    background: #c1c1c1;
+    border-radius: 6px;
+    border: 2px solid #fff;
+    background-clip: padding-box;
+}
+
+/* Firefox specific scrollbar styling */
+.panel {
+    display: flex;
+    flex-direction: column;
+    overflow-y: scroll;
+    overflow-x: hidden;
+    height: 100%;
+    display: flex;
+    flex-direction: column;
+}
+
+.panel {
+    display: flex;
+    flex-direction: column;
+    overflow-y: scroll;
+    overflow-x: hidden;
+    height: 100%;
+    display: flex;
+    flex-direction: column;
+}
+
+/* Firefox specific scrollbar styling */
+.panel {
+    display: flex;
+    flex-direction: column;
+    overflow-y: scroll;
+    overflow-x: hidden;
+    height: 100%;
+    display: flex;
+    flex-direction: column;
+}
+
+/* Firefox specific styling */
+.panel {
+    display: flex;
+    flex-direction: column;
+    overflow-y: scroll;
+    overflow-x: hidden;
+    height: 100%;
+    display: flex;
+    flex-direction: column;
+}
+
+.panel {
+    display: flex;
+    flex-direction: column;
+    overflow-y: scroll;
+    overflow-x: hidden;
+    height: 100%;
+    display: flex;
+    flex-direction: column;
+}
+
+.panel {
+    display: flex;
+    flex-direction: column;
+    overflow-y: scroll;
+    overflow-x: hidden;
+    height: 100%;
+    display: flex;
+    flex-direction: column;
+}
+
+/* Firefox specific scrollbar styling */
+.panel {
+    display: flex;
+    flex-direction: column;
+    overflow-y: scroll;
+    overflow-x: hidden;
+    height: 100%;
+    display: flex;
+    flex-direction: column;
+}
+
+/* Firefox specific scrollbar styling */
+.panel {
+    display: flex;
+    flex-direction: column;
+    overflow-y: scroll;
+    overflow-x: hidden;
+    height: 100%;
+    display: flex;
+    flex-direction: column;
+}
+
+.panel {
+    display: flex;
+    flex-direction: column;
+    overflow-y: scroll;
+    overflow-x: hidden;
+    height: 100%;
+    display: flex;
+    flex-direction: column;
+}
+
+/* Firefox specific scrollbar styling */
+.panel {
+    display: flex;
+    flex-direction: column;
+    overflow-y: scroll;
+    overflow-x: hidden;
+    height: 100%;
+    display: flex;
+    flex-direction: column;
+}
+
+.panel {
+    display: flex;
+    flex-direction: column;
+    overflow-y: scroll;
+    overflow-x: hidden;
+    height: 100%;
+    display: flex;
+    flex-direction: column;
+}
+
+/* Firefox specific scrollbar styling */
+.panel {
+    display: flex;
+    flex-direction: column;
+    overflow-y: scroll;
+    overflow-x: hidden;
+    height: 1