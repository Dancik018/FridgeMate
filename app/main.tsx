import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  selected: boolean;
  image?: string;
  category?: string;
}

const API_KEY = '56e10878db404c18b7b62715d97f59ed';
const BASE_URL = 'https://api.spoonacular.com/food';

export default function Main() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialProducts();
  }, []);

  const fetchInitialProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${BASE_URL}/ingredients/random?number=20&apiKey=${API_KEY}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format from API');
      }

      const formattedProducts = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        selected: false,
        image: item.image ? `https://spoonacular.com/cdn/ingredients_100x100/${item.image}` : undefined,
      }));
      
      const sortedProducts = formattedProducts.sort((a: Product, b: Product) => 
        a.name.localeCompare(b.name)
      );
      
      setProducts(sortedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while fetching products');
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (query: string) => {
    if (query.length > 2) {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${BASE_URL}/ingredients/search?query=${encodeURIComponent(query)}&number=20&apiKey=${API_KEY}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.results || !Array.isArray(data.results)) {
          throw new Error('Invalid search response format from API');
        }

        const searchResults = data.results.map((item: any) => ({
          id: item.id,
          name: item.name,
          selected: false,
          image: item.image ? `https://spoonacular.com/cdn/ingredients_100x100/${item.image}` : undefined,
        }));
        
        const sortedResults = searchResults.sort((a: Product, b: Product) => 
          a.name.localeCompare(b.name)
        );
        
        setProducts(sortedResults);
      } catch (error) {
        console.error('Error searching products:', error);
        setError(error instanceof Error ? error.message : 'An error occurred while searching products');
      } finally {
        setLoading(false);
      }
    } else if (query.length === 0) {
      fetchInitialProducts();
    }
  };

  const toggleProduct = (id: number) => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, selected: !product.selected } : product
    ));
  };

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 bg-gray-50">
        <Text className="text-2xl font-bold mb-4">Pantry</Text>
        <TextInput
          className="bg-white p-3 rounded-lg border border-gray-300 text-base"
          placeholder="Search for ingredients..."
          value={searchQuery}
          onChangeText={(text: string) => {
            setSearchQuery(text);
            searchProducts(text);
          }}
        />
      </View>

      <ScrollView className="flex-1">
        {loading ? (
          <Text className="p-5 text-center text-base text-gray-600">
            Loading products...
          </Text>
        ) : error ? (
          <View className="p-5">
            <Text className="text-center text-base text-red-600 mb-4">
              {error}
            </Text>
            <TouchableOpacity 
              className="bg-primary p-3 rounded-lg"
              onPress={fetchInitialProducts}
            >
              <Text className="text-white text-center">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : products.length === 0 ? (
          <Text className="p-5 text-center text-base text-gray-600">
            No products found
          </Text>
        ) : (
          products.map((product: Product) => (
            <TouchableOpacity
              key={product.id}
              className="p-3 border-b border-gray-200"
              onPress={() => toggleProduct(product.id)}
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center flex-1">
                  {product.image && (
                    <Image 
                      source={{ uri: product.image }} 
                      className="w-12 h-12 rounded-full mr-3"
                    />
                  )}
                  <Text className="flex-1 text-base capitalize">
                    {product.name}
                  </Text>
                </View>
                <View 
                  className={`w-6 h-6 border-2 border-primary rounded justify-center items-center ml-3 ${
                    product.selected ? 'bg-primary' : 'bg-white'
                  }`}
                >
                  {product.selected && (
                    <Text className="text-white text-base">✓</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

