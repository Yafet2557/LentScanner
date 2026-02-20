import axios from 'axios';

const client = axios.create({
  baseURL: 'https://world.openfoodfacts.org/api/v2',
  timeout: 10000,
  headers: {
    'User-Agent': 'LentScanner/1.0 (yafettekleab04@icloud.com)',
  },
});

/**
 * Look up a product by barcode.
 * Returns { barcode, name, imageUrl, ingredientsText } or null.
 */
export async function getProduct(barcode) {
  try {
    const { data } = await client.get(`/product/${barcode}`);
    if (data.status === 1) {
      return {
        barcode: data.code,
        name: data.product?.product_name || null,
        imageUrl: data.product?.image_url || null,
        ingredientsText: data.product?.ingredients_text || null,
      };
    }
    return null;
  } catch (error) {
    throw new Error(`Failed to fetch product: ${error.message}`);
  }
}
