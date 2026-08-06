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
      description: "Beautiful hand-painted clay pots from Aswan",
      image: {
        url: "https://res.cloudinary.com/demo/image/upload/v1620000000/clay-pots.jpg",
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
      description: "Warm, hand-woven Egyptian wool shawls",
      image: {
        url: "https://res.cloudinary.com/demo/image/upload/v1620000000/shawls.jpg",
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
      description: "Genuine camel and cow leather hand-stitched bags",
      image: {
        url: "https://res.cloudinary.com/demo/image/upload/v1620000000/leather-bags.jpg",
        publicId: "leather-bags-main",
        width: 800,
        height: 1000,
      },
      sortOrder: 3,
      isActive: true,
    },
    {
      name: "Seasonal Specials",
      slug: "seasonal-specials",
      description: "Hidden or inactive category for testing",
      sortOrder: 4,
      isActive: false, // Inactive category
    },
  ]);

  const [catClay, catCrochet, catLeather, catInactive] = categories;

  console.log("Seeding products...");
  await ProductModel.create([
    // Active Ready-made product with stock
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
          url: "https://res.cloudinary.com/demo/image/upload/v1620000000/aswan-pot-1.jpg",
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
        {
          sku: "POT-BLU-XL",
          label: "Extra Large (30cm)",
          optionValues: new Map([["size", "Extra Large"]]),
          priceAmount: 40000,
          stockQuantity: 2,
          isActive: false, // Inactive variant (should be hidden)
        },
      ],
      isFeatured: true,
      publishedAt: new Date("2026-08-01T12:00:00Z"),
    },

    // Active Made-to-Order product with preparation time
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
          url: "https://res.cloudinary.com/demo/image/upload/v1620000000/shawl-custom.jpg",
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
          stockQuantity: undefined, // Made to order doesn't expose stock
          isActive: true,
        },
      ],
      isFeatured: true,
      publishedAt: new Date("2026-08-02T10:00:00Z"),
    },

    // Active Ready-made product (Leather Bag)
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
          url: "https://res.cloudinary.com/demo/image/upload/v1620000000/leather-bag-1.jpg",
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
