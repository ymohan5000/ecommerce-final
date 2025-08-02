import type { Product } from "./types";

export const products: Product[] = [
  {
    id: "1",
    name: "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
    description:
      "Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday",
    price: 109.95,
    image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
    category: "men's clothing",
    rating: { stars: 3.9, count: 120 },
  },
  {
    id: "2",
    name: "Mens Casual Premium Slim Fit T-Shirts ",
    description:
      "Slim-fitting style, contrast raglan long sleeve, three-button henley placket, light weight & soft fabric for breathable and comfortable wearing. And Solid stitched shirts with round neck made for durability and a great fit for casual fashion wear and diehard baseball fans. The Henley style round neckline includes a three-button placket.",
    price: 22.3,
    image: "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
    category: "men's clothing",
    rating: { stars: 4.1, count: 259 },
  },
  {
    id: "3",
    name: "Mens Cotton Jacket",
    description:
      "great outerwear jackets for Spring/Autumn/Winter, suitable for many occasions, such as working, hiking, camping, mountain/rock climbing, cycling, traveling or other outdoors. Good gift choice for you or your family member. A warm hearted love to Father, husband or son in this thanksgiving or Christmas Day.",
    price: 55.99,
    image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
    category: "men's clothing",
    rating: { stars: 4.7, count: 500 },
  },
  {
    id: "4",
    name: "Mens Casual Slim Fit",
    description:
      "The color could be slightly different between on the screen and in practice. / Please note that body builds vary by person, therefore, detailed size information should be reviewed below on the product description.",
    price: 15.99,
    image: "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg",
    category: "men's clothing",
    rating: { stars: 2.1, count: 430 },
  },
  {
    id: "5",
    name: "John Hardy Women's Legends Naga Gold & Silver Dragon Station Chain Bracelet",
    description:
      "From our Legends Collection, the Naga was inspired by the mythical water dragon that protects the ocean's pearl. Wear facing inward to be bestowed with love and abundance, or outward for protection.",
    price: 695,
    image: "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg",
    category: "jewelery",
    rating: { stars: 4.6, count: 400 },
  },
  {
    id: "6",
    name: "Solid Gold Petite Micropave ",
    description:
      "Satisfaction Guaranteed. Return or exchange any order within 30 days.Designed and sold by Hafeez Center in the United States. Satisfaction Guaranteed. Return or exchange any order within 30 days.",
    price: 168,
    image: "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg",
    category: "jewelery",
    rating: { stars: 3.9, count: 70 },
  },
  {
    id: "7",
    name: "White Gold Plated Princess",
    description:
      "Classic Created Wedding Engagement Solitaire Diamond Promise Ring for Her. Gifts to spoil your love more for Engagement, Wedding, Anniversary, Valentine's Day...",
    price: 9.99,
    image: "https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_QL65_ML3_.jpg",
    category: "jewelery",
    rating: { stars: 3, count: 400 },
  },
  {
    id: "8",
    name: "Pierced Owl Rose Gold Plated Stainless Steel Double",
    description:
      "Rose Gold Plated Double Flared Tunnel Plug Earrings. Made of 316L Stainless Steel",
    price: 10.99,
    image: "https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_ML3_.jpg",
    category: "jewelery",
    rating: { stars: 1.9, count: 100 },
  },
];

export async function getProducts(): Promise<Product[]> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(products);
    }, 500);
  });
}
