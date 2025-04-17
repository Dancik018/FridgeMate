import { View, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import React from "react";
export default function Index() {
  return (
    <View className="flex-1 bg-[#E1EEBC] p-5 justify-center">
      <View className="items-center">
        <Text className="text-3xl font-bold text-[#328E6E]">Fridge Mate</Text>
      </View>
      <View className="mt-5 items-center">
        <Text className="text-lg text-[#67AE6E] text-center">Welcome to Fridge Mate!</Text>
      </View>
      <Link href="/main" asChild>
        <TouchableOpacity className="mt-8 bg-[#90C67C] p-4 rounded-lg items-center">
          <Text className="text-[#E1EEBC] text-base font-bold">Let's Prepare!</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}