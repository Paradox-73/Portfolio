const recipes = {
    "The Leaning Tower of Cheesiness": {
        ingredients: [
            "Lasagna noodles",
            "Ricotta cheese",
            "Mozzarella cheese",
            "Ground beef",
            "Marinara sauce",
            "Parmesan cheese",
            "Egg",
            "Italian seasoning"
        ],
        instructions: [
            "Brown ground beef and drain fat.",
            "Mix ricotta, egg, and Italian seasoning.",
            "Layer sauce, noodles, ricotta mixture, beef, and mozzarella in a baking dish.",
            "Repeat layers and top with Parmesan.",
            "Bake at 375°F (190°C) for 45 minutes, or until bubbly and golden."
        ]
    },
    "Stakeout": {
        ingredients: [
            "Chicken breast fillets",
            "Garlic",
            "Butter",
            "Olive oil",
            "Salt",
            "Pepper",
            "Garlic bread"
        ],
        instructions: [
            "Season chicken breasts with salt and pepper.",
            "Heat olive oil and butter in a pan over medium-high heat.",
            "Add minced garlic to the pan and cook until fragrant.",
            "Sear chicken breasts for 5-7 minutes per side, until cooked through.",
            "Serve with garlic bread."
        ]
    },
    "Nakey Bakey": {
        ingredients: [
            "Eggs",
            "Milk",
            "Cooked chicken, shredded",
            "Cheese, shredded",
            "Bell peppers, diced",
            "Onion, diced",
            "Salt",
            "Pepper",
            "Tortillas (optional, for hugging)"
        ],
        instructions: [
            "Whisk eggs and milk with salt and pepper.",
            "Sauté bell peppers and onion until soft.",
            "Add shredded chicken to the vegetables.",
            "Pour egg mixture into the pan and cook until set.",
            "Sprinkle with cheese and melt.",
            "Serve as is, or wrap in a warm tortilla."
        ]
    },
    "Zesty Nemo": {
        ingredients: [
            "Fish fillets (cod, salmon, or tilapia)",
            "Lemon",
            "Butter",
            "Garlic powder",
            "Paprika",
            "Salt",
            "Pepper",
            "Fresh parsley (for garnish)"
        ],
        instructions: [
            "Preheat oven to 400°F (200°C).",
            "Place fish fillets on a baking sheet.",
            "Melt butter and mix with minced garlic, lemon juice, paprika, salt, and pepper.",
            "Pour butter mixture over the fish.",
            "Bake for 12-15 minutes, or until fish flakes easily with a fork.",
            "Garnish with fresh parsley and lemon wedges."
        ]
    },
    "Ramen": {
        ingredients: [
            "Instant ramen noodles",
            "Water",
            "Egg",
            "Green onions, sliced",
            "Nori (seaweed) sheets",
            "Sriracha (optional)"
        ],
        instructions: [
            "Boil water and cook ramen noodles according to package directions.",
            "Drain water and add seasoning packet.",
            "Boil an egg to your desired doneness (soft-boiled or hard-boiled).",
            "Top ramen with sliced green onions, nori sheets, and a halved egg.",
            "Add a dash of Sriracha for extra kick, if desired."
        ]
    },
    "Pizza": {
        ingredients: [
            "Pizza dough",
            "Tomato sauce",
            "Mozzarella cheese, shredded",
            "Pepperoni (or your favorite toppings)",
            "Olive oil",
            "Italian seasoning"
        ],
        instructions: [
            "Preheat oven to 450°F (230°C).",
            "Stretch pizza dough onto a baking sheet or pizza stone.",
            "Spread tomato sauce evenly over the dough.",
            "Sprinkle with mozzarella cheese and arrange pepperoni or other toppings.",
            "Drizzle with olive oil and sprinkle with Italian seasoning.",
            "Bake for 10-15 minutes, or until crust is golden brown and cheese is bubbly."
        ]
    },
    "Happy Stack": {
        ingredients: [
            "All-purpose flour",
            "Baking powder",
            "Sugar",
            "Salt",
            "Milk",
            "Egg",
            "Melted butter",
            "Maple syrup (for serving)"
        ],
        instructions: [
            "In a large bowl, whisk together flour, baking powder, sugar, and salt.",
            "In another bowl, whisk milk, egg, and melted butter.",
            "Pour wet ingredients into dry ingredients and mix until just combined (don't overmix).",
            "Heat a lightly oiled griddle or frying pan over medium heat.",
            "Pour 1/4 cup of batter per pancake onto the griddle.",
            "Cook for 2-3 minutes per side, until golden brown and cooked through.",
            "Serve warm with maple syrup."
        ]
    },
    "The Meatsquatch": {
        ingredients: [
            "Submarine roll",
            "Roast beef, sliced",
            "Ham, sliced",
            "Turkey, sliced",
            "Bacon, cooked",
            "Provolone cheese",
            "Lettuce",
            "Tomato",
            "Onion",
            "Mayonnaise",
            "Mustard",
            "Salt",
            "Pepper"
        ],
        instructions: [
            "Slice the submarine roll lengthwise.",
            "Spread mayonnaise and mustard on both sides of the roll.",
            "Layer roast beef, ham, turkey, bacon, and provolone cheese.",
            "Add lettuce, tomato, and onion.",
            "Season with salt and pepper.",
            "Close the sandwich and cut in half."
        ]
    },
    "Fry-Day the 13th": {
        ingredients: [
            "Frozen french fries",
            "Cheddar cheese, shredded",
            "Bacon bits",
            "Jalapeños, sliced (optional)",
            "Ranch dressing",
            "Ketchup"
        ],
        instructions: [
            "Bake french fries according to package directions until crispy.",
            "Top hot fries with shredded cheddar cheese, bacon bits, and jalapeños (if using).",
            "Return to oven for a few minutes until cheese is melted and bubbly.",
            "Drizzle with ranch dressing and serve with ketchup."
        ]
    },
    "Chick Nuggies": {
        ingredients: [
            "Frozen chicken nuggets",
            "Ketchup",
            "Honey mustard (optional)"
        ],
        instructions: [
            "Bake chicken nuggets according to package directions until golden and crispy.",
            "Serve with ketchup and honey mustard for dipping."
        ]
    },
    "Sir Kebab-alot": {
        ingredients: [
            "Chicken or beef chunks",
            "Bell peppers, assorted colors, cut into chunks",
            "Onion, red, cut into chunks",
            "Cherry tomatoes",
            "Marinade (soy sauce, honey, garlic, ginger)",
            "Skewers"
        ],
        instructions: [
            "Marinate chicken or beef chunks in soy sauce, honey, minced garlic, and grated ginger for at least 30 minutes.",
            "Thread marinated meat, bell pepper chunks, onion chunks, and cherry tomatoes onto skewers.",
            "Grill or bake skewers until meat is cooked through and vegetables are tender-crisp."
        ]
    },
    "Death By Chocolate": {
        ingredients: [
            "Chocolate cake mix",
            "Eggs",
            "Vegetable oil",
            "Water",
            "Chocolate frosting",
            "Chocolate chips",
            "Cocoa powder"
        ],
        instructions: [
            "Prepare chocolate cake mix according to package directions, baking in a bundt pan or 9x13 inch pan.",
            "Once cake is cooled, frost generously with chocolate frosting.",
            "Sprinkle with chocolate chips and dust with cocoa powder for extra chocolatey goodness."
        ]
    },
    "Chunky Dunky": {
        ingredients: [
            "All-purpose flour",
            "Baking soda",
            "Salt",
            "Unsalted butter, softened",
            "Granulated sugar",
            "Brown sugar",
            "Eggs",
            "Vanilla extract",
            "Chocolate chips"
        ],
        instructions: [
            "Preheat oven to 375°F (190°C).",
            "Whisk together flour, baking soda, and salt.",
            "In a separate bowl, cream together softened butter, granulated sugar, and brown sugar until light and fluffy.",
            "Beat in eggs one at a time, then stir in vanilla extract.",
            "Gradually add dry ingredients to wet ingredients, mixing until just combined.",
            "Fold in chocolate chips.",
            "Drop rounded spoonfuls of dough onto a baking sheet.",
            "Bake for 9-11 minutes, or until edges are golden brown and centers are still soft."
        ]
    },
    "Triple Decker Bus": {
        ingredients: [
            "Brownie mix",
            "Oreo cookies",
            "Vanilla ice cream",
            "Chocolate syrup"
        ],
        instructions: [
            "Prepare and bake brownies according to package directions.",
            "While still warm, crumble Oreo cookies over the top of the brownies.",
            "Once cooled, cut brownies into squares and serve with scoops of vanilla ice cream.",
            "Drizzle with chocolate syrup."
        ]
    },
    "Fudgy Fugitive": {
        ingredients: [
            "Unsweetened chocolate",
            "Unsalted butter",
            "Granulated sugar",
            "Eggs",
            "Vanilla extract",
            "All-purpose flour",
            "Cocoa powder",
            "Salt"
        ],
        instructions: [
            "Preheat oven to 350°F (175°C).",
            "Melt unsweetened chocolate and butter together in a microwave or double boiler.",
            "Whisk in sugar, then beat in eggs one at a time, followed by vanilla extract.",
            "In a separate bowl, whisk together flour, cocoa powder, and salt.",
            "Gradually add dry ingredients to wet ingredients, mixing until just combined.",
            "Pour batter into a greased 8x8 inch baking pan.",
            "Bake for 25-30 minutes, or until a toothpick inserted into the center comes out with moist crumbs."
        ]
    },
    "Whey to Go Protein Shake": {
        ingredients: [
            "1 scoop protein powder (vanilla or chocolate)",
            "1 cup milk (dairy or non-dairy)",
            "1/2 banana",
            "1 tbsp peanut butter",
            "Ice cubes (optional)"
        ],
        instructions: [
            "Combine all ingredients in a blender.",
            "Blend until smooth.",
            "Serve immediately."
        ]
    },
    "Chocoholic's Dream Shake": {
        ingredients: [
            "2 scoops chocolate ice cream",
            "1/2 cup milk",
            "2 tbsp cocoa powder",
            "Chocolate syrup",
            "Whipped cream (for topping)"
        ],
        instructions: [
            "Combine chocolate ice cream, milk, and cocoa powder in a blender.",
            "Blend until smooth and thick.",
            "Drizzle chocolate syrup inside a glass before pouring in the shake.",
            "Top with whipped cream and a sprinkle of cocoa powder."
        ]
    },
    "Gone Bananas Shake": {
        ingredients: [
            "1 ripe banana",
            "1 cup milk",
            "1 scoop vanilla ice cream",
            "1 tbsp honey or maple syrup",
            "Pinch of cinnamon (optional)"
        ],
        instructions: [
            "Combine banana, milk, vanilla ice cream, and honey/maple syrup in a blender.",
            "Blend until smooth.",
            "Add a pinch of cinnamon if desired.",
            "Serve immediately."
        ]
    },
    "Java Jolt Coffee Shake": {
        ingredients: [
            "1 cup cold brewed coffee",
            "1 scoop coffee or chocolate ice cream",
            "1/2 cup milk",
            "1 tbsp sugar (or to taste)",
            "Ice cubes (optional)"
        ],
        instructions: [
            "Combine cold brewed coffee, ice cream, milk, and sugar in a blender.",
            "Blend until smooth and frothy.",
            "Add ice cubes if a colder, thicker shake is desired.",
            "Serve immediately."
        ]
    },
    "Mango Tango Shake": {
        ingredients: [
            "1 cup frozen mango chunks",
            "1/2 cup yogurt (plain or vanilla)",
            "1/2 cup orange juice or milk",
            "1 tbsp honey or agave nectar"
        ],
        instructions: [
            "Combine frozen mango chunks, yogurt, orange juice/milk, and honey/agave nectar in a blender.",
            "Blend until smooth and creamy.",
            "Serve immediately for a taste of summer."
        ]
    },
    "Cake Shake": {
        ingredients: [
            "1 slice of leftover cake (any flavor)",
            "1 cup milk",
            "1 scoop vanilla ice cream",
            "Whipped cream (for topping)",
            "Sprinkles (optional)"
        ],
        instructions: [
            "Break up the cake slice into smaller pieces.",
            "Combine cake pieces, milk, and vanilla ice cream in a blender.",
            "Blend until smooth, but still with some cakey bits for texture.",
            "Pour into a glass, top with whipped cream and sprinkles."
        ]
    },
    "PBJ Shake": {
        ingredients: [
            "2 tbsp peanut butter",
            "1 tbsp jelly (strawberry or grape)",
            "1 cup milk",
            "1/2 banana (optional)",
            "Ice cubes (optional)"
        ],
        instructions: [
            "Combine peanut butter, jelly, milk, and banana (if using) in a blender.",
            "Blend until smooth. Add ice cubes for a colder, thicker shake.",
            "Serve immediately."
        ]
    },
    "Oreo-gasmic Shake": {
        ingredients: [
            "4-5 Oreo cookies",
            "2 scoops vanilla ice cream",
            "1/2 cup milk",
            "Chocolate syrup",
            "Whipped cream (for topping)",
            "Crushed Oreos (for garnish)"
        ],
        instructions: [
            "Roughly break 3-4 Oreo cookies into pieces.",
            "Combine broken Oreos, vanilla ice cream, and milk in a blender.",
            "Blend until the shake is smooth with small cookie pieces.",
            "Drizzle chocolate syrup inside a glass.",
            "Pour in the shake, top with whipped cream and crushed Oreos."
        ]
    }
};