#!/bin/bash
# 10 videoluk kanal testi icin sarki makineleri. Hepsi kamu mali ezgiler.
# Her satir: ad | notalar | --uzun indisleri
cd "$(dirname "$0")/.."
uret() {
  echo ""
  echo "## $1"
  echo "notalar: $2"
  shift 2
  node sarki-yap.js "$@" 2>&1 | tail -4
}
{
uret "Ode to Joy (ilk cumle)"        "E4 E4 F4 G4 G4 F4 E4 D4"                    "E4 E4 F4 G4 G4 F4 E4 D4"
uret "Frere Jacques"                 "C4 D4 E4 C4 C4 D4 E4 C4 E4 F4 G4"           "C4 D4 E4 C4 C4 D4 E4 C4 E4 F4 G4" --uzun 3,7
uret "Mary Had a Little Lamb"        "E4 D4 C4 D4 E4 E4 E4 D4 D4 D4 E4 G4 G4"     "E4 D4 C4 D4 E4 E4 E4 D4 D4 D4 E4 G4 G4" --uzun 6,9
uret "When the Saints Go Marching In" "C4 E4 F4 G4 C4 E4 F4 G4"                   "C4 E4 F4 G4 C4 E4 F4 G4"
uret "Row Row Row Your Boat"         "C4 C4 C4 D4 E4 E4 D4 E4 F4 G4"              "C4 C4 C4 D4 E4 E4 D4 E4 F4 G4" --uzun 2,7
uret "Old MacDonald"                 "C4 C4 C4 G4 A4 A4 G4"                       "C4 C4 C4 G4 A4 A4 G4"
} >> kanal/sarki-linkleri.md
echo "BITTI"
