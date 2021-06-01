declare global {
  // interface GermesData {}
}

export const clearGermesData = (): void => {
  window.germesData = {
    bookmakerName: 'PaddyPower',
    minimumStake: undefined,
    maximumStake: undefined,
    betProcessingStep: undefined,
    betProcessingAdditionalInfo: undefined,
    doStakeTime: undefined,
    betProcessingTimeout: 50000,
    stakeDisabled: undefined,
    stopBetProcessing: () => {
      window.germesData.betProcessingStep = 'error';
      window.germesData.stakeDisabled = true;
    },
  };
};

export default {};
