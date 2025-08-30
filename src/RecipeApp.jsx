

import React, { useState, useEffect } from "react";
import "./RecipeApp.css";

export const RecipeApp = () => {
  const [ingredients, setIngredients] = useState("");
  const [cookingTime, setCookingTime] = useState("any");
  const [dietaryPreference, setDietaryPreference] = useState("any");
  const [cuisine, setCuisine] = useState("any");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ⭐ Example: auto-load some recipes when app opens
  useEffect(() => {
    fetchRecipes();
    // eslint-disable-next-line
  }, []);

  const fetchRecipes = async () => {
    if (!ingredients && cuisine === "any") {
      setError("Please enter ingredients or choose a cuisine.");
      return;
    }
    setLoading(true);
    setError("");
    setRecipes([]);

    try {
      let data = { meals: [] };

      // ⭐ Case 1: Search by ingredients
      if (ingredients) {
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredients}`;
        const response = await fetch(url);
        data = await response.json();
      }

      // ⭐ Case 2: Search by cuisine (area)
      if (cuisine !== "any") {
        const cuisineUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${cuisine}`;
        const cuisineResponse = await fetch(cuisineUrl);
        const cuisineData = await cuisineResponse.json();

        // If both selected → intersect results
        if (ingredients && data.meals) {
          const cuisineIds = new Set(
            cuisineData.meals.map((meal) => meal.idMeal)
          );
          data.meals = data.meals.filter((meal) =>
            cuisineIds.has(meal.idMeal)
          );
        } else {
          data = cuisineData;
        }
      }

      if (!data.meals) {
        setError("⚠️ No recipes found. Try different filters.");
        setLoading(false);
        return;
      }

      // ⭐ Apply vegetarian filter
      let filtered = data.meals;
      if (dietaryPreference === "vegetarian") {
        const vegResponse = await fetch(
          "https://www.themealdb.com/api/json/v1/1/filter.php?c=Vegetarian"
        );
        const vegData = await vegResponse.json();
        const vegIds = new Set(vegData.meals.map((meal) => meal.idMeal));
        filtered = filtered.filter((meal) => vegIds.has(meal.idMeal));
      }

      // ⭐ Add fake cooking time & servings for display
      const withDetails = filtered.map((meal) => ({
        ...meal,
        cookingTime:
          cookingTime === "any"
            ? Math.floor(Math.random() * 60) + 20
            : cookingTime,
        servings: Math.floor(Math.random() * 4) + 1,
      }));

      setRecipes(withDetails);
    } catch (err) {
      setError("❌ Error fetching recipes. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <header>
        <h1>🍳 Recipe Finder</h1>
      </header>

      {/* Search + Filters */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Enter ingredients (e.g., chicken,rice)"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />

        <select
          value={cookingTime}
          onChange={(e) => setCookingTime(e.target.value)}
        >
         <option value="">Any Time</option>
      <option value="15">15 minutes or less</option>
      <option value="30">30 minutes or less</option>
      <option value="45">45 minutes or less</option>
      <option value="60">60 minutes or less</option>
        </select>

        <select
          value={dietaryPreference}
          onChange={(e) => setDietaryPreference(e.target.value)}
        >
          <option value="">Any</option>
      <option value="vegetarian">Vegetarian</option>
      <option value="vegan">Vegan</option>
      <option value="gluten-free">Gluten-Free</option>
      <option value="dairy-free">Dairy-Free</option>
        </select>

        <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
          <option value="any">Any Cuisine</option>
          <option value="Indian">Indian</option>
          <option value="Italian">Italian</option>
          <option value="Mexican">Mexican</option>
          <option value="Chinese">Chinese</option>
          <option value="Thai">Thai</option>
          <option value="French">French</option>
        </select>

        <button onClick={fetchRecipes}>🔍 Find recipes</button>
      </div>

      {/* Status messages */}
      {loading && <div className="spinner">⏳ Loading recipes...</div>}
      {error && <p className="error">{error}</p>}

      {/* Recipes Grid */}
      
      <div className="recipes-grid">
        {recipes.map((recipe) => (
          <div key={recipe.idMeal} className="recipe-card">
            <img src={recipe.strMealThumb} alt={recipe.strMeal} />
            <h3>{recipe.strMeal}</h3>
            <p>⏱ Cooking Time: {recipe.cookingTime} mins</p>
            <p>🍽 Servings: {recipe.servings}</p>
            <a
              href={`https://www.themealdb.com/meal/${recipe.idMeal}`}
              target="_blank"
              rel="noreferrer"
               className="view-recipe"
            >
              View Recipe
            </a>
          </div>
        ))}
      </div>

      <footer>
        <p>Made with ❤️ by Anusha Boddu</p>
      </footer>
    </div>
  );
};

export default RecipeApp;
