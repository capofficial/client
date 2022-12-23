const orderTuple = `tuple(
	uint256 orderId,
	address user,
	address asset,
	string market,
	uint256 margin,
	uint256 size,
	uint256 price,
	uint256 fee,
	bool isLong,
	uint8 orderType,
	bool isReduceOnly,
	uint256 timestamp,
	uint256 expiry,
	uint256 cancelOrderId
)`;

const marketTuple = `tuple(
	string name,
	string category,
	address chainlinkFeed,
	uint256 maxLeverage,
	uint256 maxDeviation,
	uint256 fee,
	uint256 liqThreshold,
	bool allowChainlinkExecution,
	bool isClosed,
	bool isReduceOnly
)`;

const erc20ABI = [
	"function totalSupply() view returns (uint256)",
	"function decimals() view returns (uint8)",
	"function balanceOf(address account) view returns (uint256)",
	"function transfer(address recipient, uint256 amount) returns (bool)",
	"function allowance(address owner, address spender) view returns (uint256)",
	"function approve(address spender, uint256 amount) returns (bool)"
];

export const EVENT_ABIS = [
	`event OrderCreated(
		uint256 indexed orderId,
		address indexed user,
		address indexed asset,
		string market,
		bool isLong,
		uint256 margin,
		uint256 size,
		uint256 price,
		uint256 fee,
		uint8 orderType,
		bool isReduceOnly,
		uint256 expiry,
		uint256 cancelOrderId
	)`,
	`event OrderCancelled(
		uint256 indexed orderId,
		address indexed user,
		string reason
	)`,
	`event PoolDeposit(
        address indexed user, 
        address indexed asset,
        uint256 amount, 
        uint256 clpAmount,
        uint256 poolBalance
    )`,

   `event PoolWithdrawal(
        address indexed user, 
        address indexed asset,
        uint256 amount,  
        uint256 clpAmount,
        uint256 poolBalance
    )`,

    `event PoolPayIn(
    	address indexed user, 
        address indexed asset,
        string market,
        uint256 amount,
        uint256 bufferToPoolAmount,
        uint256 poolBalance,
        uint256 bufferBalance
    )`,

    `event PoolPayOut(
    	address indexed user,
        address indexed asset,
        string market,
        uint256 amount,
        uint256 poolBalance,
        uint256 bufferBalance
    )`,
    `event PositionIncreased(
		uint256 indexed orderId,
		address indexed user,
		address indexed asset,
		string market,
		bool isLong,
		uint256 size,
		uint256 margin,
		uint256 price,
		uint256 positionMargin,
		uint256 positionSize,
		uint256 positionPrice,
		int256 fundingTracker,
		uint256 fee
	)`,

	`event PositionDecreased(
		uint256 indexed orderId,
		address indexed user,
		address indexed asset,
		string market,
		bool isLong,
		uint256 size,
		uint256 margin,
		uint256 price,
		uint256 positionMargin,
		uint256 positionSize,
		uint256 positionPrice,
		int256 fundingTracker,
		uint256 fee,
		int256 pnl,
		int256 fundingFee
	)`,


	`event MarginIncreased(
		address indexed user,
		address indexed asset,
		string market,
		uint256 marginDiff,
		uint256 positionMargin
	)`,

	`event MarginDecreased(
		address indexed user,
		address indexed asset,
		string market,
		uint256 marginDiff,
		uint256 positionMargin
	)`,

	`event FeePaid(
		uint256 indexed orderId,
	    address indexed user,
	    address indexed asset,
	    string market,
	    uint256 fee,
	    uint256 originalFee,
	    uint256 poolFee,
	    uint256 stakingFee,
	    uint256 referrerFee,
	    uint256 oracleFee,
	    bool isLiquidation
	)`,
	`event PositionLiquidated(
		address indexed user,
		address indexed asset,
		string market,
		bool isLong,
		uint256 size,
		uint256 margin,
		uint256 price,
		uint256 fee
	)`
];

export const ABIS = {
	CAP: erc20ABI,
	DataStore: [
		`function getAddress(string key) view returns(address)`
	],
	FundStore: [],
	Funding: [
		`function getAccruedFunding(address asset, string memory market, uint256 intervals) public view returns (int256)`,
	].concat(EVENT_ABIS),
	FundingStore: [
		`function getFundingTracker(address asset, string memory market) view returns(int256)`,
		`function getLastUpdated(address asset, string memory market) external view returns(uint256)`
	],
	Orders: [
		`function submitOrder(${orderTuple}, uint256 tpPrice, uint256 slPrice, string memory refCode) payable`,
		`function cancelOrder(uint256 orderId) external`,
		`function cancelOrders(uint256[] calldata orderIds) external`
	].concat(EVENT_ABIS),
	OrderStore: [
		`function getUserOrders(address user) view returns(${orderTuple}[])`,
	],
	Positions: [
		`function addMargin(address asset, string market, uint256 margin) payable`,
		`function removeMargin(address asset, string market, uint256 margin)`
	].concat(EVENT_ABIS),
	PositionStore: [
		`function getUserPositions(address user) view returns(tuple(
			address user,
			address asset,
			string market,
			bool isLong,
			uint256 size,
			uint256 margin,
			int256 fundingTracker,
			uint256 price,
			uint256 timestamp
		)[])`,
		`function getOI(address asset, string memory market) external view returns(uint256)`
	],
	Pool: [
		`function deposit(address asset, uint256 amount) payable`,
		`function withdraw(address asset, uint256 amount)`,
		`function getDepositFee(address asset) view returns(uint256)`,
		`function getWithdrawFee(address asset) view returns(uint256)`,
	].concat(EVENT_ABIS),
	PoolStore: [
		`function getBalances(address[] _assets) view returns(uint256[] memory)`,
		`function getUserBalances(address[] _assets, address account) external view returns(uint256[] memory)`,
		`function getWithdrawalFee(address asset) external view returns(uint256)`
	],
	Chainlink: [
		'function getPrice(address feed) view returns (uint256)'
	],
	Processor: [
		`function selfExecuteOrder(uint256 orderId)`
	].concat(EVENT_ABIS),
	MarketStore: [
		`function getMarketList() view returns(string[])`,
		`function get(string _market) view returns(${marketTuple})`,
		`function getMany(string[] _markets) view returns(${marketTuple}[])`,
	],
	RebateStore: [
		`function getUserRebate(address user) view returns(uint256)`,
		`function getUserVolume(address user) view returns(uint256)`,
		`function getVolumeRebate(address user) view returns(uint256)`,
		`function getStakingRebate(address user) view returns(uint256)`,
		`function getParams() external view returns(uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256)`
	],
	ReferralStore: [
		`function setReferralCode(string memory code) external`,
		`function getReferralCode(address user) external view returns(string memory)`
	],
	RiskStore: [
		`function getParams(address asset, string memory market) external view returns(uint256,uint256,int256,uint256,int256,uint256)`
	],
	Staking: [
		`function stake(uint256 amount)`,
		`function unstake(uint256 amount)`,
		`function collectMultiple(address[] assets)`,
		`function getClaimableRewards(address[] assets, address account) external view returns(uint256[] memory)`
	],
	StakingStore: [
		`function getTotalSupply() view returns(uint256)`,
		`function getBalance(address account) view returns(uint256)`
	],
	erc20: erc20ABI
};