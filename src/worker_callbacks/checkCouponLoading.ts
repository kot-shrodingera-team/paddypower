import checkCouponLoadingGenerator from '@kot-shrodingera-team/germes-generators/worker_callbacks/checkCouponLoading';
import {
  log,
  getElement,
  awaiter,
  getRemainingTimeout,
  checkCouponLoadingError,
  checkCouponLoadingSuccess,
  text,
  sendTGBotMessage,
  sleep,
  elementRemoved,
} from '@kot-shrodingera-team/germes-utils';
import { StateMachine } from '@kot-shrodingera-team/germes-utils/stateMachine';

const loaderSelector = '.placing-bets__loading-container';
const errorSelector = '.error__message';
// const betErrorSelector = 'sbk-bet-messages .label';
const betPlacedSelector = '.success-info';

const asyncCheck = async () => {
  const machine = new StateMachine();

  machine.promises = {
    loader: () => getElement(loaderSelector, getRemainingTimeout()),
    error: () => getElement(errorSelector, getRemainingTimeout()),
    betPlaced: () => getElement(betPlacedSelector, getRemainingTimeout()),
  };

  machine.setStates({
    start: {
      entry: async () => {
        log('Начало обработки ставки', 'steelblue');
      },
    },
    loader: {
      entry: async () => {
        log('Появился индикатор', 'steelblue');
        window.germesData.betProcessingAdditionalInfo = 'индикатор';
        delete machine.promises.loader;
        machine.promises.loaderDissappeared = () =>
          awaiter(
            () => document.querySelector(loaderSelector) === null,
            getRemainingTimeout()
          );
      },
    },
    loaderDissappeared: {
      entry: async () => {
        log('Исчез индикатор', 'steelblue');
        window.germesData.betProcessingAdditionalInfo = null;
        delete machine.promises.loaderDissappeared;
      },
    },
    error: {
      entry: async () => {
        log('Появилась ошибка', 'steelblue');
        window.germesData.betProcessingAdditionalInfo = null;
        const errorText = text(machine.data.result);
        log(errorText, 'tomato');
        await sleep(100); // Чтобы на скрине было видно ошибку
        worker.TakeScreenShot(false);
        let knownError = false;
        if (/^The odds have changed/i.test(errorText)) {
          knownError = true;
          log('Изменение коэффициентов', 'crimson');
        } else if (
          /^Your bets have not been placed. Please try again./i.test(errorText)
        ) {
          knownError = true;
        } else if (
          /^This market is currently suspended. Your bets have not been placed./i.test(
            errorText
          )
        ) {
          knownError = true;
          log('Маркет недоступен', 'crimson');
        } else {
          sendTGBotMessage(
            '1786981726:AAE35XkwJRsuReonfh1X2b8E7k9X4vknC_s',
            126302051,
            errorText
          );
        }
        const betCheckbox = document.querySelector<HTMLElement>(
          'sbk-checkbox > .checkbox'
        );
        if (betCheckbox.classList.contains('checkbox--active')) {
          log('Отключаем ставку', 'orange');
          betCheckbox.click();
          const betCheckboxUnchecked = await getElement(
            'sbk-checkbox > .checkbox:not(.checkbox--active)',
            1000
          );
          if (!betCheckboxUnchecked) {
            log('Не дождались отключения ставки', 'crimson');
            sendTGBotMessage(
              '1786981726:AAE35XkwJRsuReonfh1X2b8E7k9X4vknC_s',
              126302051,
              'Не дождались отключения ставки'
            );
            checkCouponLoadingError({
              ...(!knownError && { informMessage: errorText }),
            });
            return;
          }
        } else {
          sendTGBotMessage(
            '1786981726:AAE35XkwJRsuReonfh1X2b8E7k9X4vknC_s',
            126302051,
            'Ставка уже отключена'
          );
        }
        log('Включаем ставку', 'orange');
        betCheckbox.click();
        const betCheckboxChecked = await getElement(
          'sbk-checkbox > .checkbox.checkbox--active',
          1000
        );
        if (!betCheckboxChecked) {
          log('Не дождались включения ставки', 'crimson');
          sendTGBotMessage(
            '1786981726:AAE35XkwJRsuReonfh1X2b8E7k9X4vknC_s',
            126302051,
            'Не дождались включения ставки'
          );
          checkCouponLoadingError({
            ...(!knownError && { informMessage: errorText }),
          });
          return;
        }
        const errorRemoved = await elementRemoved(machine.data.result);
        if (!errorRemoved) {
          log('Ошибка не исчезла', 'crimson');
          sendTGBotMessage(
            '1786981726:AAE35XkwJRsuReonfh1X2b8E7k9X4vknC_s',
            126302051,
            'Ошибка не исчезла'
          );
        } else {
          log('Ошибка исчезла', 'cadetblue', true);
        }
        worker.TakeScreenShot(false);
        checkCouponLoadingError({
          ...(!knownError && { informMessage: errorText }),
        });
      },
      final: true,
    },
    betPlaced: {
      entry: async () => {
        window.germesData.betProcessingAdditionalInfo = null;
        checkCouponLoadingSuccess('Ставка принята');
      },
      final: true,
    },
    timeout: {
      entry: async () => {
        window.germesData.betProcessingAdditionalInfo = null;
        sendTGBotMessage(
          '1786981726:AAE35XkwJRsuReonfh1X2b8E7k9X4vknC_s',
          126302051,
          'Не дождались результата ставки'
        );
        checkCouponLoadingError({
          botMessage: 'Не дождались результата ставки',
          informMessage: 'Не дождались результата ставки',
        });
      },
      final: true,
    },
  });

  machine.start('start');
};

const checkCouponLoading = checkCouponLoadingGenerator({
  asyncCheck,
});

export default checkCouponLoading;
