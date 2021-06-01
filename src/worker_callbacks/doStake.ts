import doStakeGenerator from '@kot-shrodingera-team/germes-generators/worker_callbacks/doStake';
import { log } from '@kot-shrodingera-team/germes-utils';
import getCoefficient from '../stake_info/getCoefficient';

const preCheck = (): boolean => {
  const errorMessage = document.querySelector(
    '.sbk-betslip-bet__messages--error'
  );
  if (errorMessage) {
    log('Есть ошибка в купоне. Ставку не делаем', 'crimson');
    log(errorMessage.textContent, 'tomato');
    return false;
  }
  return true;
};

// const postCheck = (): boolean => {
//   return true;
// };

const doStake = doStakeGenerator({
  preCheck,
  doStakeButtonSelector: '.place-bet-button',
  // errorClasses: [
  //   {
  //     className: '',
  //     message: '',
  //   },
  // ],
  disabledCheck: true,
  getCoefficient,
  // postCheck,
  // context: () => document,
});

export default doStake;
