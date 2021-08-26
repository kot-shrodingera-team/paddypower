import { log } from '@kot-shrodingera-team/germes-utils';
import { JsFailError, NewUrlError } from '@kot-shrodingera-team/germes-utils/errors';

const openEvent = async (): Promise<void> => {
  // soccer => football ?
  const eventUrl = worker.EventUrl.replace('/soccer/', '/football/');

  /* ======================================================================== */
  /*             Если не было попытки перехода на страницу события            */
  /* ======================================================================== */

  if (
    worker.GetSessionData(
      `${window.germesData.bookmakerName}.TransitionToEventPage`
    ) === '0'
  ) {
    if (window.location.href.startsWith(eventUrl)) {
      log('Уже открыто нужное событие', 'steelblue');
      return;
    }
    log(`${window.location.href} !== ${eventUrl}`, 'white', true);
    worker.SetSessionData(
      `${window.germesData.bookmakerName}.TransitionToEventPage`,
      '1'
    );
    window.location.href = eventUrl;
    throw new NewUrlError('Переходим на событие');
  }

  /* ======================================================================== */
  /*              Если была попытка перехода на страницу события              */
  /* ======================================================================== */

  if (window.location.href.startsWith(eventUrl)) {
    log('Открыли нужное событие', 'steelblue');
    return;
  }
  log(`${window.location.href} !== ${eventUrl}`, 'white');
  throw new JsFailError('Не удалось перейти на нужное событие');
};

export default openEvent;
