export function importFileError(file: Pick<File, "name">, extension: ".xlsx" | ".csv"): string | null {
  return file.name.toLowerCase().endsWith(extension)
    ? null
    : `Alege un fișier ${extension}.`;
}