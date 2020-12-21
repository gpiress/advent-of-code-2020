const readline = require('readline');
const fs = require('fs');


// add solution code
const solve = inputs => {
    const parseInputs = inputs => {
        const parseLine = line => {
            const parts = line.split(' (contains ');
            const ingredientsList = parts[0].split(' ');
            const allergensList = parts[1].substring(0, parts[1].length - 1).split(', ');

            return { ingredientsList: ingredientsList, allergensList: allergensList };
        }

        const foodList = inputs
            .filter(input => input.trim() !== '')
            .map(parseLine);

        return foodList;
    };

    const getIngredientToFoodMap = foodList => {
        let ingredientMap = new Map();

        const updateIngredient = (ingredient, food) => {
            if (ingredientMap.has(ingredient)) {
                let existingFood = ingredientMap.get(ingredient);
                existingFood.push(food);
                ingredientMap.set(ingredient, existingFood);
            } else {
                ingredientMap.set(ingredient, [food]);
            }
        };

        foodList.map(food => {
            const { ingredientsList } = food;
            ingredientsList.map(ingredient => updateIngredient(ingredient, food));
        });

        return ingredientMap;
    };

    const getAllergenToFoodMap = foodList => {
        let allergenMap = new Map();

        const updateAllergen = (allergen, food) => {
            if (allergenMap.has(allergen)) {
                let existingFood = allergenMap.get(allergen);
                existingFood.push(food);
                allergenMap.set(allergen, existingFood);
            } else {
                allergenMap.set(allergen, [food]);
            }
        };

        foodList.map(food => {
            const { allergensList } = food;
            allergensList.map(allergen => updateAllergen(allergen, food));
        });

        return allergenMap;
    };

    const solver = (ingredientMap, allergenToFoodMap) => {
        const findSusIngredients = allergenToFoodMap => {
            let allergenToSusIngredientsMap = new Map();
            for (let allergen of allergenToFoodMap.keys()) {
                const foods = allergenToFoodMap.get(allergen);
                let ingredientsCountMap = new Map();
                foods.forEach(food => {
                    const { ingredientsList } = food;
                    ingredientsList.forEach(ingredient => {
                        const count = ingredientsCountMap.has(ingredient) ? ingredientsCountMap.get(ingredient) : 0;
                        ingredientsCountMap.set(ingredient, count + 1);
                    });
                });

                let susIngredients = [];
                for (let entry of ingredientsCountMap) {
                    const ingredient = entry[0];
                    const count = entry[1];

                    if (foods.length === 1 && count === 1) {
                        susIngredients.push(ingredient);
                    } else if (count === foods.length) {
                        susIngredients.push(ingredient);
                    }
                }

                allergenToSusIngredientsMap.set(allergen, susIngredients);
            }

            return allergenToSusIngredientsMap;
        };

        const findAllergenicIngredients = allergenToSusIngredientsMap => {
            let usedIngredients = new Set();
            let allergensFiguredOut = 0;
            let allergenWithIngredientList = [];

            console.log(`   Trying to find ingredients for ${allergenToSusIngredientsMap.size} allergens`);
            while (allergensFiguredOut < allergenToSusIngredientsMap.size) {
                for (let entry of allergenToSusIngredientsMap) {
                    const allergen = entry[0];
                    const susIngredients = entry[1];

                    const nonUsedSusIngredients = susIngredients.filter(ingredient => !usedIngredients.has(ingredient));
                    if (nonUsedSusIngredients.length === 0) {
                        continue;
                    }
                    console.log(`       Allergen ${allergen} has suspicious ingredients: ${nonUsedSusIngredients}`);

                    if (nonUsedSusIngredients.length === 1) {
                        console.log(`           Ingredient ${nonUsedSusIngredients[0]} is allergenic for ${allergen}`);
                        allergensFiguredOut++;
                        usedIngredients.add(nonUsedSusIngredients[0]);
                        allergenWithIngredientList.push({ allergen: allergen, ingredient: nonUsedSusIngredients[0] });
                    }
                }
            }

            return {
                dangerousIngredientsSet: usedIngredients,
                allergenWithIngredientList: allergenWithIngredientList,
            };
        };

        const findSafeIngredients = (allergenicIngredientsSet, ingredientMap) => {
            console.log(`   Sus ingredients: ${Array.from(allergenicIngredientsSet)}`);

            const allIngredients = Array.from(ingredientMap.keys());
            
            return allIngredients.filter(ingredient => !allergenicIngredientsSet.has(ingredient));
        };

        const allergenToSusIngredientsMap = findSusIngredients(allergenToFoodMap);
        let { dangerousIngredientsSet, allergenWithIngredientList } = findAllergenicIngredients(allergenToSusIngredientsMap);
        const safeIngredients = findSafeIngredients(dangerousIngredientsSet, ingredientMap);

        console.log(`   Safe ingredients: ${safeIngredients}`);

        const firstPart = safeIngredients
            .map(ingredient => ingredientMap.get(ingredient).length)
            .reduce((prev, curr) => prev + curr, 0);

        
        allergenWithIngredientList.sort((a, b) => a.allergen.localeCompare(b.allergen));
        const allergenicIngredientsList = allergenWithIngredientList.map(a => a.ingredient);

        return {
            firstPart: firstPart,
            secondPart: allergenicIngredientsList.join(','),
        };
    };

    const foodList = parseInputs(inputs);
    const ingredientToFoodMap = getIngredientToFoodMap(foodList);
    const allergenToFoodMap = getAllergenToFoodMap(foodList);

    const result = solver(ingredientToFoodMap, allergenToFoodMap);
    
    return {
        firstPart: result.firstPart,
        secondPart: result.secondPart,
    };
}


let inputs = [];
const processLine = line => {
    inputs.push(line);
};

const computeResults = () => {
    const result = solve(inputs);
    console.log(`First part: ${result.firstPart}`);
    console.log(`Second part: ${result.secondPart}`);
};

// Read from input.in
const readInterface = readline.createInterface({
    input: fs.createReadStream('./test.in'),
    output: undefined,
    console: false
});

readInterface.on('line', processLine);
readInterface.on('close', computeResults);