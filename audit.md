### Summary

YUAN has made some improvements based on YAM:

- Pegged to 1 CNY instead of 1 USD.
- Build more treasuries (10% USDx, 5% Liquidity, 5% Lending) for future protocol incentives.
- Initial staking pools support automatically reward halving by a preset interval.

### Audit Scope

- YUANUSDxUSDCPool.sol
- YUANRebaser.sol

### Audit Target

- Assets Security
  Whether users' asset is secure or vulnerable to any kind of attack.

- Rebase Process
  Whether the rebase process is properly designed and implemented, especially the additional logic added into rebase.

- Upgradeability
  Whether the whole protocol can be properly upgraded by governance for future evolution.
