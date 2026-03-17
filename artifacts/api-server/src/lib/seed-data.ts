import bcrypt from "bcryptjs";
import { db, categoriesTable, productsTable, adminUsersTable } from "@workspace/db";
import { count } from "drizzle-orm";

export async function seedIfEmpty() {
  const [{ value: productCount }] = await db.select({ value: count() }).from(productsTable);
  if (productCount > 0) {
    console.log(`Database already has ${productCount} products, skipping seed.`);
    return;
  }

  console.log("Production database is empty, seeding...");

  const passwordHash = await bcrypt.hash("Burney2026!", 10);
  await db
    .insert(adminUsersTable)
    .values({ username: "Admin", passwordHash })
    .onConflictDoNothing();

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
    console.log("Categories already exist but no products found. Skipping.");
    return;
  }

  const catMap = new Map(categories.map((c) => [c.name, c.id]));

  const productData = [
    { name: "Coconut Cake", description: "Classic Southern coconut cake with fluffy coconut frosting", price: "32.99", categoryId: catMap.get("Cakes")!, imageUrl: "" },
    { name: "Pineapple Cake", description: "Tropical pineapple cake with cream cheese frosting", price: "34.99", categoryId: catMap.get("Cakes")!, imageUrl: "" },
    { name: "Boston Cream Pie", description: "Rich custard-filled cake with chocolate ganache", price: "28.99", categoryId: catMap.get("Cakes")!, imageUrl: "" },
    { name: "Naked Cake", description: "Rustic unfrosted layer cake with fresh fruit", price: "36.99", categoryId: catMap.get("Cakes")!, imageUrl: "" },
    { name: "Cheesecake", description: "Creamy New York style cheesecake", price: "29.99", categoryId: catMap.get("Cakes")!, imageUrl: "" },
    { name: "Strawberry Shortcake", description: "Light sponge cake with fresh strawberries and whipped cream", price: "26.99", categoryId: catMap.get("Cakes")!, imageUrl: "" },
    { name: "Red Velvet Cake", description: "Three-layer red velvet cake with cream cheese frosting", price: "38.99", categoryId: catMap.get("Cakes")!, imageUrl: "" },
    { name: "German Chocolate Cake", description: "Classic German chocolate cake with coconut pecan frosting", price: "36.99", categoryId: catMap.get("Cakes")!, imageUrl: "" },
    { name: "Carrot Cake", description: "Moist carrot cake loaded with walnuts, raisins, and cream cheese frosting", price: "34.99", categoryId: catMap.get("Cakes")!, imageUrl: "" },
    { name: "Lemon Layer Cake", description: "Bright lemon cake with lemon curd filling and lemon buttercream", price: "32.99", categoryId: catMap.get("Cakes")!, imageUrl: "" },
    { name: "Chocolate Ganache Cake", description: "Decadent chocolate cake with rich ganache and fresh berries", price: "39.99", categoryId: catMap.get("Cakes")!, imageUrl: "" },
    { name: "Tres Leches Cake", description: "Traditional three-milk soaked cake with whipped cream", price: "28.99", categoryId: catMap.get("Cakes")!, imageUrl: "" },

    { name: "Beach Cupcakes", description: "Themed cupcakes with beach decorations", price: "3.99", categoryId: catMap.get("Cupcakes")!, imageUrl: "" },
    { name: "Watermelon Cupcakes", description: "Fun watermelon-flavored cupcakes", price: "3.99", categoryId: catMap.get("Cupcakes")!, imageUrl: "" },
    { name: "Themed Cupcakes", description: "Custom themed cupcakes for any occasion", price: "4.49", categoryId: catMap.get("Cupcakes")!, imageUrl: "" },
    { name: "Classic Cupcakes", description: "Assorted flavors with buttercream frosting", price: "3.49", categoryId: catMap.get("Cupcakes")!, imageUrl: "" },
    { name: "Red Velvet Cupcakes", description: "Moist red velvet cupcakes with cream cheese frosting", price: "4.49", categoryId: catMap.get("Cupcakes")!, imageUrl: "" },
    { name: "Chocolate Fudge Cupcakes", description: "Rich chocolate cupcakes with chocolate fudge frosting", price: "4.49", categoryId: catMap.get("Cupcakes")!, imageUrl: "" },
    { name: "Vanilla Bean Cupcakes", description: "Light vanilla cupcakes with real vanilla bean buttercream", price: "3.99", categoryId: catMap.get("Cupcakes")!, imageUrl: "" },
    { name: "Strawberry Swirl Cupcakes", description: "Strawberry cupcakes with pink swirl frosting", price: "4.49", categoryId: catMap.get("Cupcakes")!, imageUrl: "" },
    { name: "Salted Caramel Cupcakes", description: "Caramel-filled cupcakes with salted caramel buttercream", price: "4.99", categoryId: catMap.get("Cupcakes")!, imageUrl: "" },
    { name: "Lemon Drop Cupcakes", description: "Tangy lemon cupcakes with lemon curd filling", price: "4.49", categoryId: catMap.get("Cupcakes")!, imageUrl: "" },
    { name: "Cookies & Cream Cupcakes", description: "Oreo-studded cupcakes with cookies and cream frosting", price: "4.49", categoryId: catMap.get("Cupcakes")!, imageUrl: "" },
    { name: "Peanut Butter Cup Cupcakes", description: "Chocolate cupcakes with peanut butter frosting and Reese's topping", price: "4.99", categoryId: catMap.get("Cupcakes")!, imageUrl: "" },

    { name: "Pecan Pie", description: "Southern pecan pie with buttery crust", price: "22.99", categoryId: catMap.get("Pies")!, imageUrl: "" },
    { name: "Strawberry Pie", description: "Fresh strawberry pie with flaky crust", price: "19.99", categoryId: catMap.get("Pies")!, imageUrl: "" },
    { name: "Meringue Pie", description: "Light and airy meringue-topped pie", price: "21.99", categoryId: catMap.get("Pies")!, imageUrl: "" },
    { name: "Sweet Potato Pie", description: "Southern sweet potato pie with a buttery graham cracker crust", price: "22.99", categoryId: catMap.get("Pies")!, imageUrl: "" },
    { name: "Apple Pie", description: "Classic double-crust apple pie with cinnamon and nutmeg", price: "21.99", categoryId: catMap.get("Pies")!, imageUrl: "" },
    { name: "Key Lime Pie", description: "Tangy key lime pie with graham cracker crust and whipped cream", price: "23.99", categoryId: catMap.get("Pies")!, imageUrl: "" },
    { name: "Banana Cream Pie", description: "Creamy banana custard pie with whipped topping", price: "21.99", categoryId: catMap.get("Pies")!, imageUrl: "" },
    { name: "Coconut Cream Pie", description: "Silky coconut custard pie topped with toasted coconut flakes", price: "22.99", categoryId: catMap.get("Pies")!, imageUrl: "" },
    { name: "Chocolate Silk Pie", description: "Smooth and rich chocolate silk pie with a cookie crust", price: "24.99", categoryId: catMap.get("Pies")!, imageUrl: "" },

    { name: "Cookie Pops", description: "Decorated cookie pops on a stick", price: "4.99", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Brownies", description: "Rich and fudgy chocolate brownies", price: "3.49", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Assorted Cookies", description: "Fresh-baked assorted cookies", price: "2.99", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Cannolis", description: "Crispy shells filled with sweet ricotta", price: "4.99", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Cinnamon Rolls", description: "Warm cinnamon rolls with cream cheese icing", price: "4.49", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Croissants", description: "Buttery French croissants, baked fresh daily", price: "3.99", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Turtle Croissants", description: "Croissants topped with chocolate, caramel, and pecans", price: "5.49", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Almond Croissant", description: "Flaky croissant filled with almond cream and topped with sliced almonds", price: "5.49", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Chocolate Croissant", description: "Buttery croissant filled with rich dark chocolate", price: "4.99", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Ham & Cheese Croissant", description: "Savory croissant stuffed with smoked ham and melted Swiss cheese", price: "6.49", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Strawberry Cream Croissant", description: "Light croissant filled with fresh strawberry cream", price: "5.99", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Everything Croissant", description: "Savory croissant with everything bagel seasoning and cream cheese", price: "5.99", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Blueberry Croissant", description: "Flaky croissant bursting with sweet blueberry filling", price: "5.49", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Macarons", description: "French macarons in assorted flavors", price: "2.99", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Apple Fritters", description: "Golden fried apple fritters with glaze", price: "3.99", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Chocolate Pretzels", description: "Soft pretzels dipped in chocolate", price: "4.49", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Chocolate Chip Cookies", description: "Classic homemade chocolate chip cookies, soft and chewy", price: "2.49", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Snickerdoodle Cookies", description: "Soft cinnamon-sugar coated cookies", price: "2.49", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Peanut Butter Cookies", description: "Rich peanut butter cookies with a criss-cross top", price: "2.49", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Oatmeal Raisin Cookies", description: "Hearty oatmeal cookies with plump raisins and warm spices", price: "2.49", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Red Velvet Cookies", description: "Soft red velvet cookies with white chocolate chips", price: "2.99", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Lemon Sugar Cookies", description: "Bright lemon-glazed sugar cookies", price: "2.99", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "Double Chocolate Cookies", description: "Intensely chocolatey cookies with chocolate chunks", price: "2.99", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },
    { name: "White Macadamia Cookies", description: "White chocolate and macadamia nut cookies", price: "3.49", categoryId: catMap.get("Cookies & Pastries")!, imageUrl: "" },

    { name: "Chicken Casserole", description: "Hearty chicken casserole with seasonal vegetables", price: "12.99", categoryId: catMap.get("Savory Items")!, imageUrl: "" },
    { name: "Chicken Salad Plate", description: "Fresh chicken salad served with crackers and fruit", price: "10.99", categoryId: catMap.get("Savory Items")!, imageUrl: "" },
    { name: "Pimento Cheese Plate", description: "House-made pimento cheese with crackers", price: "9.99", categoryId: catMap.get("Savory Items")!, imageUrl: "" },
    { name: "Taco Pie", description: "Savory taco pie with all the fixings", price: "11.99", categoryId: catMap.get("Savory Items")!, imageUrl: "" },
    { name: "Quiche Lorraine", description: "Classic French quiche with bacon, Swiss cheese, and onion", price: "12.99", categoryId: catMap.get("Savory Items")!, imageUrl: "" },
    { name: "Spinach & Feta Quiche", description: "Light spinach and feta cheese quiche with herbs", price: "11.99", categoryId: catMap.get("Savory Items")!, imageUrl: "" },
    { name: "Sausage Rolls", description: "Flaky pastry wrapped around seasoned sausage", price: "5.99", categoryId: catMap.get("Savory Items")!, imageUrl: "" },
    { name: "Ham & Cheese Sliders", description: "Mini Hawaiian roll sliders with ham and melted cheese", price: "8.99", categoryId: catMap.get("Savory Items")!, imageUrl: "" },

    { name: "Chocolate-Covered Strawberries", description: "Fresh strawberries dipped in rich chocolate", price: "18.99", categoryId: catMap.get("Specialty Items")!, imageUrl: "" },
    { name: "Vegan Chocolate", description: "Artisan vegan chocolate treats", price: "8.99", categoryId: catMap.get("Specialty Items")!, imageUrl: "" },
    { name: "Cake Pops", description: "Bite-size cake on a stick with decorative coating", price: "3.99", categoryId: catMap.get("Specialty Items")!, imageUrl: "" },
    { name: "Pet Barkery Treats", description: "Dog-safe baked treats for your furry friends", price: "6.99", categoryId: catMap.get("Specialty Items")!, imageUrl: "" },
    { name: "Chocolate Truffles (6pc)", description: "Assorted handmade chocolate truffles in a gift box", price: "14.99", categoryId: catMap.get("Specialty Items")!, imageUrl: "" },
    { name: "Candy Apples", description: "Fresh apples dipped in caramel with assorted toppings", price: "7.99", categoryId: catMap.get("Specialty Items")!, imageUrl: "" },
    { name: "Rice Krispie Treats", description: "Decorated rice krispie treats for any occasion", price: "3.99", categoryId: catMap.get("Specialty Items")!, imageUrl: "" },
    { name: "Edible Cookie Dough", description: "Safe-to-eat cookie dough cups in assorted flavors", price: "5.99", categoryId: catMap.get("Specialty Items")!, imageUrl: "" },
    { name: "Hot Cocoa Bombs", description: "Rich chocolate spheres that melt into hot cocoa with marshmallows", price: "6.99", categoryId: catMap.get("Specialty Items")!, imageUrl: "" },
    { name: "Custom Sugar Cookies (Dozen)", description: "Hand-decorated sugar cookies for birthdays, holidays, and events", price: "24.99", categoryId: catMap.get("Specialty Items")!, imageUrl: "" },
  ];

  await db.insert(productsTable).values(productData);
  console.log(`Seeded ${productData.length} products, ${categories.length} categories, and admin user.`);
}
