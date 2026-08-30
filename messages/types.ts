export type TranslationSchema<T> = {
  readonly [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends object
      ? TranslationSchema<T[K]>
      : T[K];
};
