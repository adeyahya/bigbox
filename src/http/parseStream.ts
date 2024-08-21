import { type ReadableStreamDefaultReader } from "stream/web";

const textDecoder = new TextDecoder();

export const parseStream = async (res: object & {
  body?: null | {
    getReader: () => ReadableStreamDefaultReader<any>
  }
}, cb: (val: string) => void) => {
  if (!res.body) return
  const reader = res.body.getReader();
  let isDone = false;
  while (!isDone) {
    const { done, value } = await reader.read();
    cb(textDecoder.decode(value))
    isDone = done;
  }
}