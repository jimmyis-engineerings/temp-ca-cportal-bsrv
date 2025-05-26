export const log = (...args: any[]) => console.log(...args)
export const error = (...args: any[]) => console.error(...args)
export const warn = (...args: any[]) => console.warn(...args)
export const info = (...args: any[]) => console.info(...args)
export const debug = (...args: any[]) => console.debug(...args)
export const trace = (...args: any[]) => console.trace(...args)

export default {
    log,
    error,
    warn,
    info,
    debug,
    trace
}
