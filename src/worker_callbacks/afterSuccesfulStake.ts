// import getCoefficientGenerator from '@kot-shrodingera-team/germes-generators/stake_info/getCoefficient';
import { getWorkerParameter, log } from '@kot-shrodingera-team/germes-utils';
import getCoefficient from '../stake_info/getCoefficient';

// const getResultCoefficientText = (): string => {
//   return null;
// };

// const getResultCoefficient = getCoefficientGenerator({
//   coefficientSelector: '',
//   getCoefficientText: getResultCoefficientText,
//   replaceDataArray: [
//     {
//       searchValue: '',
//       replaceValue: '',
//     },
//   ],
//   removeRegex: /[\s,']/g,
//   coefficientRegex: /(\d+(?:\.\d+)?)/,
//   context: () => document,
// });

const getResultCoefficient = getCoefficient;

const afterSuccesfulStake = (): void => {
  if (getWorkerParameter('fakeDoStake')) {
    return;
  }
  log('Обновление итогового коэффициента', 'steelblue');
  const resultCoefficient = getResultCoefficient();
  if (resultCoefficient !== worker.StakeInfo.Coef) {
    log(
      `Коеффициент изменился: ${worker.StakeInfo.Coef} => ${resultCoefficient}`,
      'orange'
    );
    worker.StakeInfo.Coef = resultCoefficient;
    return;
  }
  log('Коеффициент не изменился', 'lightblue');
};

export default afterSuccesfulStake;
