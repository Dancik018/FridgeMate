import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

interface RecipeDetails {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  instructions: string;
  extendedIngredients: {
    id: number;
    original: string;
  }[];
}

const API_KEY = 'b2cb9532c8b847d6a434112e34a4c0ae';

export default function RecipeDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cleanInstructions = (instructions: string) => {
    return instructions
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  useEffect(() => {
    if (id) {
      fetchRecipeDetails(id as string);
    }
  }, [id]);

  const fetchRecipeDetails = async (recipeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`,
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
      setRecipe(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      setError(error instanceof Error ? error.message : 'Unable to load recipe details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F3F4F6]">
      <View className="px-4 py-3 bg-white shadow-sm">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-[#328E6E]">Recipe Details</Text>
          <TouchableOpacity
            className="bg-[#90C67C] py-2 px-4 rounded-lg active:bg-[#67AE6E]"
            onPress={() => router.back()}
          >
            <Text className="text-[#E1EEBC] font-medium">Back</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {loading ? (
          <Text className="text-center text-[#67AE6E]">Loading recipe details...</Text>
        ) : error ? (
          <View className="items-center">
            <Text className="text-center text-[#EF4444] mb-4">{error}</Text>
            <TouchableOpacity
              className="bg-[#90C67C] py-3 px-4 rounded-lg active:bg-[#67AE6E]"
              onPress={() => fetchRecipeDetails(id as string)}
            >
              <Text className="text-[#E1EEBC] text-center font-medium">Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : recipe ? (
          <View className="space-y-6">
            <Image
              source={{ uri: recipe.image }}
              className="w-full h-48 rounded-lg"
              style={{ backgroundColor: '#F3F4F6' }}
            />
            <View className="h-1 bg-[#E5E7EB] rounded-full" />
            
            <View className="bg-white rounded-lg p-4 shadow-sm">
              <Text className="text-xl font-bold text-[#328E6E] mb-2">
                {recipe.title}
              </Text>
              <View className="flex-row justify-between mb-4">
                <Text className="text-[#67AE6E]">
                  {recipe.readyInMinutes} minutes
                </Text>
                <Text className="text-[#67AE6E]">
                  {recipe.servings} portions
                </Text>
              </View>
            </View>
            <View className="h-1 bg-[#E5E7EB] rounded-full" />

            <View className="bg-white rounded-lg p-4 shadow-sm">
              <Text className="text-lg font-bold text-[#328E6E] mb-3">
                Ingredients needed:
              </Text>
              {recipe.extendedIngredients.map((ingredient, index) => (
                <Text key={`${ingredient.id}-${index}`} className="text-[#374151] mb-2">
                  • {ingredient.original}
                </Text>
              ))}
            </View>
            <View className="h-1 bg-[#E5E7EB] rounded-full" />

            <View className="bg-white rounded-lg p-4 shadow-sm">
              <Text className="text-lg font-bold text-[#328E6E] mb-3">
                Method of preparation:
              </Text>
              <Text className="text-[#374151] leading-6">
                {recipe.instructions ? cleanInstructions(recipe.instructions) : 'No instructions available.'}
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
