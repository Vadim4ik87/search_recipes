import { key, proxy } from '../config';

export default class Recipe {
	constructor(id) {
		this.id = id;
	}

	async getRecipe() {
		try {
			const res = await fetch(`${proxy}http://food2fork.com/api/get?key=${key}&rId=${this.id}`);
			const dat = await res.json();
			this.title = dat.recipe.title;
			this.author = dat.recipe.publisher;
			this.img = dat.recipe.image_url;
			this.url = dat.recipe.source_url;
			this.ingr = dat.recipe.ingredients;
		} catch (error) {
			console.log(error);
		}
	}

	calcTime() {
		// Assuming that we need 15 min for each 3 ingredients
		const numIng = this.ingr.length;
		const periods = Math.ceil(numIng / 3);
		this.time = periods * 15;
	}

	calcServings() {
		this.servings = 4;
	}

	parseIngredients() {
		const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
		const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
		const units = [...unitsShort, 'kg', 'g'];

		const newIngredients = this.ingr.map(e => {
			// 1) Uniform units
			let ingredient = e.toLowerCase();
			unitsLong.forEach((unit, i) => {
				ingredient = ingredient.replace(unit, unitsShort[i]);
			});

			// 2) Remove parenteses
			ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

			// 3) Parse ingredients into count, unit  and ingredient
			const arrIng = ingredient.split(' ');
			const unitIndex = arrIng.findIndex(el => units.includes(el));


			let objIng;
			if(unitIndex > -1) {
				// There is a unit
				const arrCount = arrIng.slice(0 ,unitIndex);

				let count;
				if (arrCount.length === 1) {
					count = eval(arrIng[0].replace('-', '+'));

				} else {
					count = eval(arrIng.slice(0 , unitIndex).join('+'));
				}

				objIng = {
					count,
					unit: arrIng[unitIndex],
					ingredient: arrIng.slice(unitIndex + 1).join(' ')
				};

			} else if (parseInt(arrIng[0], 10)) {
				// There is no unit but 1-st element is number
				objIng = {
					count: parseInt(arrIng[0], 10),
					unit: '',
					ingredient: arrIng.slice(1).join(' ')
				};
			} else if (unitIndex === -1) {
				// There is  no unit and no number in 1 position
				objIng = {
					count: 1,
					unit: '',
					ingredient
				};
			}

			return objIng;
		});
		this.ingr = newIngredients;
	}
	
	updateServings(type) {
		// Servings
		const newServ = type === 'dec' ? this.servings - 1 : this.servings + 1;
		// Ingredients
		this.ingr.forEach(ing => {
			ing.count *= (newServ / this.servings);
		})
		this.servings = newServ;
	}
}