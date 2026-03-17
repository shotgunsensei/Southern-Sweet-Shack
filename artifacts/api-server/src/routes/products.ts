import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, productsTable, categoriesTable } from "@workspace/db";
import { ListProductsQueryParams, ListProductsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/products", async (req, res): Promise<void> => {
  const params = ListProductsQueryParams.safeParse(req.query);

  let query = db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      description: productsTable.description,
      price: productsTable.price,
      imageUrl: productsTable.imageUrl,
      categoryId: productsTable.categoryId,
      categoryName: categoriesTable.name,
      available: productsTable.available,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.available, true))
    .$dynamic();

  if (params.success && params.data.categoryId) {
    query = query.where(eq(productsTable.categoryId, params.data.categoryId));
  }

  const products = await query;
  res.json(ListProductsResponse.parse(products));
});

export default router;
