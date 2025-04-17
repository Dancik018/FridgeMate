import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface Recipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  ingredients: any[];
}

const API_KEY = '6e2dfe289f3944549989ab065c7f8a90';

export default function Recete() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.ingredients) {
      fetchRecipes(params.ingredients as string);
    }
  }, [params.ingredients]);

  const fetchRecipes = async (ingredients: string) => {
    setLoading(true);
    setError(null);
    try {
      const formattedIngredients = ingredients.split(',').map(i => i.trim()).join(',');
      
      const response = await fetch(
        `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${API_KEY}&ingredients=${encodeURIComponent(formattedIngredients)}&number=10&ranking=1&ignorePantry=true`,
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
      
      if (data && data.length > 0) {
        const recipeDetails = await Promise.all(
          data.map(async (recipe: any) => {
            const detailResponse = await fetch(
              `https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${API_KEY}`,
              {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );
            if (detailResponse.ok) {
              return detailResponse.json();
            }
            return null;
          })
        );

        const validRecipes = recipeDetails.filter((recipe): recipe is Recipe => 
          recipe !== null && 
          recipe.title && 
          recipe.image && 
          recipe.readyInMinutes && 
          recipe.servings
        );

        setRecipes(validRecipes);
      } else {
        setRecipes([]);
      }
      setError(null);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setError(error instanceof Error ? error.message : 'Nu s-au putut încărca rețetele. Vă rugăm să încercați mai târziu.');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F3F4F6]">
      <View className="px-4 py-3 bg-white shadow-sm">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-[#328E6E]">Rețete</Text>
          <TouchableOpacity
            className="bg-[#90C67C] py-2 px-4 rounded-lg active:bg-[#67AE6E]"
            onPress={() => router.back()}
          >
            <Text className="text-[#E1EEBC] font-medium">Înapoi</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {loading ? (
          <Text className="text-center text-[#67AE6E]">Se încarcă rețetele...</Text>
        ) : error ? (
          <View className="items-center">
            <Text className="text-center text-[#EF4444] mb-4">{error}</Text>
            <TouchableOpacity
              className="bg-[#90C67C] py-3 px-4 rounded-lg active:bg-[#67AE6E]"
              onPress={() => fetchRecipes(params.ingredients as string)}
            >
              <Text className="text-[#E1EEBC] text-center font-medium">Încearcă din nou</Text>
            </TouchableOpacity>
          </View>
        ) : recipes.length === 0 ? (
          <Text className="text-center text-[#67AE6E]">Nu s-au găsit rețete pentru ingredientele selectate</Text>
        ) : (
          <View className="space-y-6">
            {recipes.map((recipe) => (
              <View key={recipe.id} className="border-b border-[#E5E7EB] pb-6">
                <TouchableOpacity
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                  onPress={() => {
                    console.log('Navigate to recipe details:', recipe.id);
                  }}
                >
                  <Image
                    source={{ uri: recipe.image }}
                    className="w-full h-48"
                    style={{ backgroundColor: '#F3F4F6' }}
                  />
                  <View className="p-4">
                    <Text className="text-lg font-medium text-[#328E6E] mb-2">
                      {recipe.title}
                    </Text>
                    <View className="flex-row justify-between">
                      <Text className="text-[#67AE6E]">
                        {recipe.readyInMinutes} minute
                      </Text>
                      <Text className="text-[#67AE6E]">
                        {recipe.servings} porții
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
