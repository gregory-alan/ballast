import { Events } from 'ballast/types/services/Events';

export const EventServiceBuilder = () => {
  const body = document.querySelector('body');

  const listen = <T>(
    eventName: Events,
    listener: (data: T) => void
  ) => {
    body?.addEventListener(eventName, (event) => {
      const { detail: data } = event as CustomEvent<T>;
      listener(data);
    });
  };

  const trigger = <T>(eventName: Events, data: T) => {
    const event = new CustomEvent(eventName, { detail: data });
    body?.dispatchEvent(event);
  };

  return {
    listen,
    trigger,
  };
};
