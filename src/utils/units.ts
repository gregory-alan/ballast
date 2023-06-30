export const DESKTOP_MAX_WIDTH = 448; // TODO: be a config

export const isDesktop = () =>
  typeof window !== undefined && window.outerWidth > DESKTOP_MAX_WIDTH;

export const px = (param: number) => `${(param / 100) * DESKTOP_MAX_WIDTH}px`;
export const vw = (param: number) => `${param}vw`;

export const dimension = (param: number) => isDesktop() ? px(param) : vw(param);

export const computeBoxModel = <T extends string>(dimensions: Record<T, number>) => {
  const boxModel = {} as Record<T, string>;
  for (let key in dimensions) {
    boxModel[key] = isDesktop() ? px(dimensions[key]) : vw(dimensions[key]);
  }
  return boxModel;
}