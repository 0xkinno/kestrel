export interface EditorialImage {
  src: string;
  alt: string;
  photographer: string;
  sourceUrl: string;
}

/**
 * Real, open-license editorial photography sourced via Unsplash (see ATTRIBUTIONS.md
 * for the full attribution block required by the hackathon's IP rules). No SVG
 * illustration, no generated/stock-icon imagery anywhere in this build.
 */
export const EDITORIAL_IMAGES = {
  hero: {
    src: "https://images.unsplash.com/photo-1747943690971-d3ace1d89567?ixlib=rb-4.1.0&w=1920&h=1080&fit=crop&q=80",
    alt: "A lone tree on the East African savanna under a shifting, storm-laden sky",
    photographer: "Felix Rottmann",
    sourceUrl: "https://unsplash.com/photos/lone-tree-stands-in-the-vast-african-savanna-BfiXzJQ-7zQ",
  },
  kestrel: {
    src: "https://images.unsplash.com/photo-1759058240375-30729c9db8b4?ixlib=rb-4.1.0&w=1600&h=1000&fit=crop&q=80",
    alt: "A kestrel hovering in a pale sky, watching the ground below",
    photographer: "Doncoombez",
    sourceUrl: "https://unsplash.com/photos/a-kestrel-hovers-in-the-sky-gUs-Dm871GM",
  },
  community: {
    src: "https://images.unsplash.com/photo-1778079247396-9c0e01c83c8b?ixlib=rb-4.1.0&w=1600&h=1000&fit=crop&q=80",
    alt: "A market day scene in the Gamo Highlands, Ethiopia",
    photographer: "Hendrik Morkel",
    sourceUrl: "https://unsplash.com/photos/woman-selling-spices-at-an-outdoor-market-tE9Qsv_eV2o",
  },
  mapBackdrop: {
    src: "https://images.unsplash.com/photo-1777880394630-1a368376e8cf?ixlib=rb-4.1.0&w=1920&h=900&fit=crop&q=80",
    alt: "Aerial view of a dry river delta, East Africa",
    photographer: "Cosmin Andrei Buzamat",
    sourceUrl: "https://unsplash.com/photos/aerial-view-of-a-river-delta-with-dry-earth-B1FMTYfPk4Q",
  },
} satisfies Record<string, EditorialImage>;
