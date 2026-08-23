import { connectMongoose } from "../src/lib/mongoose";
import { CategoryModel } from "../src/modules/categories/model";
import { ProductModel } from "../src/modules/products/model";
import { ShippingRateModel } from "../src/modules/shipping/model";
import { egyptGovernorates } from "../src/config/egypt-governorates";
import { assertDestructiveSeedAllowed } from "./lib/production-guard";

async function main() {
  assertDestructiveSeedAllowed(process.env.MONGODB_DB_NAME || "afnan");
  console.log("Connecting to database...");
  await connectMongoose();

  console.log("Cleaning database...");
  await CategoryModel.deleteMany({});
  await ProductModel.deleteMany({});
  await ShippingRateModel.deleteMany({});

  await ShippingRateModel.create(egyptGovernorates.map((rate) => ({
    governorateCode: rate.code, governorateName: rate.name,
    feeAmount: rate.shippingFee, minDeliveryDays: rate.minDeliveryDays,
    maxDeliveryDays: rate.maxDeliveryDays, isActive: rate.active,
  })));

  console.log("Seeding categories...");
  const categories = await CategoryModel.create([
    {
      name: "Clay Pots",
      slug: "clay-pots",
      description: "Beautiful hand-painted clay pots and ceramic planters crafted in Egypt.",
      image: {
        url: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=800",
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
    {
      name: "Handbags / Shoulder Bags",
      slug: "handbags-shoulder-bags",
      description: "Elegant handcrafted shoulder bags featuring unique weaves and designs.",
      image: {
        url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800",
        publicId: "shoulder-bags-main",
        width: 800,
        height: 1000,
      },
      sortOrder: 8,
      isActive: true,
    },
    {
      name: "Handbags / Mini Bags",
      slug: "handbags-mini-bags",
      description: "Charming mini woven and crochet shoulder bags for your essential items.",
      image: {
        url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800",
        publicId: "mini-bags-main",
        width: 800,
        height: 1000,
      },
      sortOrder: 9,
      isActive: true,
    },
    {
      name: "Handbags / Crossbody Bags",
      slug: "handbags-crossbody-bags",
      description: "Beautiful handcrafted crossbody bags combining classic crochet and leather features.",
      image: {
        url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800",
        publicId: "crossbody-bags-main",
        width: 800,
        height: 1000,
      },
      sortOrder: 10,
      isActive: true,
    },
    {
      name: "Handbags / Beach & Tote Bags",
      slug: "handbags-beach-tote-bags",
      description: "Spacious handcrafted straw and woven tote bags designed for sunny beach days.",
      image: {
        url: "https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?q=80&w=800",
        publicId: "beach-totes-main",
        width: 800,
        height: 1000,
      },
      sortOrder: 11,
      isActive: true,
    },
    {
      name: "Handbags / Mini Crossbody Bags",
      slug: "handbags-mini-crossbody-bags",
      description: "Compact and stylish mini crossbody bags with detailed woven and tassel finishes.",
      image: {
        url: "https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=800",
        publicId: "mini-crossbodies-main",
        width: 800,
        height: 1000,
      },
      sortOrder: 12,
      isActive: true,
    },
    {
      name: "Accessories / Scarves",
      slug: "accessories-scarves",
      description: "Soft, hand-finished crochet and woolen scarves to keep you warm in style.",
      image: {
        url: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?q=80&w=800",
        publicId: "accessories-scarves-main",
        width: 800,
        height: 1000,
      },
      sortOrder: 13,
      isActive: true,
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
    catShoulderBags,
    catMiniBags,
    catCrossbodyBags,
    catBeachToteBags,
    catMiniCrossbodyBags,
    catScarves,
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
        {
          url: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800",
          publicId: "aswan-pot-2",
          width: 800,
          height: 1000,
        },
        {
          url: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=800",
          publicId: "aswan-pot-3",
          width: 800,
          height: 1000,
        },
        {
          url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800",
          publicId: "aswan-pot-4",
          width: 800,
          height: 1000,
        },
        {
          url: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?q=80&w=800",
          publicId: "aswan-pot-5",
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
          url: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=800",
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
        {
          url: "https://images.unsplash.com/photo-1575413758066-59c7333884e9?q=80&w=800",
          publicId: "shawl-custom-2",
          width: 800,
          height: 1000,
        },
        {
          url: "https://images.unsplash.com/photo-1582238525500-1c05dcfd22a2?q=80&w=800",
          publicId: "shawl-custom-3",
          width: 800,
          height: 1000,
        },
        {
          url: "https://images.unsplash.com/photo-1597843798944-7f285d6b4904?q=80&w=800",
          publicId: "shawl-custom-4",
          width: 800,
          height: 1000,
        },
        {
          url: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=800",
          publicId: "shawl-custom-5",
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
    // 13. Custom Fayoum Pottery Dinner Set (Made to order)
    {
      name: "Custom Fayoum Pottery Dinner Set",
      slug: "custom-fayoum-pottery-set",
      description: "A complete hand-thrown pottery dinner set customized to your preferred glaze finish. Crafted in Fayoum's Tunis Village.",
      categoryId: catClay._id,
      status: "ACTIVE",
      fulfillmentType: "MADE_TO_ORDER",
      basePriceAmount: 240000, // EGP 2,400.00
      currency: "EGP",
      materials: ["Clay", "Natural Glaze"],
      colors: ["Green", "Brown", "Cream"],
      tags: ["pottery", "dinner-set", "clay", "fayoum"],
      personalizationAvailable: true,
      personalizationInstructions: "Specify glaze preferences (e.g. speckled green, matte white).",
      preparationDaysMin: 15,
      preparationDaysMax: 20,
      images: [
        {
          url: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800",
          publicId: "fayoum-pottery-set-1",
          width: 800,
          height: 1000,
        },
      ],
      variants: [
        {
          sku: "SET-FAY-STD",
          label: "Standard Set (12 pcs)",
          optionValues: new Map([["size", "Standard"]]),
          isActive: true,
        },
      ],
      isFeatured: false,
      publishedAt: new Date("2026-08-06T10:00:00Z"),
    },
    // 14. Custom Engraved Brass Wall Plaque (Made to order)
    {
      name: "Custom Engraved Brass Wall Plaque",
      slug: "custom-brass-wall-plaque",
      description: "Personalized solid brass wall plaque hand-hammered and custom-engraved with your chosen family name or calligraphy.",
      categoryId: catBrass._id,
      status: "ACTIVE",
      fulfillmentType: "MADE_TO_ORDER",
      basePriceAmount: 150000, // EGP 1,500.00
      currency: "EGP",
      materials: ["Solid Brass"],
      colors: ["Brass", "Gold"],
      tags: ["brass", "plaque", "decor", "calligraphy"],
      personalizationAvailable: true,
      personalizationInstructions: "Provide the name or text you wish to have engraved in Arabic calligraphy.",
      preparationDaysMin: 7,
      preparationDaysMax: 14,
      images: [
        {
          url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800",
          publicId: "brass-plaque-1",
          width: 800,
          height: 1000,
        },
      ],
      variants: [
        {
          sku: "PLQ-BRS-CUST",
          label: "Standard 30cm Plaque",
          optionValues: new Map([["size", "Standard"]]),
          isActive: true,
        },
      ],
      isFeatured: false,
      publishedAt: new Date("2026-08-06T11:00:00Z"),
    },
    // 15. Personalized Crochet Stuffed Bunny (Made to order)
    {
      name: "Personalized Crochet Stuffed Bunny",
      slug: "personalized-crochet-bunny",
      description: "A soft, hand-crocheted toy rabbit made of pure organic cotton warp and hypoallergenic fiberfill. Custom name tag available.",
      categoryId: catToys._id,
      status: "ACTIVE",
      fulfillmentType: "MADE_TO_ORDER",
      basePriceAmount: 38000, // EGP 380.00
      currency: "EGP",
      materials: ["Organic Cotton Yarn", "Fiberfill Stuffing"],
      colors: ["Cream", "Pink", "Blue"],
      tags: ["toy", "crochet", "bunny", "gift"],
      personalizationAvailable: true,
      personalizationInstructions: "Provide a name to embroider on the bunny's customizable collar tag.",
      preparationDaysMin: 3,
      preparationDaysMax: 7,
      images: [
        {
          url: "https://images.unsplash.com/photo-1559251606-c623743a6d76?q=80&w=800",
          publicId: "crochet-bunny-1",
          width: 800,
          height: 1000,
        },
      ],
      variants: [
        {
          sku: "TOY-BUN-CUST",
          label: "Crochet Bunny",
          optionValues: new Map([["size", "Standard"]]),
          isActive: true,
        },
      ],
      isFeatured: false,
      publishedAt: new Date("2026-08-06T12:00:00Z"),
    },
    // 16. Black Pleated Woven Evening Bag
    {
      name: "Black Pleated Woven Evening Bag",
      slug: "black-pleated-woven-evening-bag",
      description: "Elegant handcrafted black shoulder bag featuring a textured pleated woven design, zip-top closure, silver-tone chain strap, and decorative vintage-inspired metal charms. A sophisticated statement piece suitable for evening occasions and special events.",
      categoryId: catShoulderBags._id,
      status: "DRAFT",
      fulfillmentType: "READY_MADE",
      basePriceAmount: 85000, // EGP 850.00
      currency: "EGP",
      materials: ["Textile ribbon yarn", "fabric lining", "metal zipper", "metal chain", "metal charms"],
      colors: ["Black", "Silver"],
      tags: ["handmade", "woven", "black bag", "evening bag", "shoulder bag", "chain bag", "textured bag"],
      dimensions: { width: 30, height: 22, depth: 8, unit: "cm" },
      careInstructions: "Spot clean gently with a soft damp cloth. Do not machine wash. Keep away from excessive moisture and store in a dry place.",
      personalizationAvailable: true,
      personalizationInstructions: "Customer may request alternative colors or hardware subject to material availability.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800",
          publicId: "woven-evening-bag-1",
          width: 800,
          height: 1000,
        },
      ],
      variants: [
        {
          sku: "BAG-WOV-BLK-01",
          label: "Black / Silver",
          optionValues: new Map([["color", "Black"], ["hardware", "Silver"]]),
          stockQuantity: 5,
          isActive: true,
        },
      ],
      isFeatured: true,
    },
    // 17. Blush Pink & Ivory Woven Mini Bag
    {
      name: "Blush Pink & Ivory Woven Mini Bag",
      slug: "blush-pink-ivory-woven-mini-bag",
      description: "Charming handcrafted mini shoulder bag combining blush pink and ivory woven detailing. Finished with an elegant flap, gold-tone clasp, decorative side tassel, and delicate chain strap. Ideal for casual outings, celebrations, and feminine evening looks.",
      categoryId: catMiniBags._id,
      status: "DRAFT",
      fulfillmentType: "READY_MADE",
      basePriceAmount: 60000, // EGP 600.00
      currency: "EGP",
      materials: ["Cord yarn", "textile yarn", "metal clasp", "metal chain", "tassel"],
      colors: ["Blush Pink", "Ivory", "Gold"],
      tags: ["handmade", "pink bag", "ivory bag", "mini bag", "woven bag", "feminine", "chain bag"],
      dimensions: { width: 20, height: 14, depth: 6, unit: "cm" },
      careInstructions: "Gently spot clean only. Avoid soaking and harsh detergents. Store away from moisture and direct sunlight.",
      personalizationAvailable: true,
      personalizationInstructions: "Color combinations may be customized depending on yarn availability.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800",
          publicId: "mini-woven-bag-1",
          width: 800,
          height: 1000,
        },
      ],
      variants: [
        {
          sku: "BAG-WOV-PNK-IVR-01",
          label: "Blush Pink / Ivory",
          optionValues: new Map([["color", "Blush Pink & Ivory"]]),
          stockQuantity: 8,
          isActive: true,
        },
      ],
      isFeatured: true,
    },
    // 18. Chocolate Brown Crochet Shoulder Bag
    {
      name: "Chocolate Brown Crochet Shoulder Bag",
      slug: "chocolate-brown-crochet-shoulder-bag",
      description: "Handcrafted chocolate brown crochet shoulder bag with a structured rectangular silhouette and detailed textured stitching. Features a secure top zipper, gold-tone hardware, and an adjustable brown shoulder strap for practical everyday styling.",
      categoryId: catShoulderBags._id,
      status: "DRAFT",
      fulfillmentType: "READY_MADE",
      basePriceAmount: 75000, // EGP 750.00
      currency: "EGP",
      materials: ["Crochet cord yarn", "faux leather strap", "metal zipper", "metal hardware"],
      colors: ["Chocolate Brown", "Gold"],
      tags: ["crochet", "handmade", "brown bag", "shoulder bag", "zipper bag", "everyday bag"],
      dimensions: { width: 28, height: 15, depth: 9, unit: "cm" },
      careInstructions: "Spot clean using a lightly damp cloth. Do not machine wash. Avoid pulling the crochet stitches or exposing the bag to prolonged moisture.",
      personalizationAvailable: true,
      personalizationInstructions: "Yarn color and strap color may be customized subject to availability.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=800",
          publicId: "crochet-shoulder-bag-1",
          width: 800,
          height: 1000,
        },
      ],
      variants: [
        {
          sku: "BAG-CRO-BRN-01",
          label: "Chocolate Brown",
          optionValues: new Map([["color", "Chocolate Brown"]]),
          stockQuantity: 6,
          isActive: true,
        },
      ],
      isFeatured: false,
    },
    // 19. Chocolate Crochet Bow Crossbody Bag
    {
      name: "Chocolate Crochet Bow Crossbody Bag",
      slug: "chocolate-crochet-bow-crossbody-bag",
      description: "Feminine handcrafted crossbody bag combining a rich chocolate crochet body with a statement cream faux-leather bow flap. Finished with matching cream shoulder strap and gold-tone fittings for an elegant contrasting look.",
      categoryId: catCrossbodyBags._id,
      status: "DRAFT",
      fulfillmentType: "READY_MADE",
      basePriceAmount: 80000, // EGP 800.00
      currency: "EGP",
      materials: ["Crochet cord yarn", "faux leather", "metal hardware"],
      colors: ["Chocolate Brown", "Cream", "Gold"],
      tags: ["crochet", "bow bag", "handmade", "crossbody", "brown bag", "cream bag", "feminine"],
      dimensions: { width: 22, height: 16, depth: 7, unit: "cm" },
      careInstructions: "Spot clean the crochet and faux-leather sections separately with a soft damp cloth. Do not soak or machine wash.",
      personalizationAvailable: true,
      personalizationInstructions: "Customer may select available crochet and bow colors.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=800",
          publicId: "crochet-bow-bag-1",
          width: 800,
          height: 1000,
        },
      ],
      variants: [
        {
          sku: "BAG-CRO-BOW-BRN-01",
          label: "Chocolate / Cream",
          optionValues: new Map([["body", "Chocolate Brown"], ["bow", "Cream"]]),
          stockQuantity: 4,
          isActive: true,
        },
      ],
      isFeatured: true,
    },
    // 20. Natural Straw Tote with Colorful Trim
    {
      name: "Natural Straw Tote with Colorful Trim",
      slug: "natural-straw-tote-colorful-trim",
      description: "Spacious handcrafted natural straw tote decorated with vibrant multicolor woven trim and metallic sequin detailing. Finished with long white rope handles for a relaxed summer and beach-inspired style.",
      categoryId: catBeachToteBags._id,
      status: "DRAFT",
      fulfillmentType: "READY_MADE",
      basePriceAmount: 95000, // EGP 950.00
      currency: "EGP",
      materials: ["Natural woven straw", "cotton rope", "textile trim", "decorative sequins"],
      colors: ["Natural", "White", "Multicolor"],
      tags: ["straw bag", "beach bag", "tote", "summer", "handmade", "boho"],
      dimensions: { width: 45, height: 30, depth: 15, unit: "cm" },
      careInstructions: "Keep dry. Wipe gently with a soft cloth. Do not soak or machine wash. Store upright in a dry area to preserve shape.",
      personalizationAvailable: true,
      images: [
        {
          url: "https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?q=80&w=800",
          publicId: "straw-tote-colorful-1",
          width: 800,
          height: 1000,
        },
      ],
      variants: [
        {
          sku: "TOTE-STRAW-MULTI-01",
          label: "Multicolor Trim",
          optionValues: new Map([["trim", "Multicolor"]]),
          stockQuantity: 10,
          isActive: true,
        },
      ],
      isFeatured: true,
    },
    // 21. Natural Boho Straw Tote
    {
      name: "Natural Boho Straw Tote",
      slug: "natural-boho-straw-tote",
      description: "Handmade woven straw tote with neutral bohemian embroidery, decorative hanging coins, colorful geometric accents, and soft white rope handles. A spacious statement bag designed for summer outings and beach days.",
      categoryId: catBeachToteBags._id,
      status: "DRAFT",
      fulfillmentType: "READY_MADE",
      basePriceAmount: 105000, // EGP 1,050.00
      currency: "EGP",
      materials: ["Natural woven straw", "cotton rope", "embroidered trim", "decorative metal coins"],
      colors: ["Natural", "White", "Bronze", "Multicolor"],
      tags: ["boho", "straw tote", "beach bag", "handmade", "summer bag", "woven"],
      dimensions: { width: 40, height: 32, depth: 15, unit: "cm" },
      careInstructions: "Keep away from water and prolonged humidity. Gently wipe clean and store without crushing.",
      personalizationAvailable: true,
      images: [
        {
          url: "https://images.unsplash.com/photo-1598532187856-3b2363137b8f?q=80&w=800",
          publicId: "straw-tote-boho-1",
          width: 800,
          height: 1000,
        },
      ],
      variants: [
        {
          sku: "TOTE-STRAW-BOHO-01",
          label: "Boho Trim",
          optionValues: new Map([["style", "Boho"]]),
          stockQuantity: 7,
          isActive: true,
        },
      ],
      isFeatured: true,
    },
    // 22. Black Crochet Tassel Mini Crossbody
    {
      name: "Black Crochet Tassel Mini Crossbody",
      slug: "black-crochet-tassel-mini-crossbody",
      description: "Compact handcrafted black crochet crossbody bag featuring textured braided stitching, a secure zipper closure, oversized tassel charm, silver-tone chain strap, and decorative vintage-inspired charm.",
      categoryId: catMiniCrossbodyBags._id,
      status: "DRAFT",
      fulfillmentType: "READY_MADE",
      basePriceAmount: 45000, // EGP 450.00
      currency: "EGP",
      materials: ["Crochet cord yarn", "metal zipper", "metal chain", "textile tassel", "metal charm"],
      colors: ["Black", "Silver"],
      tags: ["crochet", "mini bag", "black bag", "tassel", "chain bag", "handmade"],
      dimensions: { width: 12, height: 20, depth: 7, unit: "cm" },
      careInstructions: "Spot clean gently. Avoid pulling tassel threads or crochet stitches. Keep metal hardware dry.",
      personalizationAvailable: true,
      personalizationInstructions: "Yarn, tassel, and hardware colors may be customized subject to availability.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=800",
          publicId: "crochet-tassel-crossbody-1",
          width: 800,
          height: 1000,
        },
      ],
      variants: [
        {
          sku: "BAG-CRO-BLK-TAS-01",
          label: "Black / Silver",
          optionValues: new Map([["color", "Black"], ["hardware", "Silver"]]),
          stockQuantity: 12,
          isActive: true,
        },
      ],
      isFeatured: true,
    },
    // 23. Soft Grey Handmade Crochet Scarf
    {
      name: "Soft Grey Handmade Crochet Scarf",
      slug: "soft-grey-handmade-crochet-scarf",
      description: "Soft handcrafted grey crochet scarf featuring a textured open-stitch pattern and long hand-finished fringe. Designed as a warm, versatile accessory for casual autumn and winter styling.",
      categoryId: catScarves._id,
      status: "DRAFT",
      fulfillmentType: "READY_MADE",
      basePriceAmount: 38000, // EGP 380.00
      currency: "EGP",
      materials: ["Crochet yarn"],
      colors: ["Light Grey"],
      tags: ["crochet scarf", "handmade scarf", "grey scarf", "winter accessory", "fringe"],
      dimensions: { width: 25, height: 170, unit: "cm" },
      careInstructions: "Hand wash gently in cool water using mild detergent. Do not bleach. Reshape and lay flat to dry.",
      personalizationAvailable: true,
      personalizationInstructions: "Available yarn colors and scarf length may be customized.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?q=80&w=800",
          publicId: "crochet-scarf-1",
          width: 800,
          height: 1000,
        },
      ],
      variants: [
        {
          sku: "SCARF-CRO-GRY-01",
          label: "Light Grey",
          optionValues: new Map([["color", "Light Grey"]]),
          stockQuantity: 15,
          isActive: true,
        },
      ],
      isFeatured: false,
    },
    // 24. Silver Grey Macramé Chain Bag
    {
      name: "Silver Grey Macramé Chain Bag",
      slug: "silver-grey-macrame-chain-bag",
      description: "Sophisticated handcrafted silver-grey macramé shoulder bag showcasing an intricate geometric woven pattern. Finished with decorative silver-tone corner hardware, front clasp, and polished chain strap for an elegant contemporary look.",
      categoryId: catShoulderBags._id,
      status: "DRAFT",
      fulfillmentType: "READY_MADE",
      basePriceAmount: 90000, // EGP 900.00
      currency: "EGP",
      materials: ["Macramé cord", "metal clasp", "metal chain", "decorative metal corners"],
      colors: ["Silver Grey", "Silver"],
      tags: ["macrame", "grey bag", "handmade", "chain bag", "evening bag", "woven bag"],
      dimensions: { width: 25, height: 17, depth: 7, unit: "cm" },
      careInstructions: "Spot clean carefully using a soft cloth. Avoid soaking, machine washing, or prolonged contact with moisture.",
      personalizationAvailable: true,
      personalizationInstructions: "Cord and hardware colors may be customized based on available materials.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1566150905458-1bf1fc15aae9?q=80&w=800",
          publicId: "macrame-chain-bag-1",
          width: 800,
          height: 1000,
        },
      ],
      variants: [
        {
          sku: "BAG-MAC-GRY-01",
          label: "Silver Grey",
          optionValues: new Map([["color", "Silver Grey"], ["hardware", "Silver"]]),
          stockQuantity: 5,
          isActive: true,
        },
      ],
      isFeatured: true,
    },
    // 25. Black Crochet & Leather Shoulder Bag
    {
      name: "Black Crochet & Leather Shoulder Bag",
      slug: "black-crochet-leather-shoulder-bag",
      description: "Modern handcrafted black shoulder bag combining rich crochet texture with smooth faux-leather panels. Features a practical front zip pocket, gold-tone zipper hardware, structured silhouette, and matching shoulder strap.",
      categoryId: catShoulderBags._id,
      status: "DRAFT",
      fulfillmentType: "READY_MADE",
      basePriceAmount: 95000, // EGP 950.00
      currency: "EGP",
      materials: ["Crochet cord yarn", "faux leather", "metal zipper", "metal hardware"],
      colors: ["Black", "Gold"],
      tags: ["crochet", "leather look", "black bag", "shoulder bag", "handmade", "zipper bag"],
      dimensions: { width: 29, height: 17, depth: 9, unit: "cm" },
      careInstructions: "Wipe faux-leather areas with a soft damp cloth and gently spot clean crochet sections. Do not soak or machine wash.",
      personalizationAvailable: true,
      personalizationInstructions: "Crochet body, leather panel, strap, and hardware colors may be customized depending on availability.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800",
          publicId: "crochet-leather-bag-1",
          width: 800,
          height: 1000,
        },
      ],
      variants: [
        {
          sku: "BAG-CRO-LTH-BLK-01",
          label: "Black / Gold",
          optionValues: new Map([["color", "Black"], ["hardware", "Gold"]]),
          stockQuantity: 6,
          isActive: true,
        },
      ],
      isFeatured: true,
    },
  ]);

  console.log("Database successfully seeded.");
  process.exit(0);
}

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
