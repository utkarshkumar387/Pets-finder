/**
 * get data from the specified URL.
 * @async
 * @function ajaxRequetsToAnimals
 * @param {string} getAllPetsUrl - The URL to download from.
 * @return {Promise<string>} The data from the URL.
 */
async function ajaxRequetsToAnimals(url) {
    try {
        return (await fetch(url)).json();
    } catch (err) {
        console.log(err);
    }
}

/**Class representing get pets data API endpoints */
class GetPetsData {
    /**create a pets url main link */
    constructor() {
        this.petsUrl = "https://60d075407de0b20017108b89.mockapi.io/api/v1"
    }
    /**
     * @return {string} The string containing all pets url
     */
    async getAllPets() {
        let getAllPetsUrl = `${this.petsUrl}/animals`
        return await ajaxRequetsToAnimals(getAllPetsUrl);
    }
    /**
     * @param {number} pageNumber - The number containing pagination page number
     * @returns {string} The string containing all pets according to page number with limit 10 as params url
     */
    async getAllPetsInPagination(pageNumber) {
        let getAllPetsInPaginationPetsUrl = `${this.petsUrl}/animals?page=${pageNumber}&limit=10`
        return await ajaxRequetsToAnimals(getAllPetsInPaginationPetsUrl)
    }
    /**
     * @param {string} petsName - The string containing which name to search
     * @returns {string} The string containing searched pet name as params url 
     */
    async getSearchedPets(petsName) {
        let getAllPetsBySearchName = `${this.petsUrl}/animals?name=${petsName}`
        return await ajaxRequetsToAnimals(getAllPetsBySearchName)
    }
    async getSortPets(sortBy, order) {
        let getAllPetsBySearchName = `${this.petsUrl}/animals?sortBy=${sortBy}&order=${order}`
        return await ajaxRequetsToAnimals(getAllPetsBySearchName)
    }

}

/**
 * Class represents apeending pets
 * @extends GetPetsData
 */
class AppendPets extends GetPetsData {
    /**create starting page index */
    constructor() {
        super();
        this.page = 1
    }
    /**
     * @param {number} page - The number containing the index of the page 
     * @returns {Array} The array containing [key, value] pairs of each pet
     */
    async appendDataToPage(page) {
        let pets = await super.getAllPetsInPagination(page)
        document.querySelector('#petsPagination').style.display = "block";
        return this.getPetCardComponent(Object.entries(pets))
    }
    /**
     * @returns {number} The number containing the index of the page
     */
    allPetsOnLandingPage() {
        this.page = 1;
        return this.appendDataToPage(this.page);
    }
    /**
     * @returns {number} The number containing the index of the page
     */
    nextPets() {
        this.page += 1
        return this.appendDataToPage(this.page);
    }
    /**
     * @returns {number} The number containing the index of the page
     */
    prevPets() {
        if (this.page == 1) {
            alert('You are on first page');
        } else {
            this.page -= 1
            return this.appendDataToPage(this.page);
        }
    }
    /**Appends pet card elements on the page */
    getPetCardComponent(pets) {
        let petsCards = document.querySelector('#petsCards');
        petsCards.innerHTML = '';
        if (pets.length > 0) {
            for (let pet of pets) {
                let petAge = this.getAgeOfPet(pet[1].bornAt)
                petsCards.innerHTML +=
                    `
                <div class="pets__cardBody">
                    <p class="pets__name">${pet[1].name}</p>
                    <p class="pets__age"><b>Age:</b> <span>${petAge}</span></p>
                </div>
                `
            }
            document.querySelector('#nextButton').style.display = "inline-block"
        } else {
            petsCards.innerHTML +=
                `
                <div class="pets__noContent">
                    <h3>No contents to load</h3>
                </div>
                `
            document.querySelector('#nextButton').style.display = "none"
        }
    }
    /** 
     * @param {string} bornDate - The string containing the born date of the pet
     * @returns {string} The string containing age of the pet like x years, x month, x weeks or x days
     */
    getAgeOfPet(bornDate) {
        let convertBornDate = new Date(bornDate);
        let presentDay = new Date();
        let diffInPresentAndBornDateDays = (presentDay.getTime() - convertBornDate.getTime()) / (1000 * 3600 * 24);
        let months = 0, years = 0, days = 0, weeks = 0
        let totalDays = parseInt(diffInPresentAndBornDateDays)
        if (totalDays >= 365) {
            years = parseInt(totalDays / 365);
            return `${years} Years`;
        } else if (totalDays >= 30 && totalDays < 365) {
            months = parseInt(totalDays / 30);
            return `${months} Months`;
        } else if (totalDays >= 7 && totalDays < 30) {
            weeks = parseInt(totalDays / 7);
            return `${weeks} Weeks`;
        } else {
            days = totalDays;
            return `${days} Days`;
        }

    }
}

/**
 * Class representing all searching and sorting methods
 * @extends AppendPets
 */
class SerchingAndSortingPets extends AppendPets {
    constructor() {
        super()
    }
    /**
     * @returns to the landing page or 
     * @returns {Array} The array containing [key, value] pairs of each pet
     */
    async searchPets() {
        let searchedPet;
        let searchPetsName = document.querySelector('#searchPetsValue').value;
        document.querySelector('#petsPagination').style.display = "none";
        if (searchPetsName == "") {
            return super.allPetsOnLandingPage()
        } else {
            searchedPet = await super.getSearchedPets(searchPetsName);
            return super.getPetCardComponent(Object.entries(searchedPet));
        }
    }
    /**
     * @param {string} value - The value containing less or more
     * @returns {Array} The array value of less than 1 month old pets or more than one month old pets
     */
    async convertAgeIntoDays(value) {
        let lessThanOneMonthOldPets = [];
        let allPets = await super.getAllPets();
        let allPetsConversion = Object.entries(allPets)
        let presentDay = new Date().getTime();
        let petBornDate, petAgeInDays;
        for (let pet of allPetsConversion) {
            petBornDate = new Date(pet[1].bornAt).getTime();
            petAgeInDays = (presentDay - petBornDate) / (1000 * 3600 * 24)
            if (value === "less") {
                if (petAgeInDays <= 30) lessThanOneMonthOldPets.push(pet)
            } else if (value === "more") {
                if (petAgeInDays > 30) lessThanOneMonthOldPets.push(pet)
            }
        }
        document.querySelector('#petsPagination').style.display = "none";
        return super.getPetCardComponent(lessThanOneMonthOldPets);
    }
    /**
     * @param {string} bornAt - The string containing born date of a pet
     * @param {string} order - The string containing whether to display asc or desc order
     * @returns {Array} The array containing [key, value] pairs of each sorted pet
     */
    async sortedPets(bornAt, order) {
        let sortedPets = await super.getSortPets(bornAt, order)
        document.querySelector('#petsPagination').style.display = "none";
        return super.getPetCardComponent(Object.entries(sortedPets));
    }
    /**
     * @returns {string} The string containing less as a value
     */
    lessThanOneMonthOld() {
        let value = "less"
        return this.convertAgeIntoDays(value)
    }
    /**
     * @returns {string} The string containing more as a value
     */
    moreThanOneMonthOld() {
        let value = "more"
        return this.convertAgeIntoDays(value)
    }
}

let searchingAndSortingPets = new SerchingAndSortingPets()

let appendPets = new AppendPets()

document.addEventListener('DOMContentLoaded', () => appendPets.allPetsOnLandingPage());

let myPetsHeading = document.querySelector('#myPets');
myPetsHeading.addEventListener('click', () => appendPets.allPetsOnLandingPage());

let prevButton = document.querySelector('#prevButton')
prevButton.addEventListener('click', () => appendPets.prevPets());

let nextButton = document.querySelector('#nextButton')
nextButton.addEventListener('click', () => appendPets.nextPets());

let lessThanOneMonthButton = document.querySelector('#lessThanOneMonth')
lessThanOneMonthButton.addEventListener('click', () => searchingAndSortingPets.lessThanOneMonthOld());

let moreThanOneMonthButton = document.querySelector('#moreThanOneMonth')
moreThanOneMonthButton.addEventListener('click', () => searchingAndSortingPets.moreThanOneMonthOld());

let searchPetsButton = document.querySelector('#searchPetsButton')
searchPetsButton.addEventListener('click', () => searchingAndSortingPets.searchPets());

let searchPetsValue = document.querySelector('#searchPetsValue')
searchPetsValue.addEventListener('keyup', () => searchingAndSortingPets.searchPets())

let sortPetsByOldToNew = document.querySelector('#sortByNewToOld');
sortPetsByOldToNew.addEventListener('click', () => searchingAndSortingPets.sortedPets(sortBy = "bornAt", order = "desc"))

let sortPetsByNewToOld = document.querySelector('#sortByOldToNew');
sortPetsByNewToOld.addEventListener('click', () => searchingAndSortingPets.sortedPets(sortBy = "bornAt", order = "asc"))



