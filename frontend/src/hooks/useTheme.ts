import { useEffect, useState } from "react";

type Tema = "dark" | "light";
const KEY = "aftercheck.tema";

export function useTheme() {
  const [tema, setTema] = useState<Tema>("dark");

  useEffect(() => {
    if (localStorage.getItem(KEY) === "light") setTema("light");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("light", tema === "light");
    localStorage.setItem(KEY, tema);
  }, [tema]);

  const comuta = () => setTema((t) => (t === "dark" ? "light" : "dark"));
  return { tema, comuta };
}
