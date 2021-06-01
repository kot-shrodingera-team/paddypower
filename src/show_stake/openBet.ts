import {
  getElement,
  log,
  repeatingOpenBet,
  ri,
  text,
} from '@kot-shrodingera-team/germes-utils';
import { JsFailError } from '@kot-shrodingera-team/germes-utils/errors';
import getBalance from '../stake_info/getBalance';
import getStakeCount from '../stake_info/getStakeCount';
import setStakeSum from '../worker_callbacks/setStakeSum';
import clearCoupon from './clearCoupon';

const customCompare = (outrightName: string, comment: string) => {
  return ri`${comment}(\s\([-+]?(\d+(\.\d+)?)\))?$`.test(outrightName);
};

const openBet = async (): Promise<void> => {
  /* ===============
  | Очистка купона |
  =============== */

  const couponCleared = await clearCoupon();
  if (!couponCleared) {
    throw new JsFailError('Не удалось очистить купон');
  }

  /* =========================
  | Получение данных из меты |
  ========================= */

  const { market, Comment: comment } = JSON.parse(worker.BetId);

  /* ==============
  | Поиск маркета |
  ============== */

  log(`Ищем маркет "${market}"`, 'steelblue');
  await getElement('abc-card.event-card--item', 5000);
  const eventCards = [
    ...document.querySelectorAll('abc-card.event-card--item'),
  ];
  const targetEventCard = eventCards.find((eventCard, index) => {
    const headerTitleElement = eventCard.querySelector('.accordion__title');
    if (!headerTitleElement) {
      log(`Не найден заголовок карточки №${index + 1}`, 'crimson');
      return false;
    }
    const headerTitle = text(headerTitleElement);
    log(headerTitle, 'white', true);
    return headerTitle === market;
  });
  if (!targetEventCard) {
    throw new JsFailError('Маркет не найден');
  }
  log('Маркет найден', 'steelblue');

  /* ====================
  | Разворот аккордеона |
  ==================== */

  const accordionPrimary = targetEventCard.querySelector('.accordion--primary');
  if (!accordionPrimary) {
    throw new JsFailError('Не найден аккордеон маркета');
  }

  if (!accordionPrimary.classList.contains('accordion--open')) {
    log('Маркет не раскрыт. Раскрываем', 'orange');
    const header = targetEventCard.querySelector<HTMLElement>(
      '.accordion__header'
    );
    if (!header) {
      log('Не найден заголовок маркета', 'crimson');
    } else {
      header.click();
    }
  } else {
    log('Маркет уже раскрыт', 'steelblue');
  }

  /* =============
  | Поиск исхода |
  ============= */

  log(`Ищем исход "${comment}"`, 'steelblue');
  let outrightButton: HTMLElement;
  if (targetEventCard.querySelector('horizontal-buttons')) {
    /* ==================
    | HorizontalButtons |
    ================== */

    log('HorizontalButtons', 'white', true);
    await getElement('.subheader__text--subtitle');
    const subTitles = [
      ...targetEventCard.querySelectorAll('.subheader__text--subtitle'),
    ];
    const targetOutrightIndex = subTitles.findIndex((subTitleElement) => {
      const subTitle = text(subTitleElement);
      log(subTitle, 'white', true);
      return customCompare(subTitle, comment); // добавить, чтобы явно без параметра искало?
    });
    if (targetOutrightIndex === -1) {
      throw new JsFailError('Не найден заголовок подходящего исхода');
    }
    log(`Номер исхода: ${targetOutrightIndex + 1}`, 'white', true);
    const outrightButtons = [
      ...targetEventCard.querySelectorAll<HTMLElement>('.button'),
    ];
    if (!(targetOutrightIndex in outrightButtons)) {
      throw new JsFailError(
        `Не найден кнопка исхода №${targetOutrightIndex + 1}`
      );
    }
    outrightButton = outrightButtons[targetOutrightIndex];
  } else if (targetEventCard.querySelector('outright-item-list')) {
    /* ==========
    | OneColumn |
    ========== */

    log('OneColumn', 'white', true);
    await getElement('outright-item', 2000, targetEventCard);
    const outrightItems = [
      ...targetEventCard.querySelectorAll('outright-item'),
    ];
    const targetOutrightItem = outrightItems.find((outrightItem, index) => {
      const outrightRunnerNameElement = outrightItem.querySelector(
        '.outright-item__runner-name'
      );
      if (!outrightRunnerNameElement) {
        log(`Не найден заголовок исхода №${index + 1}`, 'crimson');
        return false;
      }
      const outrightRunnerName = text(outrightRunnerNameElement);
      log(outrightRunnerName, 'white', true);
      // return outrightRunnerName === comment;
      return customCompare(outrightRunnerName, comment);
    });
    if (!targetOutrightItem) {
      throw new JsFailError('Исход не найден');
    }
    log('Исход найден', 'steelblue');
    outrightButton = targetOutrightItem.querySelector<HTMLElement>('.button');
    if (!outrightButton) {
      throw new JsFailError('Не найдена кнопка исхода');
    }
  } else {
    throw new JsFailError('Необрабатываемый маркет. Обратитесь в ТП');
  }

  // Проверка недоступности ставки

  /* =====================================================
  | Открытие ставки, проверка, что ставка попала в купон |
  ===================================================== */

  const openingAction = async () => {
    outrightButton.click();
  };
  await repeatingOpenBet(openingAction, getStakeCount, 5, 1000, 50);

  /* ===============
  | Проверка макса |
  =============== */

  worker.StakeInfo.Balance = 9999999;
  worker.StakeInfo.MaxSumm = 9999999;
  setStakeSum(9999999);
  const maximumStakeErrorElement = await getElement('sbk-bet-messages .label');
  if (!maximumStakeErrorElement) {
    throw new JsFailError('Не найдено сообщение о максимуме');
  }
  const maximumStakeError = text(maximumStakeErrorElement);
  const maximumStakeErrorRegex = /^The maximum stake for this selection is [^\d]+(\d+(?:\.\d+)?)/i;
  const maximumStakeErrorMatch = maximumStakeError.match(
    maximumStakeErrorRegex
  );
  log(maximumStakeError, 'tomato', true);
  if (!maximumStakeErrorMatch) {
    log(maximumStakeError, 'tomato');
    throw new JsFailError('Непонятный формат сообщения о максимуме');
  }
  window.germesData.maximumStake = Number(maximumStakeErrorMatch[1]);
  log(`Максимальная ставка: ${window.germesData.maximumStake}`, 'white', true);
  worker.StakeInfo.Balance = getBalance();
  worker.StakeInfo.MaxSumm = window.germesData.maximumStake;
  setStakeSum(0);

  /* ====================================
  | Вывод информации об открытой ставке |
  ==================================== */

  // const eventNameSelector = '';
  const marketNameSelector = '.single-header__market-name';
  const betNameSelector = '.single-info__selection';

  // const eventNameElement = document.querySelector(eventNameSelector);
  const marketNameElement = document.querySelector(marketNameSelector);
  const betNameElement = document.querySelector(betNameSelector);

  // if (!eventNameElement) {
  //   throw new JsFailError('Не найдено событие открытой ставки');
  // }
  if (!marketNameElement) {
    throw new JsFailError('Не найден маркет открытой ставки');
  }
  if (!betNameElement) {
    throw new JsFailError('Не найдена роспись открытой ставки');
  }

  // const eventName = text(eventNameElement);
  const marketName = text(marketNameElement);
  const betName = text(betNameElement);

  // log(`Открыта ставка\n${eventName}\n${marketName}\n${betName}`, 'steelblue');
  log(`Открыта ставка\n${marketName}\n${betName}`, 'steelblue');
};

export default openBet;
