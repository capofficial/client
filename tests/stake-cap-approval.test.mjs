import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const stakeModal = readFileSync(resolve(__dirname, '../src/components/modals/StakeCAP.svelte'), 'utf8');
const capApi = readFileSync(resolve(__dirname, '../src/api/cap.js'), 'utf8');

assert.match(
	stakeModal,
	/const CAP_APPROVAL_SPENDER = 'Staking';/,
	'Stake CAP approval should target the same Staking contract used by depositCAP.'
);

assert.match(
	stakeModal,
	/getAllowance\('CAP', CAP_APPROVAL_SPENDER\)/,
	'Stake CAP allowance checks should use the staking approval spender.'
);

assert.match(
	stakeModal,
	/approveAsset\('CAP', CAP_APPROVAL_SPENDER\)/,
	'Stake CAP approval transactions should use the staking approval spender.'
);

assert.doesNotMatch(
	stakeModal,
	/FundStore/,
	'Stake CAP modal must not use FundStore for CAP approval.'
);

assert.match(
	stakeModal,
	/isAllowancePending/,
	'Stake CAP modal should keep the approval path pending while allowance is loading.'
);

assert.match(
	stakeModal,
	/isLoading=\{isCheckingAllowance \|\| isApproving\}/,
	'Approve CAP button should show a loading state during allowance checks and approval transactions.'
);

assert.match(
	stakeModal,
	/if \(success\) \{\s+await checkAllowance\(\);\s+await getBalance\(\);/s,
	'Stake CAP modal should refresh allowance and wallet balance after approval succeeds.'
);

assert.match(
	capApi,
	/getContract\('Staking', true\)/,
	'depositCAP should continue staking through the Staking contract.'
);
