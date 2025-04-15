import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, SafeAreaView } from 'react-native';
import { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  selected: boolean;
  image?: string;
}

interface Category {
  id: string;
  name: string;
  query: string;
}

const API_KEY = '39c39847a9754980bc6409c0e1e0eda8';

const CATEGORIES: Category[] = [
  { id: 'all', name: 'All', query: 'food' },
  { id: 'fruits', name: 'Fruits', query: 'fruit' },
  { id: 'vegetables', name: 'Vegetables', query: 'vegetable' },
  { id: 'meat', name: 'Meat', query: 'meat' },
  { id: 'dairy', name: 'Dairy', query: 'dairy' },
  { id: 'grains', name: 'Grains', query: 'grain' }
];

export default function Main() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>(CATEGORIES[0]);

  const fetchWithTimeout = async (url: string, options = {}, timeout = 10000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  };

  useEffect(() => {
    fetchProductsByCategory(selectedCategory);
  }, [selectedCategory]);

  const fetchProductsByCategory = async (category: Category) => {
    setLoading(true);
    setError(null);
    try {
      if (category.id === 'all') {
        // Fetch products from all categories
        const allProductsPromises = CATEGORIES.filter(cat => cat.id !== 'all').map(cat =>
          fetchWithTimeout(
            `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(cat.query)}&number=10&apiKey=${API_KEY}&category=${encodeURIComponent(cat.query)}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
            }
          ).then(response => response.json())
        );

        const results = await Promise.all(allProductsPromises);
        const allProducts = results.flatMap((data, categoryIndex) => 
          data.results.map((item: any) => ({
            id: `${item.id}-${categoryIndex}`,
            name: item.name,
            selected: false,
            image: item.image ? `https://spoonacular.com/cdn/ingredients_100x100/${item.image}` : undefined,
          }))
        );

        setProducts(allProducts);
      } else {
        const response = await fetchWithTimeout(
          `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(category.query)}&number=50&apiKey=${API_KEY}&category=${encodeURIComponent(category.query)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.results) {
          throw new Error('Invalid API response format');
        }

        const formattedProducts = data.results.map((item: any) => ({
          id: `${item.id}-${category.id}`,
          name: item.name,
          selected: false,
          image: item.image ? `https://spoonacular.com/cdn/ingredients_100x100/${item.image}` : undefined,
        }));
        
        setProducts(formattedProducts);
      }
      setError(null);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error.message : 'Failed to load products. Please check your internet connection.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (query: string) => {
    if (query.length > 2) {
      setLoading(true);
      setError(null);
      try {
        let url = `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(query)}&number=50&apiKey=${API_KEY}`;
        
        if (selectedCategory.id !== 'all') {
          url += `&category=${encodeURIComponent(selectedCategory.query)}`;
        }

        const response = await fetchWithTimeout(
          url,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.results) {
          throw new Error('Invalid API response format');
        }

        const searchResults = data.results.map((item: any) => ({
          id: `${item.id}-search-${selectedCategory.id}`,
          name: item.name,
          selected: false,
          image: item.image ? `https://spoonacular.com/cdn/ingredients_100x100/${item.image}` : undefined,
        }));
        
        setProducts(searchResults);
        setError(null);
      } catch (error) {
        console.error('Error searching products:', error);
        setError(error instanceof Error ? error.message : 'Failed to search products. Please check your internet connection.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    } else if (query.length === 0) {
      fetchProductsByCategory(selectedCategory);
    }
  };

  const toggleProduct = (id: number) => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, selected: !product.selected } : product
    ));
  };

  const retryFetch = () => {
    if (searchQuery.length > 2) {
      searchProducts(searchQuery);
    } else {
      fetchProductsByCategory(selectedCategory);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F3F4F6]">
      <View className="px-4 py-3 bg-white shadow-sm">
        <Text className="text-2xl font-bold mb-3 text-[#1F2937]">Fridge-Mate</Text>
        <TextInput
          className="bg-[#F9FAFB] px-4 py-2 rounded-lg border border-[#E5E7EB] text-[#374151] mb-3"
          placeholder="Search for ingredients..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={(text: string) => {
            setSearchQuery(text);
            searchProducts(text);
          }}
        />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="flex-row -mx-1"
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              className={`px-4 py-2 rounded-full mr-2 ${
                selectedCategory.id === category.id
                  ? 'bg-[#10B981]'
                  : 'bg-[#E5E7EB]'
              }`}
              onPress={() => {
                setSelectedCategory(category);
                setSearchQuery('');
              }}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedCategory.id === category.id
                    ? 'text-white'
                    : 'text-[#374151]'
                }`}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        {loading ? (
          <Text className="p-5 text-center text-[#6B7280]">
            Loading products...
          </Text>
        ) : error ? (
          <View className="p-5">
            <Text className="text-center text-[#EF4444] mb-4">
              {error}
            </Text>
            <TouchableOpacity
              className="bg-[#10B981] py-3 px-4 rounded-lg active:bg-[#059669]"
              onPress={retryFetch}
            >
              <Text className="text-white text-center font-medium">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : products.length === 0 ? (
          <Text className="p-5 text-center text-[#6B7280]">
            No products found
          </Text>
        ) : (
          <View className="px-4">
            {products.map((product: Product) => (
              <TouchableOpacity
                key={product.id}
                className="flex-row items-center py-3 border-b border-[#E5E7EB]"
                onPress={() => toggleProduct(product.id)}
              >
                <View className="flex-row items-center flex-1 bg-white rounded-lg p-2">
                  {product.image && (
                    <Image 
                      source={{ uri: product.image }} 
                      className="w-14 h-14 rounded-lg mr-3"
                      style={{ backgroundColor: '#F3F4F6' }}
                    />
                  )}
                  <Text className="flex-1 text-base font-medium capitalize text-[#374151]">
                    {product.name}
                  </Text>
                  <View 
                    className={`w-6 h-6 rounded-md justify-center items-center ${
                      product.selected 
                        ? 'bg-[#10B981]' 
                        : 'bg-white border-2 border-[#D1D5DB]'
                    }`}
                  >
                    {product.selected && (
                      <Text className="text-white text-sm">✓</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
