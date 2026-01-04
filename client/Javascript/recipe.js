document.addEventListener('DOMContentLoaded', function() {
    console.log('recipe.js: DOMContentLoaded event fired.');
    const recipeModal = document.getElementById('recipe-modal');
    const closeButton = recipeModal.querySelector('.close-button');
    const recipeTitle = document.getElementById('recipe-title');
    const recipeIngredients = document.getElementById('recipe-ingredients');
    const recipeInstructions = document.getElementById('recipe-instructions');
    const recipeButtons = document.querySelectorAll('.recipe-button');

    console.log('recipe.js: recipeModal:', recipeModal);
    console.log('recipe.js: recipeButtons:', recipeButtons);

    recipeButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('recipe.js: Recipe button clicked.');
            const itemName = this.closest('.item').querySelector('.item__name').textContent;
            console.log('recipe.js: itemName:', itemName);
            const recipe = recipes[itemName]; // 'recipes' object is from recipes.js
            console.log('recipe.js: retrieved recipe:', recipe);

            if (recipe) {
                recipeTitle.textContent = itemName;

                recipeIngredients.innerHTML = '<h3>Ingredients:</h3>';
                const ulIngredients = document.createElement('ul');
                recipe.ingredients.forEach(ingredient => {
                    const li = document.createElement('li');
                    li.textContent = ingredient;
                    ulIngredients.appendChild(li);
                });
                recipeIngredients.appendChild(ulIngredients);

                recipeInstructions.innerHTML = '<h3>Instructions:</h3>';
                const olInstructions = document.createElement('ol');
                recipe.instructions.forEach(instruction => {
                    const li = document.createElement('li');
                    li.textContent = instruction;
                    olInstructions.appendChild(li);
                });
                recipeInstructions.appendChild(olInstructions);

                recipeModal.style.display = 'block';
                console.log('recipe.js: Modal display set to block.');
            } else {
                alert('Recipe not found for ' + itemName);
                console.log('recipe.js: Recipe not found for ' + itemName);
            }
        });
    });

    closeButton.addEventListener('click', function() {
        recipeModal.style.display = 'none';
        console.log('recipe.js: Modal display set to none (close button).');
    });

    window.addEventListener('click', function(event) {
        if (event.target == recipeModal) {
            recipeModal.style.display = 'none';
            console.log('recipe.js: Modal display set to none (outside click).');
        }
    });
});
