--- a/src/components/AddRemoveMarginModal/AddRemoveMarginModal.js
+++ b/src/components/AddRemoveMarginModal/AddRemoveMarginModal.js
@@ -12,16 +12,16 @@ class AddRemoveMarginModal extends Component {
         <div>
           <h3>Add/Remove Margin</h3>
           <p>Current {action} margin: {formatCurrency(margin, { maximumFractionDigits: 2 })}</p>
           <p>Available wallet balance: {formatCurrency(walletBalance, { maximumFractionDigits: 2 })}</p>
         </div>
@@ -35,7 +35,7 @@ class AddRemoveMarginModal extends Component {
   render() {
     const { action, margin, walletBalance, formatCurrency } = this.props;
     
     return (
       <div>
         <h3>Add/Remove Margin</h3>
-        <p>Current {action} margin: {formatCurrency(margin, { maximumFractionDigits: 2 })}</p>
-        <p>Available wallet balance: {formatCurrency(walletBalance, { maximumFractionDigits: 2 })}</p>
+        <p>Available margin: {formatCurrency(walletBalance, { maximumFractionDigits: 2 })}</p>
+        <p>Current {action} margin: {formatCurrency(margin, { maximumFractionDigits: 2 })}</p>
+        <p>Available wallet balance: {formatCurrency(walletBalance, { maximumFractionDigits: 2 })}</p>
       </div>
     );
   }
