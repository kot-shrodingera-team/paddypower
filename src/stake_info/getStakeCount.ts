import getStakeCountGenerator from '@kot-shrodingera-team/germes-generators/stake_info/getStakeCount';

const getStakeCount = getStakeCountGenerator({
  stakeSelector: '.sbk-betslip-single__content',
  // context: () => document,
});

export default getStakeCount;
