import {
  awaiter,
  getElement,
  log,
  text,
} from '@kot-shrodingera-team/germes-utils';
import { JsFailError } from '@kot-shrodingera-team/germes-utils/errors';

const preOpenBet = async (): Promise<void> => {
  /* ========================
  | Проверка вкладки купона |
  ======================== */

  const betslipTab = await getElement<HTMLElement>(
    '.my-bets-tabs__tab:first-child'
  );
  if (!betslipTab) {
    throw new JsFailError('Не найдена вкладка Betslip');
  }
  if (!betslipTab.classList.contains('my-bets-tabs__tab--selected')) {
    log('Не выбрана вкладка Betslip. Переключаем', 'orange');
    betslipTab.click();
    const betslipTabActive = await getElement(
      '.my-bets-tabs__tab.my-bets-tabs__tab--selected:first-child',
      3000
    );
    if (!betslipTabActive) {
      throw new JsFailError('Не удалось переключиться на вкладку Betslip');
    }
    log('Переключились на вкладку Betslip', 'cadetblue', true);
  } else {
    log('Выбрана вкладка Betslip', 'cadetblue', true);
  }

  /* ==========================
  | Проверка вкладки маркетов |
  ========================== */

  await getElement('abc-tab-bar a.tab');
  const marketTabs = [
    ...document.querySelectorAll<HTMLElement>('abc-tab-bar a.tab'),
  ];
  const allMarketsTab = marketTabs.find((marketTab) => {
    return text(marketTab) === 'All Markets';
  });
  if (!allMarketsTab) {
    throw new JsFailError('Не найдена вкладка All Markets');
  }
  if (!allMarketsTab.classList.contains('tab--active')) {
    log('Переключаем на вкладу All Markets', 'orange');
    allMarketsTab.click();
    const allMarketsTabActive = await awaiter(
      () => {
        return allMarketsTab.classList.contains('tab--active');
      },
      2000,
      100
    );
    if (!allMarketsTabActive) {
      throw new JsFailError('Не удалось переключиться на вкладку All Markets');
    }
  } else {
    log('Уже выбрана вкладка All Makrets', 'cadetblue', true);
  }
};

export default preOpenBet;
