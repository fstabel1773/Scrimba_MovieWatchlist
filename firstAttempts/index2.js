import Search from "/Search.js";
import Watchlist from "/Watchlist.js";

const searchTitle = document.getElementById("search-title-input");
const searchTitleBtn = document.getElementById("search-title-btn");
const moviesContainer = document.getElementById("movies-container");
const watchlistMoviesContainer = document.getElementById(
  "watchlist-movies-container"
);

const searchHistoryArray = [];

document.addEventListener("click", async (event) => {
  if (event.target.id === "search-title-btn") {
    const search = new Search(searchTitle.value);

    searchHistoryArray.push(search);
    console.log(searchHistoryArray[0]);
    search.page++;
    console.log(searchHistoryArray[0]);
    const movies = search.getFilmsHtml();
    renderMovies(movies);
  }
  if (event.target.parentElement.id === "add-to-watchlist-btn") {
    // moviesContainer.after(`<h1> Test 2 3 4 </h1>`);
    // // const currentSearch = searchHistoryArray[searchHistoryArray.length - 1];
    // console.log(currentSearch);
    // currentSearch.page = 5;
    // console.log(currentSearch.results[0]);
  }
  if (event.target.id === "view-more-btn") {
    searchHistoryArray[0].page++;
    const movies = searchHistoryArray[0].getFilmsHtml();
    renderMovies(movies);
  }
});

async function renderMovies(movies) {
  if (moviesContainer) {
    moviesContainer.innerHTML = await movies; //await search.getMoviesHtml
  }
  if (watchlistMoviesContainer) {
    watchlistMoviesContainer.innerHTML = movies; //await watchlist.getMoviesHtml
  }
}

const watchlist = new Watchlist();
