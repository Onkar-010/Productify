/** @format */

import type { Request, Response } from "express";

import * as queries from "../db/quires";

import { getAuth } from "@clerk/express";

//Get All Products -> Public route
export const getAllProduct = async (req: Request, res: Response) => {
  try {
    const product = await queries.getAllProducts();
    res.status(200).json(product);
  } catch (error) {
    console.error("Error getting products:", error);
    res.status(500).json({ error: "Failed to get products" });
  }
};

// Get products by current user (protected)
export const getMyProducts = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const products = await queries.getProductByUserId(userId);
    res.status(200).json(products);
  } catch (error) {
    console.error("Error getting user products:", error);
    res.status(500).json({ error: "Failed to get user products" });
  }
};

//Get A Product By Id -> Public route
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await queries.getProductById(
      Array.isArray(id) ? id[0] : id,
    );

    if (!product) return res.status(404).json({ error: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    console.error("Error getting product:", error);
    res.status(500).json({ error: "Failed to get product" });
  }
};

// Create product (protected)
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { title, description, imageUrl } = req.body;

    if (!title || !description || !imageUrl) {
      res
        .status(400)
        .json({ error: "Title, description, and imageUrl are required" });
      return;
    }

    const product = await queries.createProduct({
      name: title,
      description,
      imageUrl,
      userId,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
};

// Update product (protected - owner only)

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    const { title, description, imageUrl } = req.body;

    // 1. Guard against empty updates
    if (
      title === undefined &&
      description === undefined &&
      imageUrl === undefined
    ) {
      return res.status(400).json({
        error: "Bad Request",
        message:
          "At least one field (title, description, or imageUrl) must be provided to update.",
      });
    }

    // Check if product exists and belongs to user
    const productId = Array.isArray(id) ? id[0] : id;
    const existingProduct = await queries.getProductById(productId);
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (existingProduct.userId !== userId) {
      return res
        .status(403)
        .json({ error: "You can only update your own products" });
    }

    // 2. Safely build the update payload for Drizzle
    const updateData = {
      ...(title !== undefined && { name: title }),
      ...(description !== undefined && { description }),
      ...(imageUrl !== undefined && { imageUrl }),
    };

    const product = await queries.updateProduct(productId, updateData);

    return res.status(200).json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ error: "Failed to update product" });
  }
};

// Delete product (protected - owner only)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    // Check if product exists and belongs to user
    const productId = Array.isArray(id) ? id[0] : id;
    const existingProduct = await queries.getProductById(productId);
    if (!existingProduct) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    if (existingProduct.userId !== userId) {
      res.status(403).json({ error: "You can only delete your own products" });
      return;
    }

    await queries.deleteProduct(productId);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
};
