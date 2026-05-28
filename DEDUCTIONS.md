# Swiss tax-deduction matrix (income tax)

Data source: ESTV 2026 via devbrains-com/swisstaxcalculator.

Columns: **BUND** = federal direct tax, then 26 cantons in alphabetical order.

Cell legend:
- **✓** = canton's deduction table includes this ID
- **✗** = not in canton's table (deduction not allowed at canton level, or canton uses a different ID)
- The inline value shows the cap / percent / fixed amount where applicable.

Format codes:
- `max N`: capped at N CHF (user-input amount, taken up to N)
- `P%`: simple percentage of input
- `P% [min…max]`: percent of input, clamped
- `N` (no prefix): fixed amount applied unconditionally (STANDARDIZED)

---

| Deduction | BUND | ZH | BE | LU | UR | SZ | OW | NW | GL | ZG | FR | SO | BS | BL | SH | AR | AI | SG | GR | AG | TG | TI | VD | VS | NE | GE | JU |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **1. Berufsauslagen** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| `Fahrkosten_EK`<br/>Fahrkosten (commute) | ✓ max 3300 | ✓ max 5200 | ✓ max 7000 | ✓ max 6500 | ✓ max 13000 | ✓ max 8000 | ✓ max 10000 | ✓ max 6000 | ✗ | ✓ max 6000 | ✓ max 12000 | ✓ max 7200 | ✓ max 3200 | ✓ max 6000 | ✓ max 6000 | ✓ max 6000 | ✗ | ✓ max 8000 | ✗ | ✓ max 7000 | ✓ max 6000 | ✗ | ✗ | ✗ | ✗ | ✓ max 536 | ✗ |
| `HauptErw_EK`<br/>Pauschalabzug Berufsauslagen | ✓ 3% [2000…4000] | ✓ 3% [2000…4000] | ✓ 3% [2000…4000] | ✓ 3% [2000…4000] | ✓ 3% [2000…4000] | ✓ 20% ≤6900 | ✓ 3% [2000…4000] | ✓ 5% ≤7000 | ✓ 3% [2000…4000] | ✓ 3% [2000…4000] | ✓ 3% [2000…4000] | ✓ 3% [2000…4000] | ✓ max 4200 | ✓ max 500 | ✓ 3% [2000…4000] | ✓ STANDARDIZED,PERCENT,MAXIMUM | ✓ STANDARDIZED,PERCENT,MAXIMUM | ✓ STANDARDIZED,PERCENT,MAXIMUM | ✓ 10% [1400…3300] | ✓ 3% [2000…4000] | ✓ 3% [2000…4000] | ✓ max 3000 | ✓ 3% [2000…4000] | ✓ 3% [2000…4000] | ✓ 3% [2000…4000] | ✓ 3% [641…1817] | ✓ 20% ≤4100 |
| `NebenErw_EK`<br/>Berufsauslagen Nebenerwerb | ✓ 20% [800…2400] | ✓ 20% [800…2400] | ✓ 20% [800…2400] | ✓ 20% [800…2400] | ✓ 20% [800…2400] | ✗ | ✓ 20% [800…2400] | ✓ 20% [800…2400] | ✓ 20% [800…2400] | ✓ 20% [800…2400] | ✓ 20% [800…2400] | ✓ 20% [800…2400] | ✓ max 800 | ✓ 20% [800…2400] | ✓ 20% [800…2400] | ✓ 20% [800…2400] | ✓ 20% [800…2400] | ✓ 20% [800…2400] | ✓ 20% [800…2400] | ✓ 20% [800…2400] | ✓ 20% [800…2400] | ✓ max 800 | ✓ 20% [800…2400] | ✓ 20% [800…2400] | ✓ 20% [800…2400] | ✓ 20% [810…2429] | ✓ 20% [800…2400] |
| **2. Säule 3a** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| `FaktPrivVersSparzLedigOhneBVGS3a_EK`<br/>FaktPrivVersSparzLedigOhneBVGS3a_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 2 | ✗ |
| `FaktPrivVersSparzVerhBeideOhneBVGS3a_EK`<br/>FaktPrivVersSparzVerhBeideOhneBVGS3a_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 2 | ✗ |
| `FaktPrivVersSparzVerhEineOhneBVGS3a_EK`<br/>FaktPrivVersSparzVerhEineOhneBVGS3a_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 1.5 | ✗ |
| `KKSparLedigMitBVGS3a_EK`<br/>Versicherungsprämien (single, with BVG/3a) | ✓ max 1800 | ✓ max 2900 | ✓ max 2450 | ✓ max 2600 | ✓ max 1800 | ✓ max 3200 | ✓ max 1700 | ✓ max 1800 | ✓ max 3100 | ✓ max 4600 | ✗ | ✓ max 2600 | ✓ max 4200 | ✓ max 2000 | ✓ max 3750 | ✓ max 2700 | ✓ max 2900 | ✓ max 3400 | ✓ max 4600 | ✓ max 3800 | ✓ max 3500 | ✓ max 5500 | ✗ | ✓ max 3800 | ✓ max 2500 | ✗ | ✓ max 3400 |
| `KKSparLedigOhneBVGS3a_EK`<br/>Versicherungsprämien (single, no BVG/3a) | ✓ max 2700 | ✓ max 4350 | ✓ max 3600 | ✓ max 3300 | ✓ max 2700 | ✓ max 4800 | ✓ max 2550 | ✓ max 2700 | ✓ max 4650 | ✓ max 6900 | ✗ | ✓ max 3900 | ✓ max 4200 | ✓ max 2000 | ✓ max 3750 | ✓ max 2700 | ✓ max 3400 | ✓ max 3900 | ✓ max 5800 | ✓ max 3800 | ✓ max 3500 | ✓ max 7800 | ✗ | ✓ max 3800 | ✓ max 3125 | ✗ | ✓ max 4190 |
| `KKSparProKindMitBVGS3a_EK`<br/>KKSparProKindMitBVGS3a_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 700 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `KKSparProKindOhneBVGS3a_EK`<br/>KKSparProKindOhneBVGS3a_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 1050 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `KKSparVerhOhneBVGS3a_EK`<br/>Versicherungsprämien (married, no BVG/3a) | ✓ max 5550 | ✓ max 8700 | ✓ max 7200 | ✓ max 6700 | ✓ max 5550 | ✓ max 9600 | ✓ max 4950 | ✓ max 5550 | ✓ max 9300 | ✓ max 13800 | ✗ | ✓ max 7800 | ✓ max 8400 | ✓ max 4000 | ✓ max 7500 | ✓ max 5400 | ✓ max 6800 | ✓ max 7900 | ✓ max 11600 | ✓ max 7600 | ✓ max 7000 | ✓ max 15400 | ✗ | ✓ max 7600 | ✓ max 6125 | ✗ | ✗ |
| `KKSparzVerhBeideMitBVGS3a_EK`<br/>KKSparzVerhBeideMitBVGS3a_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 6800 |
| `KKSparzVerhBeideOhneBVGS3a_EK`<br/>KKSparzVerhBeideOhneBVGS3a_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 8380 |
| `KKSparzVerhEineOhneBVGS3a_EK`<br/>KKSparzVerhEineOhneBVGS3a_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 7590 |
| `KKSparzVerhMitBVGS3a_EK`<br/>Versicherungsprämien (married, with BVG/3a) | ✓ max 3700 | ✓ max 5800 | ✓ max 4900 | ✓ max 5200 | ✓ max 3700 | ✓ max 6400 | ✓ max 3300 | ✓ max 3700 | ✓ max 6200 | ✓ max 9200 | ✗ | ✓ max 5200 | ✓ max 8400 | ✓ max 4000 | ✓ max 7500 | ✓ max 5400 | ✓ max 5800 | ✓ max 6800 | ✓ max 9200 | ✓ max 7600 | ✓ max 7000 | ✓ max 10900 | ✗ | ✓ max 7600 | ✓ max 4900 | ✗ | ✗ |
| `PrivVersSparLedigMitBVGS3a_EK`<br/>PrivVersSparLedigMitBVGS3a_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 2352 | ✗ |
| `PrivVersSparzVerhMitBVGS3a_EK`<br/>PrivVersSparzVerhMitBVGS3a_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 3528 | ✗ |
| `S3aMax_mitVorsorge_EK`<br/>Säule 3a (with BVG, max 7'258) | ✓ max 7258 | ✓ max 7258 | ✓ max 7258 | ✓ max 7258 | ✓ max 7258 | ✓ max 7258 | ✓ max 7258 | ✓ max 7258 | ✓ max 7258 | ✓ max 7258 | ✓ max 7258 | ✓ max 7258 | ✓ max 7258 | ✓ max 7258 | ✓ max 7258 | ✓ max 7258 | ✓ max 7258 | ✓ max 7258 | ✓ max 7258 | ✓ max 7258 | ✓ max 7258 | ✓ max 7258 | ✓ max 7258 | ✓ max 7258 | ✓ max 7258 | ✓ max 7258 | ✓ max 7258 |
| `S3aMax_ohneVorsorge_EK`<br/>Säule 3a (no BVG, max 36'288) | ✓ max 36288 | ✓ max 36288 | ✓ max 36288 | ✓ max 36288 | ✓ max 36288 | ✓ max 36288 | ✓ max 36288 | ✓ max 36288 | ✓ max 36288 | ✓ max 36288 | ✓ max 36288 | ✓ max 36288 | ✓ max 36288 | ✓ max 36288 | ✓ max 36288 | ✓ max 36288 | ✓ max 36288 | ✓ max 36288 | ✓ max 36288 | ✓ max 36288 | ✓ max 36288 | ✓ max 36288 | ✓ max 36288 | ✓ max 36288 | ✓ max 36288 | ✓ max 36288 | ✓ max 36288 |
| **3. Versicherung / Sparen** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| `KKPrivVersLedig_EK`<br/>Krankenkasse + Privatvers. (single, VD/GE) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 4900 | ✗ | ✗ | ✗ | ✗ |
| `KKPrivVersProKind_EK`<br/>Krankenkasse + Privatvers. Kinder (VD/GE) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 1300 | ✗ | ✗ | ✗ | ✗ |
| `KKPrivVersVerheiratet_EK`<br/>Krankenkasse + Privatvers. (married, VD/GE) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 9800 | ✗ | ✗ | ✗ | ✗ |
| `KKSparProKind_EK`<br/>Versicherungsprämien Kinder | ✓ max 700 | ✓ max 1300 | ✓ max 700 | ✓ max 700 | ✓ max 700 | ✓ max 400 | ✓ max 700 | ✓ max 700 | ✓ max 1000 | ✓ max 1600 | ✗ | ✗ | ✗ | ✓ max 450 | ✓ max 1000 | ✓ max 1000 | ✓ max 600 | ✓ max 1100 | ✓ max 1000 | ✗ | ✓ max 1000 | ✓ max 1200 | ✗ | ✓ max 1130 | ✓ max 800 | ✗ | ✗ |
| `KKSparProminderjKind_EK`<br/>KKSparProminderjKind_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 1020 |
| `KKSparProvolljKind_EK`<br/>KKSparProvolljKind_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 3400 |
| `SparzinsenLedig_EK`<br/>Sparzinsen (single, VD-style) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 150 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 1600 | ✗ | ✗ | ✗ | ✗ |
| `SparzinsenProKind_EK`<br/>Sparzinsen Kinder (VD-style) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 300 | ✗ | ✗ | ✗ | ✗ |
| `SparzinsenVerheiratet_EK`<br/>Sparzinsen (married, VD-style) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 300 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 3300 | ✗ | ✗ | ✗ | ✗ |
| **4. Soz. bescheid. Einkommen** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| `SozBeschEK_EK`<br/>SozBeschEK_EK | ✗ | ✗ | ✗ | ✓ 14% | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `SozBeschEKAlleinerzMitK_EK`<br/>Soz. besch. Eink. Alleinerz. mit Kind (VD) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 23700 | ✗ | ✗ | ✗ | ✗ |
| `SozBeschEKKind_EK`<br/>Soz. bescheidenes Einkommen / Kind (VD) | ✗ | ✗ | ✓ 600 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 3500 | ✗ | ✗ | ✗ | ✗ |
| `SozBeschEKledig_EK`<br/>Soz. bescheidenes Einkommen (single, VD) | ✗ | ✗ | ✓ 1100 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 17000 | ✗ | ✗ | ✗ | ✗ |
| `SozBeschEKverheiratet_EK`<br/>Soz. bescheidenes Einkommen (married, VD) | ✗ | ✗ | ✓ 2200 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 22700 | ✗ | ✗ | ✗ | ✗ |
| `SozFamAbzugSchwellwertAus1_EK`<br/>Schwellwert Soz.-Abz. familie 1 (VD) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 126300 | ✗ | ✗ | ✗ | ✗ |
| `SozFamAbzugSchwellwertAus2_EK`<br/>Schwellwert Soz.-Abz. familie 2 (VD) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 164100 | ✗ | ✗ | ✗ | ✗ |
| **5. Sozial — Kinder** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| `SozKind_EK`<br/>Sozialabzug pro Kind | ✓ 6800 | ✓ 9400 | ✓ 8300 | ✓ 8100 | ✓ 8500 | ✗ | ✓ 6200 | ✓ 6400 | ✓ 7200 | ✗ | ✗ | ✓ 9300 | ✓ 9000 | ✗ | ✓ 8400 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 11500 | ✗ | ✗ | ✗ | ✓ 13698 | ✗ |
| `SozKindAlleinerzieher_EK`<br/>Soz. Kind, Alleinerziehend | ✗ | ✗ | ✓ 1300 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 2800 | ✗ | ✗ | ✗ | ✗ |
| `SozKinderAlter18oder19_EK`<br/>SozKinderAlter18oder19_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 8500 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `SozKinderAlterUeber14_EK`<br/>SozKinderAlterUeber14_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 24800 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 8200 | ✗ | ✗ |
| `SozKinderAlterUeber15_EK`<br/>SozKinderAlterUeber15_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 11600 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `SozKinderAlterUeber19_EK`<br/>SozKinderAlterUeber19_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 10600 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `SozKinderAlterUeber6_EK`<br/>SozKinderAlterUeber6_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 10800 | ✓ 12500 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `SozKinderAlterUnter14_EK`<br/>SozKinderAlterUnter14_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 9300 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `SozKinderAlterUnter15_EK`<br/>SozKinderAlterUnter15_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 12600 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `SozKinderAlterUnter4_EK`<br/>SozKinderAlterUnter4_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 6200 | ✗ | ✗ |
| `SozKinderAlterUnter5_EK`<br/>SozKinderAlterUnter5_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 3000 | ✓ 5300 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `SozKinderAlterUnter7_EK`<br/>Soz. Kind (< 7 J., VS) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 7600 | ✓ 9000 | ✗ | ✗ | ✗ | ✗ | ✓ 7860 | ✗ | ✗ | ✗ |
| `SozKinderAltervon17Jahren_EK`<br/>Soz. Kind (17+ J., VS) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 11930 | ✗ | ✗ | ✗ |
| `SozKinderAlterZwischen14und17_EK`<br/>SozKinderAlterZwischen14und17_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 10300 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `SozKinderAlterZwischen4und13_EK`<br/>SozKinderAlterZwischen4und13_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 6700 | ✗ | ✗ |
| `SozKinderAlterZwischen5und15_EK`<br/>SozKinderAlterZwischen5und15_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 7400 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `SozKinderAlterZwischen7und16_EK`<br/>Soz. Kind (7–16 J., VS) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 8940 | ✗ | ✗ | ✗ |
| `SozKinderAnzahl1Oder2_EK`<br/>SozKinderAnzahl1Oder2_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ MINIMUM,MAXIMUM | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 6000 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 5700 |
| `SozKinderAnzahlUeber2_EK`<br/>SozKinderAnzahlUeber2_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ MINIMUM,MAXIMUM | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 8000 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 6400 |
| `SozKinderAuswAusbildung_EK`<br/>Soz. Kind in Ausbildung (VS) | ✗ | ✗ | ✓ max 6400 | ✓ 13200 | ✗ | ✗ | ✓ 5100 | ✗ | ✓ 7200 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 8000 | ✗ | ✓ 22500 | ✗ | ✗ | ✗ | ✗ | ✓ 10000 | ✗ | ✗ | ✓ 10600 |
| `SozKinderAuswAusbMitWochenaufentausKt_EK`<br/>SozKinderAuswAusbMitWochenaufentausKt_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 13900 | ✗ | ✗ | ✗ | ✗ | ✗ |
| `SozKinderAuswAusbMitWochenaufenth_EK`<br/>SozKinderAuswAusbMitWochenaufenth_EK | ✗ | ✗ | ✗ | ✗ | ✓ max 13500 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `SozKinderAuswAusbMitWochenaufenthAnzahl1_EK`<br/>SozKinderAuswAusbMitWochenaufenthAnzahl1_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 5600 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `SozKinderAuswAusbMitWochenaufenthAnzahlUeber1_EK`<br/>SozKinderAuswAusbMitWochenaufenthAnzahlUeber1_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 7800 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `SozKinderAuswAusbMitWochenaufentimKt_EK`<br/>SozKinderAuswAusbMitWochenaufentimKt_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 4800 | ✗ | ✗ | ✗ | ✗ | ✗ |
| `SozKinderAuswAusbOhneWochenaufent_EK`<br/>SozKinderAuswAusbOhneWochenaufent_EK | ✗ | ✗ | ✗ | ✗ | ✓ max 4600 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 2000 | ✗ | ✗ | ✗ | ✗ | ✗ |
| `SozKinderAuswAusbOhneWochenaufentausKt_EK`<br/>SozKinderAuswAusbOhneWochenaufentausKt_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 1700 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 6600 | ✗ | ✗ | ✗ | ✗ | ✗ |
| `SozKinderZusAusb_EK`<br/>SozKinderZusAusb_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 13800 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `SozKinderZusAusbEigenbeitrag_EK`<br/>SozKinderZusAusbEigenbeitrag_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 3200 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `SozminderjKinder_EK`<br/>Soz. minderjährige Kinder (VD) | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 9000 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 7400 | ✗ | ✓ max 1000 | ✗ | ✗ | ✗ | ✗ |
| `SozvolljKinder_EK`<br/>Soz. volljährige Kinder | ✗ | ✗ | ✗ | ✗ | ✓ 3200 | ✓ 11000 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 11600 | ✗ | ✗ | ✗ | ✓ 12400 | ✗ | ✗ | ✗ | ✓ 11930 | ✗ | ✗ | ✗ |
| `SozvolljKinderAusserHaus_EK`<br/>SozvolljKinderAusserHaus_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 5800 | ✓ 2000 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 3100 | ✗ | ✓ 2400 |
| `SozZusKinderabzugAbAnzahl3_EK`<br/>Zus. Kinderabzug ab 3. Kind (VS) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 1240 | ✗ | ✗ | ✗ |
| **6. Sozial — Erwachsene** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| `SozAHVIVRentner_EK`<br/>SozAHVIVRentner_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 4000 | ✗ | ✗ | ✓ 2100 | ✓ 6000 | ✗ | ✓ 5200 | ✗ | ✓ 60% | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `SozAHVIVRentnerOhneKinder_EK`<br/>SozAHVIVRentnerOhneKinder_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 3500 | ✓ 40% | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `SozAHVIVRentnerOhneKinderSchwellwert_EK`<br/>SozAHVIVRentnerOhneKinderSchwellwert_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 60000 | ✗ | ✗ | ✗ | ✓ 32760 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `SozAHVIVRentnerSchwellwert_EK`<br/>SozAHVIVRentnerSchwellwert_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 120000 | ✗ | ✗ | ✗ | ✓ 49140 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `SozAlleinEigenemHaushalt_EK`<br/>SozAlleinEigenemHaushalt_EK | ✗ | ✗ | ✓ 2400 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `SozAlleinerzieher_EK`<br/>Sozialabzug Alleinerziehend | ✗ | ✗ | ✗ | ✗ | ✓ 21200 | ✓ 6300 | ✓ 20% [4300…10000] | ✗ | ✗ | ✓ 24000 | ✗ | ✗ | ✓ 32600 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 2700 |
| `SozLedig_EK`<br/>Sozialabzug Ledig | ✗ | ✗ | ✓ 5300 | ✗ | ✓ 15300 | ✓ 3200 | ✗ | ✗ | ✗ | ✓ 12000 | ✗ | ✗ | ✓ 19500 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 1800 |
| `SozVerheiratet_EK`<br/>Sozialabzug Verheiratet | ✓ 2800 | ✗ | ✓ 5300 | ✗ | ✓ 26900 | ✓ 6400 | ✓ 20% [4300…10000] | ✗ | ✗ | ✓ 24000 | ✗ | ✗ | ✓ 38000 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 1300 | ✗ | ✗ | ✗ | ✓ 3700 |
| `SozvolljUnterstpflKinderImHaus_EK`<br/>SozvolljUnterstpflKinderImHaus_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 2400 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `SozZusAbzug_EK`<br/>SozZusAbzug_EK | ✗ | ✗ | ✓ 5300 | ✗ | ✗ | ✗ | ✓ 10000 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **7. Familie / Partner** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| `EigenBetr_EK`<br/>Eigenbetreuungsabzug | ✗ | ✗ | ✗ | ✓ 2000 | ✗ | ✗ | ✗ | ✓ 3100 | ✗ | ✓ 12200 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 3130 | ✗ | ✗ | ✗ |
| `FremdBetr_EK`<br/>Fremdbetreuung (childcare) | ✓ max 25800 | ✓ max 25300 | ✓ max 16000 | ✓ max 18200 | ✓ max 25800 | ✓ max 6000 | ✓ max 10000 | ✓ max 8100 | ✓ max 25800 | ✓ max 25400 | ✓ max 12000 | ✓ max 25800 | ✓ max 26000 | ✓ max 10000 | ✓ max 9400 | ✓ max 25000 | ✓ max 18000 | ✓ max 26800 | ✓ max 25000 | ✓ max 25000 | ✓ 75% ≤10100 | ✓ max 26200 | ✓ max 15200 | ✓ max 10000 | ✓ max 20400 | ✓ max 26392 | ✓ max 10600 |
| `ZweitVerdiener_EK`<br/>Zweitverdienerabzug | ✓ 50% [8600…14100] | ✓ max 6200 | ✓ 2% ≤9500 | ✓ max 5000 | ✓ max 3700 | ✓ max 2100 | ✓ max 3400 | ✓ max 1200 | ✓ 10% [3600…10300] | ✓ max 4600 | ✓ max 500 | ✓ max 1000 | ✓ max 1100 | ✓ max 1000 | ✓ max 800 | ✓ 10% [2500…5200] | ✓ max 500 | ✓ max 500 | ✓ max 2000 | ✓ max 600 | ✗ | ✓ max 8100 | ✓ max 1700 | ✓ max 7000 | ✓ 25% ≤1200 | ✓ max 1054 | ✓ max 2700 |
| **8. Liegenschaft** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| `AbzEigenmietwert_EK`<br/>Abzug Eigenmietwert | ✗ | ✗ | ✗ | ✓ 30% | ✓ 25% ≤7900 | ✗ | ✗ | ✓ 40% | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 20% | ✓ 30% | ✓ 30% | ✓ 30% | ✗ | ✓ 40% | ✓ 10% | ✓ 35% | ✗ | ✗ | ✗ | ✗ |
| `ImmoUnterhaltSelbsbewBIS20Jahre_EK`<br/>Immo-Unterhalt selbstbewohnt ≤ 20 J. | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 20% | ✗ | ✗ | ✗ | ✗ |
| `ImmoUnterhaltSelbsbewUeber20Jahre_EK`<br/>Immo-Unterhalt selbstbewohnt > 20 J. | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 30% | ✗ | ✗ | ✗ | ✗ |
| `ImmoUnterhaltUeber10Jahre_EK`<br/>Immo-Unterhalt > 10 J. (Pauschal %) | ✓ 20% | ✓ 20% | ✓ 20% | ✓ 20% | ✓ 20% | ✓ 20% | ✓ 20% | ✓ 20% | ✓ 20% | ✓ 20% | ✓ 20% | ✓ 20% | ✓ 20% | ✓ 25% | ✓ 25% | ✓ 20% | ✓ 20% | ✓ 20% | ✓ 20% | ✓ 20% | ✓ 20% | ✓ 20% | ✗ | ✓ 20% | ✓ 20% ≤12000 | ✓ 25% | ✓ 20% |
| `ImmoUnterhaltUnter11Jahre_EK`<br/>Immo-Unterhalt < 11 J. (Pauschal %) | ✓ 10% | ✓ 20% | ✓ 10% | ✓ 10% | ✓ 10% | ✓ 10% | ✓ 10% | ✓ 10% | ✓ 10% | ✓ 10% | ✓ 10% | ✓ 10% | ✓ 10% | ✓ 20% | ✓ 15% | ✓ 10% | ✓ 20% | ✓ 20% | ✓ 10% | ✓ 10% | ✓ 10% | ✓ 10% | ✗ | ✓ 10% | ✓ 10% ≤7200 | ✓ 15% | ✓ 10% |
| `ImmoUnterhaltVermietetBIS20Jahre_EK`<br/>Immo-Unterhalt vermietet ≤ 20 J. | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 15000 | ✗ | ✗ | ✗ | ✗ |
| `ImmoUnterhaltVermietetUeber20Jahre_EK`<br/>Immo-Unterhalt vermietet > 20 J. | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 30000 | ✗ | ✗ | ✗ | ✗ |
| **9. Mietzinsabzug** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| `AbzMietePauschalKind_EK`<br/>Mietzinsabzug Pauschal / Kind (VD) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 3700 | ✗ | ✗ | ✗ | ✗ |
| `AbzMietePauschalLedig_EK`<br/>Mietzinsabzug Pauschal (single, VD) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 11000 | ✗ | ✗ | ✗ | ✗ |
| `AbzMietePauschalVerheiratet_EK`<br/>Mietzinsabzug Pauschal (married, VD) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 13500 | ✗ | ✗ | ✗ | ✗ |
| `MaxAbzMiete_EK`<br/>Max Mietzinsabzug | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 10800 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 6800 | ✗ | ✗ | ✗ | ✗ |
| **Z. Sonstige** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| `AbzAlleinstUeber65Jahre_EK`<br/>AbzAlleinstUeber65Jahre_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 3900 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `EntlAlleinstehendeSchwellwert_EK`<br/>EntlAlleinstehendeSchwellwert_EK | ✗ | ✗ | ✗ | ✓ 50400 | ✗ | ✓ 35000 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `EntlKindSchwellwert_EK`<br/>EntlKindSchwellwert_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 25000 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `EntlVerheirateteSchwellwert_EK`<br/>EntlVerheirateteSchwellwert_EK | ✗ | ✗ | ✗ | ✓ 80700 | ✗ | ✓ 70000 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `KKDurchschnittsprämieErw_EK`<br/>KKDurchschnittsprämieErw_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 17520 | ✗ |
| `KKDurchschnittsprämieJungErw_EK`<br/>KKDurchschnittsprämieJungErw_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 13063 | ✗ |
| `KKDurchschnittsprämieMindjhrg_EK`<br/>KKDurchschnittsprämieMindjhrg_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 4147 | ✗ |
| `KKLedig_EK`<br/>KKLedig_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 4810 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `KKProMinderjKind_EK`<br/>KKProMinderjKind_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 1140 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `KKProVolljKind_EK`<br/>KKProVolljKind_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 4210 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `KKVerheiratet_EK`<br/>KKVerheiratet_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 9620 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `MaxTechnZinssatzEE_CHF_FINMA1000_EK`<br/>Technischer Zinssatz Eigenkapital (FINMA) | ✓ 350% | ✓ 350% | ✓ 350% | ✓ 350% | ✓ 350% | ✓ 350% | ✓ 350% | ✓ 350% | ✓ 350% | ✓ 350% | ✓ 350% | ✓ 350% | ✓ 350% | ✓ 350% | ✓ 350% | ✓ 350% | ✓ 350% | ✓ 350% | ✓ 350% | ✓ 350% | ✓ 350% | ✓ 350% | ✓ 350% | ✓ 350% | ✓ 350% | ✓ 350% | ✓ 350% |
| `PrivVersLedig_EK`<br/>PrivVersLedig_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 750 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `PrivVersSparProKind_EK`<br/>PrivVersSparProKind_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 962 | ✗ |
| `PrivVersVerheiratet_EK`<br/>PrivVersVerheiratet_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ max 1500 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `StErmässigungProKind_EK`<br/>StErmässigungProKind_EK | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ 750 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `VerpflMitVerb_EK`<br/>Verpflegungskosten (with discount) | ✓ max 1600 | ✓ max 1600 | ✓ max 1600 | ✓ max 1600 | ✓ max 1600 | ✓ max 1600 | ✓ max 1600 | ✓ max 1600 | ✓ max 1600 | ✓ max 1600 | ✓ max 1600 | ✓ max 1600 | ✓ max 1600 | ✓ max 1600 | ✓ max 1600 | ✓ max 1600 | ✓ max 1600 | ✓ max 1600 | ✓ max 1600 | ✓ max 1600 | ✓ max 1600 | ✓ max 1600 | ✓ max 1600 | ✓ max 1600 | ✓ max 1600 | ✓ max 1600 | ✓ max 1600 |
| `VerpflOhneVerb_EK`<br/>Verpflegungskosten (full) | ✓ max 3200 | ✓ max 3200 | ✓ max 3200 | ✓ max 3200 | ✓ max 3200 | ✓ max 3200 | ✓ max 3200 | ✓ max 3200 | ✓ max 3200 | ✓ max 3200 | ✓ max 3200 | ✓ max 3200 | ✓ max 3200 | ✓ max 3200 | ✓ max 3200 | ✓ max 3200 | ✓ max 3200 | ✓ max 3200 | ✓ max 3200 | ✓ max 3200 | ✓ max 3200 | ✓ max 3200 | ✓ max 3200 | ✓ max 3200 | ✓ max 3200 | ✓ max 3200 | ✓ max 3200 |
| `VMVerwaltungsKosten_EK`<br/>Vermögens­verwaltungskosten | ✗ | ✓ 0.3% ≤6000 | ✗ | ✗ | ✓ 0.3% ≤5000 | ✓ 0.3% ≤6000 | ✓ 0.3% ≤6000 | ✓ 0.3% ≤9000 | ✓ 0.2% ≤6000 | ✓ 0.3% ≤9000 | ✗ | ✗ | ✗ | ✗ | ✓ 0.25% ≤3000 | ✓ 0.3% ≤6000 | ✗ | ✓ 0.2% ≤6000 | ✓ 0.25% ≤9000 | ✗ | ✓ 0.2% ≤6000 | ✗ | ✗ | ✓ 0.1% ≤1000 | ✗ | ✗ | ✗ |

_111 distinct deduction IDs across BUND + 26 cantons._

### Deduction-richness per jurisdiction

| BUND | ZH | BE | LU | UR | SZ | OW | NW | GL | ZG | FR | SO | BS | BL | SH | AR | AI | SG | GR | AG | TG | TI | VD | VS | NE | GE | JU |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 19 | 19 | 27 | 24 | 26 | 26 | 24 | 25 | 20 | 28 | 22 | 20 | 22 | 23 | 20 | 23 | 20 | 23 | 21 | 19 | 21 | 22 | 33 | 24 | 20 | 22 | 25 |