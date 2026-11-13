/** Colours with a translation under `cars.colors.*`; anything else is shown as typed, capitalised. */
const KNOWN_COLORS: Record<string, string> = {
  white: "white",
  blanco: "white",
  branco: "white",
  black: "black",
  negro: "black",
  preto: "black",
  silver: "silver",
  plata: "silver",
  prata: "silver",
  grey: "grey",
  gray: "grey",
  gris: "grey",
  cinzento: "grey",
  red: "red",
  rojo: "red",
  vermelho: "red",
  blue: "blue",
  azul: "blue",
  green: "green",
  verde: "green",
  orange: "orange",
  naranja: "orange",
  laranja: "orange",
  yellow: "yellow",
  amarillo: "yellow",
  amarelo: "yellow",
  brown: "brown",
  marron: "brown",
  marrón: "brown",
  castanho: "brown",
  beige: "beige",
  bege: "beige",
  gold: "gold",
  dorado: "gold",
  dourado: "gold",
  purple: "purple",
  morado: "purple",
  roxo: "purple",
};

function capitalise(value: string): string {
  return value.charAt(0).toLocaleUpperCase() + value.slice(1);
}

/**
 * One display label for a car colour everywhere (title line, specs table): translated when known,
 * otherwise the company's own text with a capital first letter.
 */
export function vehicleColorLabel(
  color: string | null | undefined,
  translate: (key: string) => string,
): string | null {
  const value = color?.trim();
  if (!value) {
    return null;
  }
  const known = KNOWN_COLORS[value.toLocaleLowerCase()];
  return known ? translate(`colors.${known}`) : capitalise(value);
}
