// Lightweight type re-exports to satisfy legacy imports across the UI components
import type { Product as ApiProduct, IngredientDTO, OfferDTO, FeedbackDTO, RegulatoryLabelDTO } from '../types/api';

export type Ingredient = IngredientDTO;
export type PurchaseLink = OfferDTO;
export type RegulatoryLabel = RegulatoryLabelDTO;
export type Review = FeedbackDTO;
export type Product = ApiProduct;

export {};

