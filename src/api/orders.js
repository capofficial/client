export async function submitOrder() {

   submittingOrder.set(true);

   const contract = await getContract('Orders', true);

   const market = get(selectedMarket);
   const marketInfo = get(selectedMarketInfo);

   const _asset = get(selectedAsset);
   const asset = getAssetAddress(_asset);
   const assetDecimals = CURRENCY_DECIMALS[_asset];

   const _isLong = get(isLong);

   let cleaningDecimals = 10;
   if (_asset == 'USDC') {
      cleaningDecimals = 6;
   }
   let marginCleaned = (Math.ceil(get(margin) * 10**cleaningDecimals) / 10**cleaningDecimals).toFixed(cleaningDecimals);
   let sizeCleaned = (Math.floor(get(size) * 10**cleaningDecimals) / 10**cleaningDecimals).toFixed(cleaningDecimals);

   let leverage = 1 * sizeCleaned / marginCleaned;
   if (leverage > marketInfo.maxLeverage * 1) {
      marginCleaned = (marginCleaned * 1.0003).toFixed(cleaningDecimals);
   }

   let _margin = parseUnits(marginCleaned, assetDecimals);
   const _size = parseUnits(sizeCleaned, assetDecimals);

   let _priceRaw = get(price);
   let _price = parseUnits(_priceRaw);
   const _hasTrigger = get(hasTrigger);
   const _isReduceOnly = get(isReduceOnly);
   const _isProtectedOrder = get(isProtectedOrder);

   if (!_hasTrigger && !_isProtectedOrder) {
      _price = parseUnits(0);
   }

   if (_isReduceOnly) {
      _margin = parseUnits(0);
   }

   let orderType = 0;
   if (_hasTrigger && _priceRaw * 1 > 0) {
      const currentPrice = get(prices)[market];
      if (_isLong && _priceRaw * 1 <= currentPrice * 1 || !_isLong && _priceRaw * 1 >= currentPrice * 1) {
         orderType = 1;
      } else if (_isLong && _priceRaw * 1 >= currentPrice * 1|| !_isLong && _priceRaw * 1 <= currentPrice * 1) {
         orderType = 2;
      }
   }

   let value = '';
   if (_asset == 'ETH') {
      const feeAmount = _size.mul(marketInfo.fee).div(BPS_DIVIDER);
      value = _margin.add(feeAmount);
      if (get(tpPrice)) {
         value = value.add(feeAmount);
      }
      if (get(slPrice)) {
         value = value.add(feeAmount);
      }
   }

   let tpPriceValue = get(tpPrice);
   let slPriceValue = get(slPrice);

   if (tpPriceValue !== null && tpPriceValue !== undefined) {
      if (tpPriceValue < 0) {
         throw new Error('tpPrice cannot be negative');
      }
      if (tpPriceValue > Number.MAX_SAFE_INTEGER) {
         throw new Error('tpPrice is too large');
      }
   }

   if (slPriceValue !== null && slPriceValue !== undefined) {
      if (slPriceValue < 0) {
         throw new Error('slPrice cannot be negative');
      }
      if (slPriceValue > Number.MAX_SAFE_INTEGER) {
         throw new Error('slPrice is too large');
      }
   }

   try {
      let tx, receipt;

      const orderTuple = createOrderTuple({
         market,
         asset,
         isLong: _isLong,
         margin: _margin,
         size: _size,
         price: _price,
         orderType,
         isReduceOnly: _isReduceOnly
      });

      tx = await contract.submitOrder(orderTuple, parseUnits(tpPriceValue), parseUnits(slPriceValue), {value: value});

      receipt = await tx.wait();

      if (receipt && receipt.status == 1) {
         orderSubmitted();
         return true;
      }

   } catch(e) {
      showError(e);
   }

   submittingOrder.set(false);

}