import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

async function main() {
  if (!uri || !dbName) {
    console.error("Missing MONGODB_URI or MONGODB_DB_NAME in environment settings.");
    console.log("Please run this script passing the variables or using node --env-file=.env.local");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(dbName);

    // Default target email or fetch from arguments
    const adminEmail = process.argv[2] || "admin@afnan-handmade.com";
    
    console.log(`Checking for user with email: ${adminEmail}...`);
    const user = await db.collection("user").findOne({ email: adminEmail.trim().toLowerCase() });
    
    if (!user) {
      console.warn(`User ${adminEmail} not found in database.`);
      console.log("Please register this email via the UI or registration page first, then re-run this script to elevate their role to ADMIN.");
      return;
    }

    const result = await db.collection("user").updateOne(
      { _id: user._id },
      { $set: { role: "ADMIN" } }
    );

    if (result.modifiedCount > 0) {
      console.log(`Success: Elevated user ${adminEmail} to ADMIN role.`);
    } else if (user.role === "ADMIN") {
      console.log(`User ${adminEmail} is already an ADMIN.`);
    } else {
      console.error(`Failed to elevate user ${adminEmail}.`);
    }
  } catch (error) {
    console.error("Error during admin creation:", error);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
