// Recipes for every dish on the menu. Keys must match the .item__name text in
// Food.html exactly — recipe.js looks the dish up by that string.
//
// Quantities serve 2–4 unless a recipe says otherwise, and are given by weight
// with a cup/spoon equivalent, because that is how these actually get cooked.
const recipes = {
    "Rice Rice Baby": {
        ingredients: [
            "Basmati rice: 500 g (2½ cups), soaked 30 minutes",
            "Chicken, bone-in: 800 g (about 8 pieces)",
            "Onions, thinly sliced: 500 g (4 large)",
            "Yoghurt: 250 g (1 cup)",
            "Ginger-garlic paste: 40 g (2 tbsp)",
            "Green chillies, slit: 4",
            "Mint leaves: 20 g (1 cup, loose)",
            "Coriander leaves, chopped: 20 g (1 cup, loose)",
            "Biryani masala: 20 g (2 tbsp)",
            "Turmeric: 3 g (1 tsp)",
            "Whole spices: 4 cloves, 3 cardamom, 1 bay leaf, 1 cinnamon stick",
            "Ghee: 60 g (4 tbsp)",
            "Oil: 100 ml (for frying onions)",
            "Salt: 15 g (to taste)",
        ],
        instructions: [
            "Fry the sliced onions in the oil over medium heat for 15–20 minutes until deep brown. Be patient, this is the whole dish. Drain on paper and reserve half for the top.",
            "Mix the chicken with the yoghurt, ginger-garlic paste, half the fried onions, the biryani masala, turmeric, half the mint and coriander, and salt. Marinate for at least 1 hour.",
            "Boil a large pot of salted water with the whole spices. Add the drained rice and cook for exactly 5 minutes, it must still be firm. Drain immediately.",
            "Spread the marinated chicken in a heavy-bottomed pot and layer the par-cooked rice over it.",
            "Scatter the remaining fried onions, mint and coriander on top, then drizzle over the ghee.",
            "Seal the lid with foil or dough, cook on high for 4 minutes, then on the lowest possible heat for 35 minutes.",
            "Rest 10 minutes before opening. Dig from the bottom so every plate gets chicken.",
            "Take help of mom. She has done this more times than you have.",
            "Enjoy."
        ]
    },

    "The Leaning Tower of Cheesiness": {
        ingredients: [
            "Lasagna sheets: 250 g (about 12 dried sheets)",
            "Ground beef or chicken: 450 g (1 lb)",
            "Marinara sauce: 700 g (3 cups)",
            "Mozzarella, shredded: 300 g (3 cups)",
            "Ricotta: 425 g (1¾ cups)",
            "Parmesan, grated: 50 g (½ cup)",
            "Black olives, sliced: 60 g (½ cup)",
            "Egg: 1 large",
            "Garlic, minced: 9 g (3 cloves)",
            "Olive oil: 15 g (1 tbsp)",
            "Italian seasoning: 4 g (2 tsp)",
            "Salt and black pepper: to taste",
        ],
        instructions: [
            "Heat the oven to 190°C (375°F) and boil the sheets for 1 minute less than the packet says, so they finish cooking in the oven.",
            "Fry the garlic in the olive oil for 30 seconds, add the mince and brown it for 6–8 minutes, then drain the fat.",
            "Stir in two thirds of the marinara, the Italian seasoning, salt and pepper. Simmer 5 minutes.",
            "Beat the ricotta with the egg, Parmesan and a pinch of salt.",
            "Spread a thin layer of plain marinara in the dish, then layer: sheets, ricotta, meat sauce, mozzarella, a few olives. Repeat.",
            "Finish with meat sauce and a thick blanket of mozzarella.",
            "Cover with tented foil and bake 25 minutes, then uncover and bake 20 more until blistered and golden.",
            "Rest 15 minutes or the tower collapses on the plate. It will collapse anyway.",
            "Do not eat it alone all at once (speaking from experience).",
            "Enjoy."
        ]
    },

    "Pie Hard": {
        ingredients: [
            "Plain flour: 500 g (4 cups)",
            "Instant yeast: 7 g (1 sachet)",
            "Warm water: 300 ml (1¼ cups)",
            "Olive oil: 30 g (2 tbsp)",
            "Sugar: 8 g (2 tsp)",
            "Salt: 10 g (2 tsp)",
            "Pizza sauce: 300 g (1¼ cups)",
            "Mozzarella, shredded: 350 g (3½ cups)",
            "Minced chicken or sausage, cooked: 250 g",
            "Black olives, capsicum, onion: 200 g total, sliced",
            "Oregano and chilli flakes: to finish",
        ],
        instructions: [
            "Mix the yeast and sugar into the warm water and leave 10 minutes until foamy.",
            "Add the flour, salt and olive oil. Knead 10 minutes until smooth, then prove in a covered bowl for 1 hour until doubled.",
            "Heat the oven as high as it goes (240°C / 475°F) with a tray or stone inside for at least 30 minutes.",
            "Stretch the dough by hand, a rolling pin crushes the edge you want puffed.",
            "Spread the sauce thinly, add the cheese, then the toppings. Overloading makes the middle soggy; that has never stopped anyone here.",
            "Bake 8–12 minutes until the crust is blistered and the cheese is bubbling.",
            "Finish with oregano and chilli flakes. Eat a slice standing at the counter before it reaches the table.",
            "Enjoy."
        ]
    },

    "Red Flag": {
        ingredients: [
            "Penne: 400 g",
            "Marinara or tomato passata: 600 g (2½ cups)",
            "Minced chicken: 300 g",
            "Mozzarella, shredded: 200 g (2 cups)",
            "Cheddar, cubed: 100 g",
            "Onion, chopped: 1 medium",
            "Garlic, minced: 4 cloves",
            "Olive oil: 30 g (2 tbsp)",
            "Oregano: 4 g (2 tsp)",
            "Chilli flakes: 2 g (1 tsp)",
            "Salt and pepper: to taste",
        ],
        instructions: [
            "Boil the penne in well-salted water until just short of al dente, then drain and keep a cup of the water.",
            "Soften the onion and garlic in the olive oil, add the mince and brown it well.",
            "Pour in the tomato, season with oregano, chilli flakes, salt and pepper, and simmer 10 minutes until thick.",
            "Fold the pasta through the sauce, loosening with the reserved water if it tightens up.",
            "Scatter over the mozzarella and cheddar, cover the pan, and leave on low heat 5 minutes until the cheese melts right through.",
            "Grill the top for 2 minutes if you want the browned patches. Serve straight from the pan.",
            "Enjoy."
        ]
    },

    "Fifty Shades of Béchamel": {
        ingredients: [
            "Macaroni: 400 g",
            "Butter: 60 g (4 tbsp)",
            "Plain flour: 60 g (½ cup)",
            "Milk: 750 ml (3 cups), warm",
            "Cheddar, grated: 200 g (2 cups)",
            "Mozzarella, shredded: 100 g (1 cup)",
            "Garlic powder: 3 g (1 tsp)",
            "Nutmeg: a pinch",
            "Salt and white pepper: to taste",
        ],
        instructions: [
            "Boil the macaroni until just tender and drain.",
            "Melt the butter, whisk in the flour, and cook 2 minutes without colouring, this kills the raw flour taste.",
            "Add the warm milk a splash at a time, whisking hard after each addition until smooth. Rushing here is how you get lumps.",
            "Simmer 5 minutes until it coats a spoon, then take it off the heat.",
            "Stir in the cheddar, garlic powder, nutmeg, salt and pepper until glossy.",
            "Fold in the macaroni, top with the mozzarella, and grill 5 minutes until patchy and golden.",
            "Enjoy."
        ]
    },

    "Chicken Parmageddon": {
        ingredients: [
            "Chicken breasts: 2 large, halved horizontally",
            "Plain flour: 100 g (¾ cup)",
            "Eggs: 2, beaten",
            "Breadcrumbs: 150 g (1½ cups)",
            "Parmesan, grated: 50 g (½ cup)",
            "Marinara sauce: 400 g (1⅔ cups)",
            "Mozzarella, sliced: 200 g",
            "Oil: for shallow frying",
            "Italian seasoning: 4 g (2 tsp)",
            "Salt and pepper: to taste",
        ],
        instructions: [
            "Pound the chicken to an even 1.5 cm so it cooks through before the crumb burns.",
            "Set up three plates: seasoned flour, beaten egg, and breadcrumbs mixed with the Parmesan and Italian seasoning.",
            "Coat each piece flour → egg → crumb, pressing the crumbs on firmly.",
            "Shallow fry in 1 cm of hot oil for 3–4 minutes a side until deep golden. Drain on a rack, not paper, or the base goes soft.",
            "Sit the cutlets in a baking dish, spoon marinara over the middle, and leave the edges bare so they stay crisp.",
            "Lay the mozzarella on top and bake at 200°C (400°F) for 10–12 minutes until it slumps and browns.",
            "Enjoy."
        ]
    },

    "Zesty Nemo": {
        ingredients: [
            "White fish fillets: 500 g",
            "Butter: 50 g (3½ tbsp)",
            "Lemon: 1, juiced, plus wedges to serve",
            "Garlic, minced: 3 cloves",
            "Plain flour: 40 g (⅓ cup), for dusting",
            "Paprika: 3 g (1 tsp)",
            "Fresh parsley, chopped: 2 tbsp",
            "Salt and pepper: to taste",
        ],
        instructions: [
            "Pat the fillets completely dry, wet fish steams instead of searing.",
            "Season, then dust lightly with flour mixed with the paprika and shake off the excess.",
            "Fry in half the butter over medium-high heat, 3–4 minutes on the first side without touching it.",
            "Flip, add the rest of the butter and the garlic, and baste for 2 minutes.",
            "Take the pan off the heat and add the lemon juice, off the heat, so it stays bright rather than bitter.",
            "Scatter with parsley and serve with the wedges.",
            "Enjoy."
        ]
    },

    "Pomfret and Circumstance": {
        ingredients: [
            "Whole pomfret: 1 large (about 500 g), cleaned",
            "Ginger-garlic paste: 20 g (1 tbsp)",
            "Lemon: 1, juiced",
            "Turmeric: 2 g (½ tsp)",
            "Red chilli powder: 4 g (1½ tsp)",
            "Carom seeds (ajwain): 2 g (½ tsp)",
            "Rice flour: 30 g (¼ cup)",
            "Curry leaves: a sprig",
            "Oil: for shallow frying",
            "Salt: to taste",
        ],
        instructions: [
            "Score the fish 3–4 times on each side, right down to the bone, so the marinade and the heat both reach the middle.",
            "Rub in the ginger-garlic paste, lemon juice, turmeric, chilli, carom seeds and salt, working it into the cuts. Rest 30 minutes.",
            "Dust both sides with the rice flour, this is what gives the crisp skin.",
            "Heat 5 mm of oil in a wide pan until it shimmers. Lay the fish away from you.",
            "Fry 5–6 minutes on the first side without moving it, then turn once and give it 4–5 minutes more.",
            "Throw the curry leaves into the hot oil for the last 30 seconds and tip them over the fish.",
            "Enjoy."
        ]
    },

    "Double Trouble": {
        ingredients: [
            "Minced beef or chicken: 600 g",
            "Burger buns: 2 large",
            "Cheese slices: 2",
            "Lettuce, tomato, red onion: to layer",
            "Mayonnaise: 2 tbsp",
            "Mustard: 1 tbsp",
            "Worcestershire sauce: 1 tsp",
            "Butter: for the buns",
            "Salt and pepper: to taste",
        ],
        instructions: [
            "Mix the mince with the Worcestershire, salt and pepper, then shape four thin patties, thin is the point, two per burger.",
            "Press a dimple into the centre of each so they do not dome up.",
            "Get a heavy pan properly hot. Sear the patties 2–3 minutes a side; do not press them or the juice ends up in the pan.",
            "Lay cheese on two of the patties in the last 30 seconds and cover the pan to melt it.",
            "Toast the cut sides of the buns in butter until golden, this is the waterproofing.",
            "Build: base, sauce, lettuce, tomato, patty, cheesy patty, onion, lid. Press gently and commit.",
            "Enjoy."
        ]
    },

    "The Colonel's Regret": {
        ingredients: [
            "Chicken thighs, boneless: 600 g",
            "Buttermilk: 300 ml (1¼ cups)",
            "Plain flour: 200 g (1½ cups)",
            "Cornflour: 50 g (⅓ cup)",
            "Paprika, garlic powder, onion powder: 1 tsp each",
            "White pepper and black pepper: ½ tsp each",
            "Burger buns: 2",
            "Cabbage, shredded: 200 g",
            "Carrot, grated: 1",
            "Mayonnaise: 4 tbsp",
            "Vinegar: 1 tbsp",
            "Oil: for deep frying",
            "Salt: to taste",
        ],
        instructions: [
            "Soak the chicken in the buttermilk with a good pinch of salt for at least 2 hours, overnight if you can.",
            "For the coleslaw, toss the cabbage and carrot with the mayonnaise, vinegar, salt and pepper and chill it.",
            "Mix the flour, cornflour and all the spices. Splash in 2 tbsp of the buttermilk and rub it through, those clumps become the craggy bits.",
            "Lift each piece straight from the buttermilk into the flour and press hard.",
            "Fry at 170°C (340°F) for 6–8 minutes until deep golden and 74°C (165°F) inside. Rest on a rack.",
            "Build the burger with slaw under the chicken so the bun stays dry, and serve the rest of the slaw alongside.",
            "Enjoy."
        ]
    },

    "The Full Cardiac": {
        ingredients: [
            "Beef or chicken patties: 2",
            "Burger buns: 2",
            "Potatoes: 600 g, cut into batons",
            "Chicken nuggets: 10–12",
            "Cheese slices: 2",
            "Lettuce and tomato: to layer",
            "Oil: for frying",
            "Paprika: 1 tsp",
            "Salt and pepper: to taste",
        ],
        instructions: [
            "Soak the potato batons in cold water for 30 minutes to rinse off the starch, then dry them completely.",
            "Fry the chips once at 150°C (300°F) for 5 minutes until soft but pale. Lift out and rest 10 minutes.",
            "Fry again at 190°C (375°F) for 3 minutes until golden, then salt straight away and dust with paprika.",
            "Cook the nuggets in the same oil for 4 minutes until crisp.",
            "Sear the patties 3 minutes a side, adding cheese at the end.",
            "Toast the buns, build the burgers, and plate everything at once so nothing goes cold waiting.",
            "Enjoy."
        ]
    },

    "Rolls Royce": {
        ingredients: [
            "Chicken breast: 500 g, cut into strips",
            "Roti or paratha: 4",
            "Yoghurt: 100 g (⅖ cup)",
            "Ginger-garlic paste: 20 g (1 tbsp)",
            "Red chilli powder: 5 g (2 tsp)",
            "Garam masala: 3 g (1 tsp)",
            "Onion, sliced: 1",
            "Green chutney: 4 tbsp",
            "Lemon: 1",
            "Oil: 2 tbsp",
            "Salt: to taste",
        ],
        instructions: [
            "Marinate the chicken strips in the yoghurt, ginger-garlic paste, chilli, garam masala and salt for 1 hour.",
            "Fry over high heat in the oil for 6–8 minutes until charred at the edges and cooked through. High heat, not crowded, you want colour, not steam.",
            "Warm the rotis one at a time in a dry pan until pliable.",
            "Spread green chutney over each, lay the chicken down the centre, and add sliced onion and a squeeze of lemon.",
            "Roll tightly, then toast the seam side down for 30 seconds so it seals shut.",
            "Wrap the bottom half in foil or paper, which is the only thing standing between you and the filling on your shoes.",
            "Enjoy."
        ]
    },

    "Sandwich Witch": {
        ingredients: [
            "Sandwich bread: 6 slices",
            "Cooked chicken, shredded: 200 g",
            "Cheese slices: 3",
            "Tomato and cucumber: sliced thin",
            "Butter: 40 g, softened",
            "Mayonnaise: 3 tbsp",
            "Mustard: 1 tsp",
            "Salt and pepper: to taste",
        ],
        instructions: [
            "Mix the chicken with the mayonnaise, mustard, salt and pepper.",
            "Butter the bread right to the edges, the butter is a barrier, not a flavour, and it keeps the tomato from soaking in.",
            "Layer chicken, cheese and vegetables, keeping the wet things away from the outer slices.",
            "Press the sandwich together firmly and trim the crusts if you are feeling formal.",
            "Toast in a sandwich press or a buttered pan under a weight for 3–4 minutes a side until crisp.",
            "Cut on the diagonal. It genuinely tastes better and nobody knows why.",
            "Enjoy."
        ]
    },

    "Hot Diggity Dog": {
        ingredients: [
            "Hot dog sausages: 6",
            "Hot dog buns: 6",
            "Chicken breast: 300 g, for grilling",
            "Onion, finely chopped: 1",
            "Mustard and ketchup: to serve",
            "Butter: for the buns",
            "Paprika: 1 tsp",
            "Salt and pepper: to taste",
        ],
        instructions: [
            "Score the sausages diagonally so they crisp and do not burst.",
            "Season the chicken with paprika, salt and pepper and grill 5–6 minutes a side, then rest and slice.",
            "Grill or pan-fry the sausages 5 minutes, turning until browned all round.",
            "Butter the buns inside and toast them cut-side down for a minute.",
            "Load a sausage into each, top with raw onion, mustard and ketchup.",
            "Serve the grilled chicken alongside for anyone who claims they are being sensible.",
            "Enjoy."
        ]
    },

    "Teriyaki Very Much": {
        ingredients: [
            "Chicken thighs: 500 g, cut into chunks",
            "Soy sauce: 60 ml (¼ cup)",
            "Mirin or rice vinegar: 30 ml (2 tbsp)",
            "Brown sugar or honey: 30 g (2 tbsp)",
            "Ginger, grated: 10 g (1 tbsp)",
            "Garlic, minced: 3 cloves",
            "Cornflour: 1 tsp, in a splash of water",
            "Bread: 4 slices",
            "Cheese slices: 4",
            "Eggs: 2, for boiling",
            "Butter: for the toast",
        ],
        instructions: [
            "Boil the eggs 8 minutes for a set but not chalky yolk, then cool them in cold water and peel.",
            "Mix the soy, mirin, sugar, ginger and garlic into a sauce.",
            "Sear the chicken in a hot dry pan until well browned, colour first, sauce second, or it just stews.",
            "Pour in the sauce and let it bubble 3–4 minutes, then add the cornflour slurry and toss until everything is glossy and sticky.",
            "Butter the bread, lay on the cheese, and grill until melted and blistered at the edges.",
            "Plate the chicken with the grilled cheese and halved boiled eggs.",
            "Enjoy."
        ]
    },

    "Gym Bro's Cheat Day": {
        ingredients: [
            "Chicken breast: 400 g",
            "Instant ramen: 2 packets",
            "Eggs: 2, for boiling",
            "Soy sauce: 2 tbsp",
            "Sesame oil: 1 tsp",
            "Spring onion, sliced: 2",
            "Chilli oil: to taste",
            "Olive oil: 1 tbsp",
            "Salt and pepper: to taste",
        ],
        instructions: [
            "Boil the eggs 7 minutes for a jammy yolk, then straight into cold water.",
            "Season the chicken well and grill or pan-sear 6 minutes a side until charred outside and just cooked through. Rest 5 minutes before slicing.",
            "Cook the ramen 30 seconds under the packet time so it keeps some bite.",
            "Dress the noodles with the soy, sesame oil and chilli oil.",
            "Top with the sliced chicken and halved eggs, and finish with spring onion.",
            "Log it as chicken and eggs. Omit the rest.",
            "Enjoy."
        ]
    },

    "Seoul Survivor": {
        ingredients: [
            "Instant ramen: 2 packets",
            "White fish fillet: 300 g",
            "Kimchi: 150 g (¾ cup), plus its juice",
            "Gochujang: 30 g (2 tbsp)",
            "Soy sauce: 1 tbsp",
            "Garlic, minced: 3 cloves",
            "Sesame oil: 1 tsp",
            "Spring onion: 2, sliced",
            "Egg: 1 (optional)",
        ],
        instructions: [
            "Fry the garlic and kimchi in the sesame oil for 3 minutes until the kimchi darkens and smells sour-sweet.",
            "Stir in the gochujang and cook 1 minute so it loses its raw edge.",
            "Add 700 ml water and the kimchi juice, bring to a boil, and simmer 5 minutes.",
            "Slide in the fish and poach gently 4–5 minutes, do not stir, or it falls apart.",
            "Add the noodles and cook 2 minutes. Crack in the egg if using and leave it to set in the broth.",
            "Finish with spring onion and more chilli than is advisable.",
            "Enjoy."
        ]
    },

    "The Kitchen Sink": {
        ingredients: [
            "Chicken nuggets: 8",
            "Bao buns: 2",
            "Instant ramen: 1 packet",
            "Momos: 4",
            "Paneer: 150 g, in a slab",
            "Eggs: 3, for frying",
            "Bacon: 4 rashers",
            "Soy sauce: 1 tbsp",
            "Oil: for frying",
            "Salt and pepper: to taste",
        ],
        instructions: [
            "This is an assembly job, not a recipe. Work backwards from what takes longest.",
            "Steam the bao and momos for 8–10 minutes, start these first and keep them covered.",
            "Fry the nuggets until crisp and drain them on a rack.",
            "Cook the bacon in a dry pan until the fat renders and it crisps, then fry the eggs in the bacon fat.",
            "Boil the ramen 2 minutes and season the broth with the soy.",
            "Sear the paneer slab 2 minutes a side just for colour.",
            "Build the bowl around the noodles and put everything else on top. There is no wrong arrangement.",
            "Enjoy."
        ]
    },

    "Macaroni and Please": {
        ingredients: [
            "Macaroni: 350 g",
            "Chicken breast: 300 g, cubed",
            "Cheddar, grated: 150 g (1½ cups)",
            "Milk: 400 ml (1⅔ cups)",
            "Butter: 40 g (3 tbsp)",
            "Plain flour: 40 g (⅓ cup)",
            "Lettuce, cucumber, tomato: for the salad",
            "Olive oil and lemon: for dressing",
            "Salt and pepper: to taste",
        ],
        instructions: [
            "Season and pan-fry the chicken until golden and cooked through, then set aside.",
            "Boil the macaroni until just tender and drain.",
            "Melt the butter, whisk in the flour, cook 2 minutes, then add the milk gradually, whisking until smooth and thick.",
            "Off the heat, stir in the cheddar until it melts, and season well.",
            "Fold in the pasta and chicken.",
            "Dress the salad leaves with olive oil, lemon, salt and pepper and serve on the side, mostly for the colour.",
            "Enjoy."
        ]
    },

    "Pulao Play": {
        ingredients: [
            "Basmati rice: 400 g (2 cups), soaked 30 minutes",
            "Chicken, boneless: 400 g, cut small",
            "Onion, sliced: 2",
            "Peas and carrot: 150 g",
            "Whole spices: 3 cloves, 2 cardamom, 1 bay leaf, 1 cinnamon stick",
            "Ginger-garlic paste: 20 g (1 tbsp)",
            "Cumin seeds: 1 tsp",
            "Ghee: 40 g (3 tbsp)",
            "Cornflour: 60 g, for the poppers",
            "Breadcrumbs: 100 g, for the poppers",
            "Egg: 1, beaten",
            "Salt: to taste",
        ],
        instructions: [
            "For the poppers, toss half the chicken in seasoned cornflour, dip in egg, coat in breadcrumbs and fry at 175°C (350°F) for 4–5 minutes.",
            "For the pulao, heat the ghee and crackle the cumin and whole spices for 30 seconds.",
            "Add the onion and fry until light golden, then the ginger-garlic paste for another minute.",
            "Add the remaining chicken and brown it, then the peas and carrot.",
            "Stir in the drained rice gently, the grains break if you stir hard, then add 700 ml water and salt.",
            "Boil, then cover and cook on the lowest heat 15 minutes. Rest 10 minutes off the heat before fluffing with a fork.",
            "Serve with the poppers and a cold coffee, which is the only correct pairing.",
            "Enjoy."
        ]
    },

    "The Full Kanav": {
        ingredients: [
            "Bread: 4 slices",
            "Eggs: 2",
            "Butter: 30 g",
            "Sandwich filling of choice: 2 tbsp",
            "Mixed nuts: 50 g (almonds, cashews, pistachios)",
            "Milk: 250 ml (1 cup)",
            "Cocoa powder: 15 g (2 tbsp)",
            "Sugar: 15 g (1 tbsp)",
            "Salt: a pinch",
        ],
        instructions: [
            "Cut a circle out of the middle of two bread slices with a glass.",
            "Butter the bread on both sides and lay it in a medium pan.",
            "Crack an egg into each hole and cook 3 minutes until the white sets, then flip carefully and give it 1 minute more.",
            "Toast the cut-out circles in the same pan, they are the cook's snack.",
            "Make a small round sandwich from the remaining slices and cut it with the same glass.",
            "Warm the milk with the cocoa, sugar and salt, whisking until frothy.",
            "Plate everything with a handful of nuts. Eat before the hot chocolate goes cold.",
            "Enjoy."
        ]
    },

    "Bullseye": {
        ingredients: [
            "Eggs: 3",
            "Butter or oil: 1 tbsp",
            "Salt and black pepper: to taste",
            "Chilli flakes: optional",
        ],
        instructions: [
            "Use a non-stick pan on medium-low. High heat is what makes the bottom rubbery and the top raw.",
            "Melt the butter and let it foam without browning.",
            "Crack the eggs in from as low as you can so the yolks stay centred and intact.",
            "Cook 3–4 minutes until the whites are set but the yolks still wobble.",
            "For a firmer top, cover the pan for the last minute rather than flipping.",
            "Season only after cooking, salt on a raw yolk leaves pale speckles.",
            "Enjoy."
        ]
    },

    "Happy Stack": {
        ingredients: [
            "Plain flour: 250 g (2 cups)",
            "Milk: 350 ml (1½ cups)",
            "Eggs: 2, plus 2 more for frying",
            "Baking powder: 10 g (2 tsp)",
            "Sugar: 30 g (2 tbsp)",
            "Butter, melted: 40 g (3 tbsp)",
            "Bacon: 6 rashers",
            "Maple syrup: to serve",
            "Salt: a pinch",
        ],
        instructions: [
            "Whisk the dry ingredients in one bowl and the milk, eggs and melted butter in another.",
            "Combine them and stop while the batter is still lumpy. Overmixing is what makes pancakes tough.",
            "Rest the batter 10 minutes, this is the difference between flat and fluffy.",
            "Cook the bacon in a dry pan until crisp, then set aside and leave the fat.",
            "Ladle the batter onto a medium pan and flip once bubbles form and pop across the surface, about 2 minutes.",
            "Fry the remaining eggs in the bacon fat.",
            "Stack, drape the bacon over, add the eggs, and pour the syrup over all of it.",
            "Enjoy."
        ]
    },

    "Influencer Special": {
        ingredients: [
            "Plain flour: 250 g (2 cups)",
            "Milk: 350 ml (1½ cups)",
            "Eggs: 2",
            "Baking powder: 10 g (2 tsp)",
            "Sugar: 30 g (2 tbsp)",
            "Butter, melted: 40 g (3 tbsp)",
            "Granola: 100 g (1 cup)",
            "Banana, berries, kiwi: for topping",
            "Honey or maple syrup: to serve",
            "Yoghurt: 150 g (optional)",
        ],
        instructions: [
            "Make the pancake batter as for the Happy Stack and rest it 10 minutes.",
            "Cook the pancakes on a medium pan, roughly 2 minutes a side.",
            "Slice the fruit while they cook, keeping the pieces even, this is the whole point of the dish.",
            "Stack the pancakes slightly off-centre so the layers show.",
            "Spoon on the yoghurt, arrange the fruit, and scatter the granola last so it stays crunchy.",
            "Drizzle the honey from a height. Photograph immediately, eat within 90 seconds.",
            "Enjoy."
        ]
    },

    "Full English Breakdown": {
        ingredients: [
            "Sausages: 4",
            "Bacon: 4 rashers",
            "Eggs: 3",
            "Bread: 4 slices",
            "Butter: 30 g",
            "Tomato: 1, halved (optional)",
            "Salt and black pepper: to taste",
        ],
        instructions: [
            "Start the sausages first, they take the longest. Low and slow, 12–15 minutes, turning often.",
            "Add the bacon after 8 minutes and cook until it crisps at the edges.",
            "Halve the tomato, season the cut face, and fry it face down until it collapses slightly.",
            "Push everything to one side and fry the eggs in the rendered fat.",
            "Toast the bread and butter it while hot so it soaks in.",
            "Plate it all at once. Timing is the only difficult part of this dish.",
            "Enjoy."
        ]
    },

    "The Nutty Professor": {
        ingredients: [
            "Bread: 4 slices",
            "Peanut butter: 4 tbsp",
            "Jam: 3 tbsp",
            "Eggs: 2",
            "Mixed nuts: 60 g",
            "Milk: 300 ml (1¼ cups)",
            "Instant coffee: 2 tsp",
            "Sugar: 2 tsp",
            "Ice cubes: 4",
            "Butter: for frying",
        ],
        instructions: [
            "Blend the milk, coffee, sugar and ice for a full minute until thick and foamy. Chill the glass while you cook.",
            "Spread peanut butter on two slices right to the edges and jam on the other two.",
            "Press them together and cut on the diagonal.",
            "Fry the eggs in butter on medium-low until the whites set and the yolks stay runny.",
            "Season the eggs, plate them with the sandwich, and tip the nuts alongside.",
            "Serve the cold coffee before the foam settles.",
            "Enjoy."
        ]
    },

    "Mug of Happiness": {
        ingredients: [
            "Milk: 300 ml (1¼ cups)",
            "Dark chocolate, chopped: 60 g",
            "Cocoa powder: 10 g (1½ tbsp)",
            "Sugar: 15 g (1 tbsp)",
            "Cornflour: 1 tsp (optional, for body)",
            "Salt: a pinch",
            "Double cream: 100 ml, for whipping",
            "Chocolate shavings and cinnamon powder: to finish",
        ],
        instructions: [
            "Whip the cream with a teaspoon of sugar until it holds soft peaks. Stop while it still folds, overwhipped cream turns grainy.",
            "Warm the milk with the cocoa, sugar and salt, whisking so no cocoa lumps survive.",
            "Take it off the boil and stir in the chopped chocolate until it melts completely.",
            "For a thicker mug, slake the cornflour in a spoon of cold milk and whisk it in, then simmer 1 minute.",
            "Pour into a warmed mug, pile the cream on top, and finish with shavings and a dusting of cinnamon powder.",
            "Enjoy."
        ]
    },

    "Coffeeberry": {
        ingredients: [
            "Coke Zero, or any soda you prefer: 250 ml (1 cup), well chilled",
            "Cranberry juice: 100 ml (⅖ cup)",
            "Lemon: a single drop, no more",
            "Ice cubes: 6",
            "Fresh mint: a sprig, to garnish",
        ],
        instructions: [
            "Chill everything first. This drink lives or dies on how cold it is, and there is no milk in it to soften a lukewarm glass.",
            "Fill a tall glass to the top with ice.",
            "Pour the cranberry juice over the ice.",
            "Top with the chilled soda, poured slowly down the inside of the glass so it keeps its fizz.",
            "Add one drop of lemon. One. It is there to sharpen the cranberry, not to taste of lemon.",
            "Slap a sprig of mint between your palms to wake it up, then lay it on top.",
            "Enjoy."
        ]
    },

    "Cold Coffee": {
        ingredients: [
            "Milk: 400 ml (1⅔ cups), cold",
            "Instant coffee: 3 tsp",
            "Sugar: 3 tsp",
            "Ice cubes: 6",
            "Vanilla ice cream: 1 scoop (optional)",
            "Chocolate syrup: to finish",
        ],
        instructions: [
            "Put the coffee and sugar in the blender with 2 tbsp of hot water and blend 20 seconds, dissolving it first is what stops the bitter granules.",
            "Add the cold milk and the ice and blend a full minute until thick and foamy.",
            "Drop in the ice cream and pulse twice, no more, or it goes flat.",
            "Line the glass with chocolate syrup and pour.",
            "Drink immediately. The foam is the best part and it does not wait.",
            "Enjoy."
        ]
    },

    "Orange Soda": {
        ingredients: [
            "Oranges: 4, juiced (about 300 ml)",
            "Soda water: 300 ml, chilled",
            "Sugar syrup: 30 ml (2 tbsp)",
            "Black salt: a pinch",
            "Ice cubes: 6",
            "Orange slice and mint: to garnish",
        ],
        instructions: [
            "Juice the oranges by hand and strain out the pulp and seeds.",
            "Stir the sugar syrup and black salt into the juice until dissolved, do this before the soda goes in, or you lose the fizz stirring.",
            "Fill a glass with ice and pour the juice over.",
            "Top with chilled soda water, poured down the side of the glass to keep the bubbles.",
            "Garnish and serve straight away.",
            "Enjoy."
        ]
    },

    "Lemon Soda": {
        ingredients: [
            "Lemons: 3, juiced (about 90 ml)",
            "Soda water: 350 ml, chilled",
            "Sugar syrup: 30 ml (2 tbsp)",
            "Black salt: ½ tsp",
            "Roasted cumin powder: a pinch",
            "Ice cubes: 6",
            "Mint: a few leaves",
        ],
        instructions: [
            "Squeeze the lemons and strain the juice.",
            "Bruise the mint against the bottom of the glass with the back of a spoon, bruise, do not shred, or it turns bitter.",
            "Add the lemon juice, sugar syrup, black salt and cumin, and stir until dissolved.",
            "Fill with ice and top with chilled soda.",
            "Taste and correct: more syrup for sweet, more black salt for sharp.",
            "Enjoy."
        ]
    },

    "Protein Shake": {
        ingredients: [
            "Milk: 300 ml (1¼ cups)",
            "Protein powder: 1 scoop (about 30 g)",
            "Banana: 1",
            "Peanut butter: 1 tbsp",
            "Oats: 20 g (2 tbsp)",
            "Honey: 1 tsp",
            "Ice cubes: 4",
        ],
        instructions: [
            "Put the liquid in the blender first, then the powder. The other way round cements the powder to the bottom.",
            "Add the banana, peanut butter, oats and honey.",
            "Blend 45 seconds until completely smooth.",
            "Add the ice and blend 15 seconds more.",
            "Drink within a few minutes, the oats keep thickening it.",
            "Enjoy."
        ]
    },

    "Chocolate Shake": {
        ingredients: [
            "Milk: 250 ml (1 cup), cold",
            "Vanilla or chocolate ice cream: 3 scoops",
            "Cocoa powder: 1 tbsp",
            "Chocolate syrup: 2 tbsp, plus more for the glass",
            "Sugar: 1 tsp (optional)",
            "Whipped cream: to finish",
        ],
        instructions: [
            "Chill the glass in the freezer for 10 minutes and swirl chocolate syrup around the inside.",
            "Blend the milk, cocoa and syrup first so the cocoa dissolves properly.",
            "Add the ice cream and blend in short pulses only, a long blend melts it and you get chocolate milk.",
            "Pour, top with whipped cream and more syrup.",
            "Serve with a wide straw. A normal one will not do.",
            "Enjoy."
        ]
    },

    "Death By Chocolate": {
        ingredients: [
            "Plain flour: 200 g (1⅔ cups)",
            "Cocoa powder: 60 g (¾ cup)",
            "Sugar: 250 g (1¼ cups)",
            "Eggs: 3",
            "Butter, melted: 150 g",
            "Milk: 200 ml (¾ cup)",
            "Baking powder: 8 g (1½ tsp)",
            "Baking soda: 4 g (¾ tsp)",
            "Vanilla: 1 tsp",
            "Icing sugar: 200 g, for the glaze",
            "Oreos and chocolate chunks: to top",
            "Salt: a pinch",
        ],
        instructions: [
            "Heat the oven to 175°C (350°F) and line a 20 cm tin.",
            "Sift the flour, cocoa, baking powder, baking soda and salt together, cocoa clumps and sifting is not optional here.",
            "Beat the eggs with the sugar until pale, then mix in the melted butter, milk and vanilla.",
            "Fold the dry into the wet until only just combined.",
            "Bake 30–35 minutes until a skewer comes out with a few moist crumbs, not clean, clean means overbaked.",
            "Cool completely in the tin. Glazing a warm cake makes a puddle.",
            "Whisk the icing sugar with a little cocoa and milk into a thick glaze, pour it over, and let it run down the sides.",
            "Crush the Oreos and chocolate over the top before the glaze sets.",
            "Enjoy."
        ]
    },

    "Mousse Impossible": {
        ingredients: [
            "Boiled eggs: 2 large, peeled and fully cooled",
            "Paneer, fresh and soft: 100 g (½ cup, crumbled)",
            "Chocolate whey protein powder: 30 g (1 scoop)",
            "Cocoa powder, unsweetened: 8 g (1 tbsp)",
            "Condensed milk (Milkmaid): 30 g (1½ tbsp)",
            "Honey or caramel sauce: 15 g (2 tsp), plus more to drizzle",
            "Milk, cold: 50–75 ml (¼–⅓ cup)",
            "Vanilla: ½ tsp",
            "Instant coffee: ½ tsp (optional, it makes the chocolate taste more like chocolate)",
            "Salt: a pinch",
            "Dark chocolate shavings: to finish",
        ],
        instructions: [
            "This one serves 1. Double everything if someone else is watching you eat it.",
            "Boil the eggs for 9 minutes, then drop them straight into cold water and peel once they are cold. Warm eggs make the mousse smell like an omelette.",
            "Use both eggs whole if you do not mind the yolk, or 1 whole and 1 white only for a cleaner chocolate taste.",
            "Crumble the paneer by hand. Hard supermarket paneer stays grainy, so soak it in hot water for 10 minutes first and squeeze it dry.",
            "Blend the paneer, eggs, condensed milk, honey and 50 ml of the milk on high for 30 seconds, before any powder goes in. Get this smooth first and the rest follows.",
            "Add the protein powder, cocoa, vanilla, coffee and salt. Blend 60–90 seconds more, scraping the sides twice, until no grain is left on your tongue.",
            "Add the rest of the milk a spoon at a time only if it is too thick to fold. The powder keeps drinking liquid as it sits, so stop while it is slightly stiff.",
            "Taste it now. Cold dulls sweetness, so if it is only just sweet enough warm, it will be flat later. Add honey now, not after chilling.",
            "Spoon into a glass, cover, and chill for at least 2 hours. It sets soft, like a thick pudding, not like a whipped mousse.",
            "Drizzle with caramel and scatter the chocolate shavings just before serving.",
            "About 50 g of protein in the glass, which is the entire excuse for the boiled eggs.",
            "Enjoy."
        ]
    }
};
