export type MaybePromise<T> = Promise<T> | T

export type StringKeys<T> = Extract<keyof T, string>
