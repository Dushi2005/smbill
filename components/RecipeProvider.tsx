import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Recipe } from '../types';
import Header from './Header';
import { recipes as recipeData } from '../services/recipeData';
import BackButton from './BackButton';

// A generic icon for all recipes
const FoodIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M17.218 2.251a2.25 2.25 0 0 0-2.63.29l-4.12 4.12a.75.75 0 0 0-.219.53V18a2.25 2.25 0 0 0 2.25 2.25h.138a.75.75 0 0 0 .53-.22l4.12-4.12a2.25 2.25 0 0 0 .29-2.63l-2.03-3.696 2.03-3.696a2.25 2.25 0 0 0-.29-2.63ZM11.5 8.33l-2.47-2.47a.75.75 0 0 0-1.06 1.06L10.44 9.39 11.5 8.33ZM9.56 12l-2.47 2.47a.75.75 0 1 0 1.06 1.06L10.6 13.06 9.56 12Z" /></svg>;

const RecipeProvider: React.FC = () => {
  const navigate = useNavigate();
  const [servings, setServings] = useState(1);

  const handleSelectRecipe = (recipe: Recipe) => {
    navigate(`/recipe-detail/${recipe.id}?servings=${servings}`);
  };

  return (
    <div className="flex flex-col h-full relative">
      <BackButton />
      <Header title="Recipe Provider" />
      <div className="flex-grow p-4 space-y-4 animate-fadeIn overflow-y-auto">
        <div className="p-4 bg-black/20 rounded-lg flex items-center justify-between sticky top-0 backdrop-blur-sm z-10">
          <label htmlFor="servings" className="text-lg font-semibold text-white">Number of Servings:</label>
          <input
            id="servings"
            type="number"
            min="1"
            max="10"
            value={servings}
            onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 p-2 text-center bg-white/10 rounded-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
          />
        </div>

        {recipeData.map((recipe) => (
          <button
            key={recipe.id}
            onClick={() => handleSelectRecipe(recipe)}
            className="w-full flex items-center p-4 bg-gray-200/10 border border-gray-200/20 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:bg-gray-200/20"
          >
            <div className="text-orange-300">
              <FoodIcon />
            </div>
            <span className="ml-6 text-2xl font-semibold text-orange-200">{recipe.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecipeProvider;