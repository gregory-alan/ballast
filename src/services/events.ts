'use client';

import { Events } from 'ballast/types/services/Events';

const listeners: { [key: string]: any } = {};

export const EventServiceBuilder = (from?: string) => {
  if (typeof document === 'undefined') {
    const noop = () => {};
    return {
      listen: noop,
      trigger: noop,
    };
  }
  const body = document.querySelector('body');

  const listen = <T>(eventName: Events, listener: (data: T) => void) => {
    if (listeners[eventName]) {
      body?.removeEventListener(eventName, listeners[eventName]);
    }
    const fn = (event: CustomEvent<T>) => {
      const { detail: data } = event;
      listener(data);
    };

    body?.addEventListener(eventName, fn as any);
    listeners[eventName] = fn;
  };

  const trigger = <T>(eventName: Events, data?: T) => {
    const event = new CustomEvent(eventName, { detail: data || {} });
    body?.dispatchEvent(event);
  };

  return {
    listen,
    trigger,
  };
};
