import { WILAYAS } from "./wilayas";

/**
 * Starter commune list — the wilaya capital for every wilaya, plus major
 * communes for the metros. Replaced/extended by the full Yalidine reference
 * sync (Phase 5). `stopDesk: true` marks communes with a Yalidine desk.
 */
export type CommuneSeed = {
  wilayaCode: number;
  name: string;
  nameAr: string;
  stopDesk: boolean;
};

const EXTRA: Record<number, { name: string; nameAr: string; stopDesk?: boolean }[]> = {
  9: [
    { name: "Boufarik", nameAr: "بوفاريك", stopDesk: true },
    { name: "Bougara", nameAr: "بوقرة" },
    { name: "Larbaâ", nameAr: "الأربعاء" },
  ],
  16: [
    { name: "Bab Ezzouar", nameAr: "باب الزوار", stopDesk: true },
    { name: "El Harrach", nameAr: "الحراش", stopDesk: true },
    { name: "Dély Ibrahim", nameAr: "دالي إبراهيم", stopDesk: true },
    { name: "Chéraga", nameAr: "الشراقة", stopDesk: true },
    { name: "Bir Mourad Raïs", nameAr: "بئر مراد رايس" },
    { name: "Hussein Dey", nameAr: "حسين داي" },
  ],
  19: [
    { name: "El Eulma", nameAr: "العلمة", stopDesk: true },
    { name: "Aïn Oulmène", nameAr: "عين ولمان" },
  ],
  25: [
    { name: "El Khroub", nameAr: "الخروب", stopDesk: true },
    { name: "Aïn Smara", nameAr: "عين سمارة" },
  ],
  31: [
    { name: "Bir El Djir", nameAr: "بئر الجير", stopDesk: true },
    { name: "Es Sénia", nameAr: "السانية", stopDesk: true },
    { name: "Arzew", nameAr: "أرزيو" },
  ],
  15: [
    { name: "Azazga", nameAr: "عزازقة" },
    { name: "Draâ Ben Khedda", nameAr: "ذراع بن خدة" },
  ],
  6: [{ name: "Akbou", nameAr: "أقبو", stopDesk: true }, { name: "El Kseur", nameAr: "القصر" }],
  35: [
    { name: "Boudouaou", nameAr: "بودواو", stopDesk: true },
    { name: "Réghaïa", nameAr: "رغاية" },
  ],
  23: [{ name: "El Bouni", nameAr: "البوني" }, { name: "Berrahal", nameAr: "برحال" }],
};

export function buildCommuneSeed(): CommuneSeed[] {
  const out: CommuneSeed[] = [];
  for (const w of WILAYAS) {
    // capital = wilaya name
    out.push({ wilayaCode: w.code, name: w.name, nameAr: w.nameAr, stopDesk: true });
    for (const e of EXTRA[w.code] ?? []) {
      out.push({
        wilayaCode: w.code,
        name: e.name,
        nameAr: e.nameAr,
        stopDesk: Boolean(e.stopDesk),
      });
    }
  }
  return out;
}
