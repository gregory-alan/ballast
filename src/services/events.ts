export const EventServiceBuilder = () => {
  const body = document.querySelector('body');

  const listen = <T>(
    eventName: string,
    listener: (data: T) => void
  ) => {
    body?.addEventListener(eventName, (event) => {
      const { detail: data } = event as CustomEvent<T>;
      listener(data);
    });
  };

  const trigger = <T>(eventName: string, data: T) => {
    const event = new CustomEvent(eventName, { detail: data });
    body?.dispatchEvent(event);
  };

  return {
    listen,
    trigger,
  };
};
