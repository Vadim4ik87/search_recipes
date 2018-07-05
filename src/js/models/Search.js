import { key, proxy } from '../config';

export default class Search {
	constructor(query){
			this.query = query;
		}

		async getDataAW(){
		try {
			const result = await fetch (`${proxy}http://food2fork.com/api/search?key=${key}&q=${this.query}`);
			const data = await result.json();
			this.result = data.recipes;
		} catch(error){
			console.log(error);
		}
	}
}