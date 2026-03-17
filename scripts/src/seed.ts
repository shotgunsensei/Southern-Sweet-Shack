import bcrypt from "bcryptjs";
import { db, pool, categoriesTable, productsTable, adminUsersTable } from "@workspace/db";

async function seed() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("Burney2026!", 10);
  await db
    .insert(adminUsersTable)
    .values({ username: "Admin", passwordHash })
    .onConflictDoNothing();
  console.log("Admin user created");

  const categoryData = [
    { name: "Cakes", displayOrder: 1 },
    { name: "Cupcakes", displayOrder: 2 },
    { name: "Pies", displayOrder: 3 },
    { name: "Cookies & Pastries", displayOrder: 4 },
    { name: "Savory Items", displayOrder: 5 },
    { name: "Specialty Items", displayOrder: 6 },
  ];

  const categories = await db
    .insert(categoriesTable)
    .values(categoryData)
    .onConflictDoNothing()
    .returning();

  if (categories.length === 0) {
    console.log("Categories already exist, skipping product seed");
    await pool.end();
    return;
  }

  console.log(`Created ${categories.length} categories`);

  const catMap = new Map(categories.map((c) => [c.name, c.id]));

  const productData = [
    { name: "Coconut Cake", description: "Classic Southern coconut cake with fluffy coconut frosting", price: "32.99", categoryId: catMap.get("Cakes")!, imageUrl: "" },
    { name: "Pineapple Cake", description: "Tropical pineapple cake with cream cheese frosting", price: "34.99", categoryId: catMap.get("Cakes")!, imageUrl: "" },
    { name: "Boston Cream Pie", description: "Rich custard-filled cake with chocolate ganache", price: "28.99", categoryId: catMap.get("Cakes")!, imageUrl: "" },
    { name: "Naked Cake", description: "Rustic unfrosted layer cake with fresh fruit", price: "36.99", categoryId: catMap.get("Cakes")!, imageUrl: "" },
    { name: "Cheesecake", description: "Creamy New York style cheesecake", price: "29.99", categoryId: catMap.get("Cakes")!, imageUrl: "" },
    { name: "Strawberry Shortcake", description: "Light sponge cake with fresh strawberries and whipped cream", price: "26.99", categoryId: catMap.get("Cakes")!, imageUrl: "" },

    { name: "Beach Cupcakes", description: "Themed cupcakes with beach decorations", price: "3.99", categoryId: catMap.get("Cupcakes")!, imageUrl: "" },
    { name: "Watermelon Cupcakes", description: "Fun watermelon-flavored cupcakes", price: "3.99", categoryId: catMap.get("Cupcakes")!, imageUrl: "" },
    { name: "Themed Cupcakes", description: "Custom themed cupcakes for any occasion", price: "4.49", categoryId: catMap.get("Cupcakes")!, imageUrl: "" },
    { name: "Classic Cupcakes", description: "Assorted flavors with buttercream frosting", price: "3.49", categoryId: catMap.get("Cupcakes")!, imageUrl: "" },

    { name: "Pecan Pie", description: "Southern pecan pie with buttery crust", price: "22.99", categoryId: catMap.get("Pies")!, imageUrl: "" },
    { name: "Strawberry Pie", description: "Fresh strawberry pie with flaky crust", price: "19.99", categoryId: catMap.get("Pies")!, imageUrl: "" },
    { name: "Meringue Pie", description: "Light and airy meringue-topped pie", price: "21.99", categoryId: catMap.get("Pies")!, imageUrl: "" },

    { name: "Cookie Pops", description: "Decorated cookie pops on a stick", price: "4.99", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Brownies", description: "Rich and fudgy chocolate brownies", price: "3.49", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Assorted Cookies", description: "Fresh-baked assorted cookies", price: "2.99", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Cannolis", description: "Crispy shells filled with sweet ricotta", price: "4.99", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Cinnamon Rolls", description: "Warm cinnamon rolls with cream cheese icing", price: "4.49", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Croissants", description: "Buttery French croissants, baked fresh daily", price: "3.99", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Turtle Croissants", description: "Croissants topped with chocolate, caramel, and pecans", price: "5.49", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Macarons", description: "French macarons in assorted flavors", price: "2.99", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Apple Fritters", description: "Golden fried apple fritters with glaze", price: "3.99", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Chocolate Pretzels", description: "Soft pretzels dipped in chocolate", price: "4.49", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },

    { name: "Chicken Casserole", description: "Hearty chicken casserole with seasonal vegetables", price: "12.99", categoryId: catMap.get("Savory Items")!, imageUrl: "" },
    { name: "Chicken Salad Plate", description: "Fresh chicken salad served with crackers and fruit", price: "10.99", categoryId: catMap.get("Savory Items")!, imageUrl: "" },
    { name: "Pimento Cheese Plate", description: "House-made pimento cheese with crackers", price: "9.99", categoryId: catMap.get("Savory Items")!, imageUrl: "" },
    { name: "Taco Pie", description: "Savory taco pie with all the fixings", price: "11.99", categoryId: catMap.get("Savory Items")!, imageUrl: "" },

    { name: "Chocolate-Covered Strawberries", description: "Fresh strawberries dipped in rich chocolate", price: "18.99", categoryId: catMap.get("Specialty Items")!, imageUrl: "" },
    { name: "Vegan Chocolate", description: "Artisan vegan chocolate treats", price: "8.99", categoryId: catMap.get("Specialty Items")!, imageUrl: "" },
    { name: "Cake Pops", description: "Bite-size cake on a stick with decorative coating", price: "3.99", categoryId: catMap.get("Specialty Items")!, imageUrl: "" },
    { name: "Pet Barkery Treats", description: "Dog-safe baked treats for your furry friends", price: "6.99", categoryId: catMap.get("Specialty Items")!, imageUrl: "" },
  ];

  await db.insert(productsTable).values(productData);
  console.log(`Created ${productData.length} products`);

  console.log("Seeding complete!");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
