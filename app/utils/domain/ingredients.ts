import { AXES, createTasteProfile } from './axes'
import type { Ingredient, TasteAxis } from './types'

const rows = [
  ['FRANKS', 'Franks', 2, 7, 1, 0, 7, 2, 6, 0],
  ['PATTY', 'Beef Patty', 1, 5, 0, 1, 8, 1, 7, 1],
  ['PEPPERONI', 'Pepperoni', 1, 8, 2, 1, 7, 5, 7, 0],
  ['BEANS', 'Beans', 2, 1, 0, 1, 4, 0, 3, 2],
  ['BEEF', 'Beef', 1, 2, 0, 1, 8, 0, 6, 2],
  ['PORK', 'Pork', 2, 2, 0, 0, 7, 0, 7, 2],
  ['MUTTON', 'Mutton', 0, 2, 0, 2, 7, 1, 7, 1],
  ['CHICKEN_MEAT', 'Chicken', 1, 2, 0, 0, 5, 0, 4, 3],
  ['SALMON', 'Salmon', 1, 2, 0, 0, 7, 0, 7, 5],
  ['FISH', 'Cod Fillet', 1, 2, 0, 0, 5, 0, 3, 5],
  ['BUNS', 'Buns', 4, 2, 0, 0, 1, 0, 3, 1],
  ['BURGER_BUN', 'Burger Bun', 5, 2, 0, 0, 1, 0, 3, 1],
  ['RICE', 'Sushi Rice', 3, 1, 3, 0, 2, 0, 1, 4],
  ['NORI', 'Nori', 1, 5, 0, 2, 8, 0, 1, 4],
  ['BATTER', 'Batter', 5, 1, 0, 0, 1, 0, 4, 1],
  ['POTATO', 'Potato', 2, 1, 0, 0, 3, 0, 2, 2],
  ['DOUGH', 'Dough', 2, 1, 0, 0, 1, 0, 2, 1],
  ['TORTILLA', 'Tortilla', 2, 2, 0, 0, 2, 0, 2, 1],
  ['CHEESE', 'Cheese', 2, 6, 2, 0, 8, 0, 8, 0],
  ['MOZZARELLA', 'Mozzarella', 2, 3, 1, 0, 5, 0, 7, 3],
  ['ONIONS', 'Onions', 3, 1, 1, 1, 3, 3, 1, 4],
  ['LETTUCE', 'Lettuce', 1, 0, 0, 1, 0, 0, 0, 9],
  ['TOMATO', 'Tomato', 4, 1, 4, 0, 5, 0, 0, 7],
  ['STRAWBERRY', 'Strawberry', 7, 0, 3, 0, 0, 0, 0, 8],
  ['BANANA', 'Banana', 8, 0, 1, 0, 0, 0, 2, 5],
  ['MUSHROOM', 'Mushroom', 1, 1, 0, 1, 8, 0, 3, 3],
  ['CORN', 'Corn', 6, 1, 0, 0, 3, 0, 2, 4],
  ['WHEAT', 'Wheat', 2, 0, 0, 1, 1, 0, 1, 1],
  ['SUNFLOWER', 'Sunflower', 1, 1, 0, 1, 3, 0, 5, 0],
  ['AVOCADO', 'Avocado', 1, 0, 0, 1, 2, 0, 7, 6],
  ['CUCUMBER', 'Cucumber', 1, 0, 1, 0, 0, 0, 0, 9],
  ['SOYBEAN', 'Soybean', 2, 1, 0, 1, 5, 0, 4, 2],
  ['PEAS', 'Peas', 4, 0, 0, 0, 2, 0, 1, 6],
  ['HAZELNUT', 'Hazelnut', 3, 0, 0, 2, 2, 0, 7, 0],
  ['MUSTARD', 'Mustard', 1, 4, 5, 1, 1, 6, 1, 1],
  ['RELISH', 'Relish', 6, 3, 6, 0, 1, 1, 0, 3],
  ['KETCHUP', 'Ketchup', 7, 4, 5, 0, 3, 0, 0, 1],
  ['WASABI', 'Wasabi', 0, 1, 1, 1, 1, 10, 1, 3],
  ['SOY', 'Soy Sauce', 2, 10, 1, 1, 9, 0, 1, 0],
  ['NUTELLA', 'Hazelnut Spread', 9, 1, 0, 1, 1, 0, 8, 0],
  ['VINEGAR', 'Vinegar', 0, 0, 10, 1, 0, 1, 0, 2],
  ['TARTAR', 'Tartar Sauce', 2, 4, 5, 0, 2, 1, 7, 2],
  ['MUSHY_PEAS', 'Mushy Peas', 3, 3, 0, 1, 3, 0, 3, 2],
  ['SALSA', 'Salsa', 3, 3, 5, 0, 3, 6, 0, 7],
  ['GUAC', 'Guacamole', 1, 3, 3, 0, 3, 3, 7, 7],
] as const

export const INGREDIENTS: readonly Ingredient[] = Object.freeze(rows.map(([id, name, ...values]) => ({
  id,
  name,
  profile: createTasteProfile(values),
})))

export const INGREDIENT_BY_ID: ReadonlyMap<string, Ingredient> = new Map(INGREDIENTS.map(ingredient => [ingredient.id, ingredient]))

export function eligiblePrimaryAxes(): TasteAxis[] {
  return AXES.filter(axis => Math.max(...INGREDIENTS.map(ingredient => ingredient.profile[axis])) >= 6)
}
