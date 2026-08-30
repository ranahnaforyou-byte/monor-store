export type NavItem = {
  labelKey: string;
  href: string;
};

/** Primary storefront navigation. Category links are data-driven and appended
 *  at render time from the DB. */
export const primaryNav: NavItem[] = [
  { labelKey: "nav.home", href: "/" },
  { labelKey: "nav.shop", href: "/products" },
  { labelKey: "nav.newArrivals", href: "/products?tag=new" },
  { labelKey: "nav.sale", href: "/products?tag=sale" },
];

export const footerNav: { titleKey: string; items: NavItem[] }[] = [
  {
    titleKey: "footer.help",
    items: [
      { labelKey: "footer.contact", href: "/contact" },
      { labelKey: "footer.shipping", href: "/shipping" },
      { labelKey: "footer.returns", href: "/returns" },
    ],
  },
];
