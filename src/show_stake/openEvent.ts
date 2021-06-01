import { log } from '@kot-shrodingera-team/germes-utils';
import { NewUrlError } from '@kot-shrodingera-team/germes-utils/errors';

const openEvent = async (): Promise<void> => {
  // soccer => football ?
  const eventUrl = worker.EventUrl.replace('/soccer/', '/football/');
  if (window.location.href.startsWith(eventUrl)) {
    log('Уже открыто нужное событие', 'steelblue');
    return;
  }
  log(`${window.location.href} !== ${eventUrl}`, 'white', true);
  window.location.href = eventUrl;
  throw new NewUrlError('Переходим на событие');
};

export default openEvent;
