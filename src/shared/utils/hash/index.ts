import { sha256 } from "js-sha256";

export function createSHA256Hash(data: any | any[]) {
    const _data = Array.isArray(data) ? data.join(",") : data
    return sha256.create().update(_data).hex()
}
