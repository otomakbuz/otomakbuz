/**
 * HEIC/HEIF → JPEG dönüşümü.
 * Turbopack heic-convert modülünü düzgün bundle edemediği için
 * ayrı bir Node.js child process'te çalıştırıyoruz.
 */
import { execFile } from "node:child_process";
import { writeFile, readFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export async function convertHeicToJpeg(input: ArrayBuffer): Promise<Buffer> {
  const id = crypto.randomUUID();
  const inputPath = join(tmpdir(), `heic-${id}.heic`);
  const outputPath = join(tmpdir(), `heic-${id}.jpeg`);

  await writeFile(inputPath, Buffer.from(input));

  try {
    await new Promise<void>((resolve, reject) => {
      execFile(
        process.execPath,
        [
          "-e",
          `const c=require("heic-convert"),fs=require("fs");
          const buf=fs.readFileSync(process.argv[1]);
          c({buffer:buf,format:"JPEG",quality:0.85}).then(r=>{
            fs.writeFileSync(process.argv[2],Buffer.from(r));
          }).catch(e=>{console.error(e);process.exit(1)});`,
          inputPath,
          outputPath,
        ],
        { timeout: 30_000 },
        (err) => (err ? reject(err) : resolve())
      );
    });

    return await readFile(outputPath);
  } finally {
    await Promise.allSettled([unlink(inputPath), unlink(outputPath)]);
  }
}
