export type StringKeys<T> = Extract<keyof T, string>

export type MaybePromise<T> = T | Promise<T>
