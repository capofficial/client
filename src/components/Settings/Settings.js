 const [settings, setSettings] = React.useState({
   theme: 'dark',
   showLiquidationPrice: false,
   showOrders: true,
   showPositions: true,
   showTrades: true
 })
 const [value, setValue] = React.useState(0)
 const toggleSettings = () => {
   setValue(1 - showLiquidationPrice)
 }
 return (
   <div>
     {value === 1 && (
       <div>
         <h2>Settings</h2>
         <div>
           <label>
             <input
               type="checkbox"
               checked={settings.showLiquidationPrice}
               onChange={toggleSettings}
             />
             Show Liquidation Prices
           </label>
         </div>
       </div>
     )
   }
 )