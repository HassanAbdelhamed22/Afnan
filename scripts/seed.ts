import { connectMongoose } from "../src/lib/mongoose";
import { CategoryModel } from "../src/modules/categories/model";
import { ProductModel } from "../src/modules/products/model";

async function main() {
  console.log("Connecting to database...");
  await connectMongoose();

  console.log("Cleaning database...");
  await CategoryModel.deleteMany({});
  await ProductModel.deleteMany({});

  console.log("Seeding categories...");
  const categories = await CategoryModel.create([
    {
      name: "Clay Pots",
      slug: "clay-pots",
      description: "Beautiful hand-painted clay pots and ceramic planters crafted in Egypt.",
      image: {
        url: "https://images.unsplash.com/photo-1576016770956-debb63d90029?q=80&w=800",
        publicId: "clay-pots-main",
        width: 800,
        height: 1000,
      },
      sortOrder: 1,
      isActive: true,
    },
    {
      name: "Crochet Shawls",
      slug: "crochet-shawls",
      description: "Warm, hand-woven Egyptian wool shawls and scarves.",
      image: {
        url: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?q=80&w=800",
        publicId: "shawls-main",
        width: 800,
        height: 1000,
      },
      sortOrder: 2,
      isActive: true,
    },
    {
      name: "Leather Bags",
      slug: "leather-bags",
      description: "Genuine camel and cow leather hand-stitched bags and accessories.",
      image: {
        url: "https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=800",
        publicId: "leather-bags-main",
        width: 800,
        height: 1000,
      },
      sortOrder: 3,
      isActive: true,
    },
    {
      name: "Handwoven Rugs",
      slug: "handwoven-rugs",
      description: "Premium wool Kilims and woven tapestries from Fayoum and Upper Egypt.",
      image: {
        url: "https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?q=80&w=800",
        publicId: "rugs-main",
        width: 800,
        height: 1000,
      },
      sortOrder: 4,
      isActive: true,
    },
    {
      name: "Brass Decor",
      slug: "brass-decor",
      description: "Hand-engraved brass trays, lanterns, and ornaments from historic Cairo.",
      image: {
        url: "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=800",
        publicId: "brass-main",
        width: 800,
        height: 1000,
      },
      sortOrder: 5,
      isActive: true,
    },
    {
      name: "Crochet Toys",
      slug: "crochet-toys",
      description: "Soft crochet toys and teddy bears hand-knitted with organic cotton.",
      image: {
        url: "https://images.unsplash.com/photo-1559251606-c623743a6d76?q=80&w=800",
        publicId: "crochet-bear-main",
        width: 800,
        height: 1000,
      },
      sortOrder: 6,
      isActive: true,
    },
    {
      name: "Seasonal Specials",
      slug: "seasonal-specials",
      description: "Hidden or inactive category for testing",
      sortOrder: 7,
      isActive: false, // Inactive category
    },
  ]);

  const [
    catClay,
    catCrochet,
    catLeather,
    catRugs,
    catBrass,
    catToys,
    catInactive,
  ] = categories;

  console.log("Seeding products...");
  await ProductModel.create([
    // 1. Classic Blue Aswan Pot
    {
      name: "Classic Blue Aswan Pot",
      slug: "classic-blue-aswan-pot",
      description: "Handmade ceramic clay pot hand-painted with cobalt blue traditional patterns.",
      categoryId: catClay._id,
      status: "ACTIVE",
      fulfillmentType: "READY_MADE",
      basePriceAmount: 25000, // EGP 250.00
      currency: "EGP",
      materials: ["Clay", "Cobalt Glaze"],
      colors: ["Blue", "White"],
      tags: ["aswan", "ceramic", "pot", "blue"],
      dimensions: { width: 15, height: 20, depth: 15, unit: "cm" },
      personalizationAvailable: false,
      images: [
        {
          url: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=800",
          publicId: "aswan-pot-1",
          width: 800,
          height: 1000,
        },
      ],
      variants: [
        {
          sku: "POT-BLU-SM",
          label: "Small (15cm)",
          optionValues: new Map([["size", "Small"]]),
          priceAmount: 20000, // Override: EGP 200.00
          stockQuantity: 10,
          isActive: true,
        },
        {
          sku: "POT-BLU-MD",
          label: "Medium (20cm)",
          optionValues: new Map([["size", "Medium"]]),
          priceAmount: 25000, // EGP 250.00
          stockQuantity: 5,
          isActive: true,
        },
        {
          sku: "POT-BLU-LG",
          label: "Large (25cm)",
          optionValues: new Map([["size", "Large"]]),
          priceAmount: 32000, // Override: EGP 320.00
          stockQuantity: 0, // Out of stock variant
          isActive: true,
        },
      ],
      isFeatured: true,
      publishedAt: new Date("2026-08-01T12:00:00Z"),
    },

    // 2. Terracotta Clay Planter
    {
      name: "Terracotta Clay Planter",
      slug: "terracotta-clay-planter",
      description: "Naturally porous terracotta planter designed for healthy root aeration. Sourced from Fayoum workshops.",
      categoryId: catClay._id,
      status: "ACTIVE",
      fulfillmentType: "READY_MADE",
      basePriceAmount: 15000, // EGP 150.00
      currency: "EGP",
      materials: ["Terracotta Clay"],
      colors: ["Terracotta", "Brown"],
      tags: ["planter", "clay", "fayoum"],
      dimensions: { width: 18, height: 18, depth: 18, unit: "cm" },
      personalizationAvailable: false,
      images: [
        {
          url: "https://images.unsplash.com/photo-1581514781448-912a76f272a8?q=80&w=800",
          publicId: "terracotta-pot-1",
          width: 800,
          height: 1000,
        },
      ],
      variants: [
        {
          sku: "POT-TER-STD",
          label: "Standard",
          optionValues: new Map([["size", "Standard"]]),
          stockQuantity: 15,
          isActive: true,
        },
      ],
      isFeatured: false,
      publishedAt: new Date("2026-08-01T14:00:00Z"),
    },

    // 3. Custom Crochet Wool Shawl
    {
      name: "Custom Crochet Wool Shawl",
      slug: "custom-crochet-wool-shawl",
      description: "Beautifully hand-crocheted woolen shawl made to order. Customize your favorite colors and layout.",
      categoryId: catCrochet._id,
      status: "ACTIVE",
      fulfillmentType: "MADE_TO_ORDER",
      basePriceAmount: 65000, // EGP 650.00
      currency: "EGP",
      materials: ["Egyptian Wool", "Acrylic Blend"],
      colors: ["Multi", "Rainbow"],
      tags: ["crochet", "shawl", "wool", "clothing"],
      personalizationAvailable: true,
      personalizationInstructions: "Specify your preferred color stripes or patterns (up to 4 colors).",
      preparationDaysMin: 5,
      preparationDaysMax: 10,
      careInstructions: "Hand wash cold only. Lay flat to dry.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800",
          publicId: "shawl-custom-1",
          width: 800,
          height: 1000,
        },
      ],
      variants: [
        {
          sku: "SHW-CUST-ONEM",
          label: "Standard Size (1.5m)",
          optionValues: new Map([["length", "Standard"]]),
          stockQuantity: undefined,
          isActive: true,
        },
      ],
      isFeatured: true,
      publishedAt: new Date("2026-08-02T10:00:00Z"),
    },

    // 4. Handknit Lace Wool Scarf
    {
      name: "Handknit Lace Wool Scarf",
      slug: "handknit-lace-wool-scarf",
      description: "Delicate lace-patterned scarf handknit with premium Egyptian wool. Cozy yet lightweight.",
      categoryId: catCrochet._id,
      status: "ACTIVE",
      fulfillmentType: "READY_MADE",
      basePriceAmount: 35000, // EGP 350.00
      currency: "EGP",
      materials: ["Egyptian Wool"],
      colors: ["Cream", "Ivory"],
      tags: ["scarf", "wool", "lace", "knit"],
      personalizationAvailable: false,
      images: [
        {
          url: "https://images.unsplash.com/photo-1528642474498-1af0c17fd8c3?q=80&w=800",
          publicId: "lace-scarf-1",
          width: 800,
          height: 1000,
        },
      ],
      variants: [
        {
          sku: "SCF-LAC-CRM",
          label: "Cream Scarf",
          optionValues: new Map([["color", "Cream"]]),
          stockQuantity: 4,
          isActive: true,
        },
      ],
      isFeatured: false,
      publishedAt: new Date("2026-08-02T15:00:00Z"),
    },

    // 5. Vintage Nubian Leather Messenger Bag
    {
      name: "Vintage Nubian Leather Messenger Bag",
      slug: "vintage-nubian-leather-messenger-bag",
      description: "Stitched by hand in Aswan using local camel leather. Embellished with traditional Nubian metal fittings.",
      categoryId: catLeather._id,
      status: "ACTIVE",
      fulfillmentType: "READY_MADE",
      basePriceAmount: 120000, // EGP 1,200.00
      currency: "EGP",
      materials: ["Camel Leather", "Brass Buckles"],
      colors: ["Tan Brown", "Dark Brown"],
      tags: ["leather", "bag", "nubian", "messenger"],
      dimensions: { width: 30, height: 22, depth: 8, unit: "cm" },
      personalizationAvailable: false,
      images: [
        {
          url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800",
          publicId: "leather-bag-1",
          width: 800,
          height: 1000,
        },
      ],
      variants: [
        {
          sku: "BAG-TAN",
          label: "Tan Leather",
          optionValues: new Map([["color", "Tan"]]),
          stockQuantity: 3,
          isActive: true,
        },
        {
          sku: "BAG-DRK",
          label: "Dark Leather",
          optionValues: new Map([["color", "Dark Brown"]]),
          stockQuantity: 0,
          isActive: true,
        },
      ],
      isFeatured: false,
      publishedAt: new Date("2026-08-03T09:00:00Z"),
    },

    // 6. Nubian Pattern Leather Tote
    {
      name: "Nubian Pattern Leather Tote",
      slug: "nubian-pattern-leather-tote",
      description: "Wide-mouth camel leather shopping tote adorned with custom geometric Nubian brand embossments.",
      categoryId: catLeather._id,
      status: "ACTIVE",
      fulfillmentType: "READY_MADE",
      basePriceAmount: 95000, // EGP 950.00
      currency: "EGP",
      materials: ["Camel Leather"],
      colors: ["Tan Brown"],
      tags: ["leather", "tote", "bag", "nubian"],
      dimensions: { width: 35, height: 40, depth: 10, unit: "cm" },
      personalizationAvailable: false,
      images: [
        {
          url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800",
          publicId: "leather-tote-1",
          width: 800,
          height: 1000,
        },
      ],
      variants: [
        {
          sku: "BAG-TOTE-TAN",
          label: "Tan Tote",
          optionValues: new Map([["color", "Tan"]]),
          stockQuantity: 6,
          isActive: true,
        },
      ],
      isFeatured: true,
      publishedAt: new Date("2026-08-03T14:00:00Z"),
    },

    // 7. Minimalist Leather Card Holder
    {
      name: "Minimalist Leather Card Holder",
      slug: "minimalist-leather-card-holder",
      description: "Stitched by hand with pure linen thread. Features 4 card slots and a center cash pocket.",
      categoryId: catLeather._id,
      status: "ACTIVE",
      fulfillmentType: "READY_MADE",
      basePriceAmount: 18000, // EGP 180.00
      currency: "EGP",
      materials: ["Camel Leather", "Linen Thread"],
      colors: ["Tan Brown", "Black"],
      tags: ["leather", "card-holder", "minimalist"],
      dimensions: { width: 10, height: 7, depth: 0.5, unit: "cm" },
      personalizationAvailable: true,
      personalizationInstructions: "Input your monogram initials (max 3 characters) to engrave.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=800",
          publicId: "card-holder-1",
          width: 800,
          height: 1000,
        },
      ],
      variants: [
        {
          sku: "CRD-TAN",
          label: "Tan Brown",
          optionValues: new Map([["color", "Tan"]]),
          stockQuantity: 12,
          isActive: true,
        },
        {
          sku: "CRD-BLK",
          label: "Matte Black",
          optionValues: new Map([["color", "Black"]]),
          stockQuantity: 8,
          isActive: true,
        },
      ],
      isFeatured: false,
      publishedAt: new Date("2026-08-03T16:00:00Z"),
    },

    // 8. Fayoum Kilim Rug
    {
      name: "Fayoum Kilim Rug",
      slug: "fayoum-kilim-rug",
      description: "Stunning hand-woven wool Kilim rug showcasing iconic Fayoum desert geometric motifs.",
      categoryId: catRugs._id,
      status: "ACTIVE",
      fulfillmentType: "READY_MADE",
      basePriceAmount: 180000, // EGP 1,800.00
      currency: "EGP",
      materials: ["Egyptian Wool", "Organic Cotton Warp"],
      colors: ["Orange", "Terracotta", "Cream"],
      tags: ["rug", "kilim", "wool", "fayoum"],
      dimensions: { width: 120, height: 180, unit: "cm" },
      personalizationAvailable: false,
      images: [
        {
          url: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=800",
          publicId: "fayoum-kilim-1",
          width: 800,
          height: 1000,
        },
      ],
      variants: [
        {
          sku: "RUG-KIL-FY-120",
          label: "1.2m x 1.8m",
          optionValues: new Map([["dimensions", "1.2m x 1.8m"]]),
          stockQuantity: 2,
          isActive: true,
        },
      ],
      isFeatured: true,
      publishedAt: new Date("2026-08-04T10:00:00Z"),
    },

    // 9. Cairo Wool Tapestry
    {
      name: "Cairo Wool Tapestry",
      slug: "cairo-wool-tapestry",
      description: "Fine wool tapestry handwoven on traditional vertical looms. Depicts local Nile delta landscapes.",
      categoryId: catRugs._id,
      status: "ACTIVE",
      fulfillmentType: "MADE_TO_ORDER",
      basePriceAmount: 220000, // EGP 2,200.00
      currency: "EGP",
      materials: ["Egyptian Wool", "Linen Warp"],
      colors: ["Blue", "Green", "Ochre"],
      tags: ["tapestry", "wall-art", "wool", "cairo"],
      dimensions: { width: 80, height: 120, unit: "cm" },
      personalizationAvailable: false,
      preparationDaysMin: 14,
      preparationDaysMax: 21,
      images: [
        {
          url: "https://images.unsplash.com/photo-1554034483-04fda0d3507b?q=80&w=800",
          publicId: "cairo-tapestry-1",
          width: 800,
          height: 1000,
        },
      ],
      variants: [
        {
          sku: "TAP-CAI-80",
          label: "Standard (80cm x 120cm)",
          optionValues: new Map([["size", "Standard"]]),
          stockQuantity: undefined,
          isActive: true,
        },
      ],
      isFeatured: false,
      publishedAt: new Date("2026-08-04T12:00:00Z"),
    },

    // 10. Hand-Engraved Brass Tray
    {
      name: "Hand-Engraved Brass Tray",
      slug: "hand-engraved-brass-tray",
      description: "Ornate coffee serving tray in solid brass, carefully hammered and hand-etched with historic Islamic motifs.",
      categoryId: catBrass._id,
      status: "ACTIVE",
      fulfillmentType: "READY_MADE",
      basePriceAmount: 120000, // EGP 1,200.00
      currency: "EGP",
      materials: ["Solid Brass"],
      colors: ["Gold", "Brass"],
      tags: ["brass", "tray", "decor", "serving"],
      dimensions: { width: 45, height: 45, depth: 2, unit: "cm" },
      personalizationAvailable: true,
      personalizationInstructions: "Specify name or date to hand-engrave at the center.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=800",
          publicId: "brass-tray-1",
          width: 800,
          height: 1000,
        },
      ],
      variants: [
        {
          sku: "BRS-TRY-45",
          label: "45cm Diameter",
          optionValues: new Map([["diameter", "45cm"]]),
          stockQuantity: 5,
          isActive: true,
        },
      ],
      isFeatured: false,
      publishedAt: new Date("2026-08-05T09:00:00Z"),
    },

    // 11. Al-Muizz Lantern
    {
      name: "Al-Muizz Lantern",
      slug: "al-muizz-lantern",
      description: "Pierced brass tabletop lantern casting traditional stellar shadow projections.",
      categoryId: catBrass._id,
      status: "ACTIVE",
      fulfillmentType: "READY_MADE",
      basePriceAmount: 85000, // EGP 850.00
      currency: "EGP",
      materials: ["Brass", "Glass Inserts"],
      colors: ["Brass", "Amber"],
      tags: ["lantern", "lighting", "brass", "al-muizz"],
      dimensions: { width: 20, height: 35, depth: 20, unit: "cm" },
      personalizationAvailable: false,
      images: [
        {
          url: "https://images.unsplash.com/photo-1517999144091-3d9dca6d1e43?q=80&w=800",
          publicId: "muizz-lantern-1",
          width: 800,
          height: 1000,
        },
      ],
      variants: [
        {
          sku: "BRS-LNT-MUI",
          label: "Standard",
          optionValues: new Map([["model", "Standard"]]),
          stockQuantity: 8,
          isActive: true,
        },
      ],
      isFeatured: true,
      publishedAt: new Date("2026-08-05T11:00:00Z"),
    },

    // 12. Handmade Crochet Bear
    {
      name: "Handmade Crochet Bear",
      slug: "handmade-crochet-bear",
      description: "Adorable soft teddy bear hand-knitted from hypoallergenic organic cotton yarns. Perfect gift for children.",
      categoryId: catToys._id,
      status: "ACTIVE",
      fulfillmentType: "READY_MADE",
      basePriceAmount: 29000, // EGP 290.00
      currency: "EGP",
      materials: ["Organic Cotton Yarn", "Fiberfill Stuffing"],
      colors: ["Grey", "Purple"],
      tags: ["toy", "crochet", "bear", "gift"],
      dimensions: { width: 12, height: 25, depth: 10, unit: "cm" },
      personalizationAvailable: true,
      personalizationInstructions: "Provide a name (up to 8 characters) to embroider on the vest.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800",
          publicId: "crochet-bear-1",
          width: 800,
          height: 1000,
        },
      ],
      variants: [
        {
          sku: "TOY-BEAR-GRY",
          label: "Grey Crochet Bear",
          optionValues: new Map([["color", "Grey"]]),
          stockQuantity: 7,
          isActive: true,
        },
      ],
      isFeatured: true,
      publishedAt: new Date("2026-08-06T09:00:00Z"),
    },

    // Inactive Category Product: ACTIVE product, but under INACTIVE category (should be hidden publicly)
    {
      name: "Summer Clay Wind Chime",
      slug: "summer-clay-wind-chime",
      description: "Terracotta clay bells with a high-pitched ring.",
      categoryId: catInactive._id,
      status: "ACTIVE",
      fulfillmentType: "READY_MADE",
      basePriceAmount: 18000,
      currency: "EGP",
      materials: ["Terracotta Clay", "Jute Rope"],
      colors: ["Terracotta"],
      tags: ["wind-chime", "clay", "bell"],
      personalizationAvailable: false,
      images: [],
      variants: [
        {
          sku: "CHM-TER",
          label: "Standard",
          optionValues: new Map([["model", "Standard"]]),
          stockQuantity: 15,
          isActive: true,
        },
      ],
      isFeatured: false,
      publishedAt: new Date("2026-08-04T08:00:00Z"),
    },

    // Draft product: status is DRAFT (should be hidden publicly)
    {
      name: "Golden Desert Vase",
      slug: "golden-desert-vase",
      description: "A draft pottery masterpiece waiting for final review.",
      categoryId: catClay._id,
      status: "DRAFT",
      fulfillmentType: "READY_MADE",
      basePriceAmount: 90000,
      currency: "EGP",
      materials: ["Clay", "Gold Leaf"],
      colors: ["Gold", "Sand"],
      tags: ["vase", "pottery", "draft"],
      personalizationAvailable: false,
      images: [],
      variants: [
        {
          sku: "VASE-GLD",
          label: "Standard",
          optionValues: new Map([["size", "Standard"]]),
          stockQuantity: 1,
          isActive: true,
        },
      ],
      isFeatured: false,
    },

    // Archived product: status is ARCHIVED (should be hidden publicly)
    {
      name: "Legacy Woolen Cap",
      slug: "legacy-woolen-cap",
      description: "An archived crochet woolen cap from last winter season.",
      categoryId: catCrochet._id,
      status: "ARCHIVED",
      fulfillmentType: "READY_MADE",
      basePriceAmount: 12000,
      currency: "EGP",
      materials: ["Wool"],
      colors: ["Grey"],
      tags: ["crochet", "cap", "winter"],
      personalizationAvailable: false,
      images: [],
      variants: [
        {
          sku: "CAP-GRY",
          label: "Standard",
          optionValues: new Map([["size", "Standard"]]),
          stockQuantity: 0,
          isActive: true,
        },
      ],
      isFeatured: false,
    },
  ]);

  console.log("Database successfully seeded.");
  process.exit(0);
}

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
