const { connectDB } = require("./database");

async function main() {
  const db = await connectDB();
  if (db) {
    console.log("🎯 Base de datos lista para usar.");
  }
}

main().catch(console.error);
