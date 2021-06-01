import checkStakeEnabledGenerator from '@kot-shrodingera-team/germes-generators/stake_info/checkStakeEnabled';
import getStakeCount from './getStakeCount';

// const preCheck = (): boolean => {
//   return true;
// };

const checkStakeEnabled = checkStakeEnabledGenerator({
  // preCheck,
  getStakeCount,
  betCheck: {
    selector: '.sbk-betslip-single__content',
    // errorClasses: [
    //   {
    //     className: '',
    //     message: '',
    //   },
    // ],
  },
  errorsCheck: [
    {
      selector: '.odds__locked',
      // message: '',
    },
  ],
  // context: () => document,
});

export default checkStakeEnabled;
