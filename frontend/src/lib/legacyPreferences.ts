/** Remove obsolete preferences without changing unrelated saved choices. */
export function clearLegacyPreferences(storage: Pick<Storage, "removeItem">) {
  storage.removeItem("aftercheck.rol");
  storage.removeItem("verifix.rol");
}