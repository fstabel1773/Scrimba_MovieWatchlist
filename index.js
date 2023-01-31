const searchTitleInput = document.getElementById("search-title-input");
const searchTitleBtn = document.getElementById("search-title-btn");
const searchMoviesContainer = document.getElementById(
  "search-movies-container"
);
const watchlistMoviesContainer = document.getElementById(
  "watchlist-movies-container"
);
const addToWatchlistBtn = document.getElementById("add-to-watchlist-btn");
const removeFromWatchlistBtn = document.getElementById(
  "remove-from-watchlist-btn"
);

// global variables enabling multi-page search, used by method getMovieData()
let searchTitle = ``;
let page = 1; // variable enabling getting more than ten results
let resultsArray = []; // containing all fetched movie-objects from omdb; necessary for implementation of viewMoreBtn

document.addEventListener("click", async (event) => {
  if (event.target.id === "search-title-btn") {
    resultsArray = []; // starts new search

    searchTitle = searchTitleInput.value;
    renderMovies();

    searchTitleInput.value = "";
  }
  if (event.target.parentElement.id === "add-to-watchlist-btn") {
    const movieToAdd = event.target.parentElement;
    addToWatchlist(movieToAdd.dataset.imdbId);
    renderMovies();
  }
  if (event.target.parentElement.id === "remove-from-watchlist-btn") {
    const movieToRemove = event.target.parentElement;
    removeFromWatchlist(movieToRemove.dataset.imdbId);
    renderMovies();
  }
  if (event.target.id === "view-more-btn") {
    page++;
    renderMovies();
  }
  if (event.target.id === "read-more-btn") {
  }
});

// cleaner to make two functions renderWatchlist() + renderSearch() ?
async function renderMovies() {
  if (searchMoviesContainer && searchTitle) {
    searchMoviesContainer.innerHTML = await getMoviesHtml();
  }
  if (watchlistMoviesContainer) {
    watchlistMoviesContainer.innerHTML = await getMoviesHtml();
  }
}

// function returning updated resultsArray;
// if only ten results should be shown, returning newMovieData would be enough -> construction enables viewMoreBtn-Function
async function getFullResults() {
  const newMovieData = await getMovieData();
  newMovieData.forEach((movie) => {
    const resultsIdsArray = resultsArray.map((movie) => {
      return movie.imdbID;
    });
    !resultsIdsArray.includes(movie.imdbID) ? resultsArray.push(movie) : {};
  });
  return resultsArray;
}

// function returns array of ten movieObjects with detailed DataTransfer; double fetch necessary, because omdb API doesn't provide ability to get detailed results for more than one movie
async function getMovieData() {
  const response = await fetch(
    `http://www.omdbapi.com/?apikey=fa0d068f&s=${searchTitle}&page=${page}`
  );
  const basicMovieData = await response.json();
  const basicMovieDataArray = await basicMovieData.Search;

  let promisedDetailedMovieDataArray = basicMovieDataArray.map(
    async (basicMovieObject) => {
      const detailedMovieObject = await fetch(
        `http://www.omdbapi.com/?apikey=fa0d068f&i=${basicMovieObject.imdbID}&plot=short`
      );
      const detailedMovieData = await detailedMovieObject.json();
      return detailedMovieData;
    }
  );

  return Promise.all(promisedDetailedMovieDataArray);
}

// one function for creating html-string to render, used for searchresults and watchlist
async function getMoviesHtml() {
  let movieArray = [];
  if (searchMoviesContainer) {
    movieArray = await getFullResults();
  } else if (watchlistMoviesContainer) {
    movieArray = getWatchlistData();
  }

  let moviesHtml = ``;

  movieArray.forEach((movieObject) => {
    const watchlistBtn = getWatchlistBtnHtml(movieObject);

    moviesHtml += `
      <div class="movie-wrapper">
          <img class="poster" src=${movieObject.Poster} />
          <div class="movie-info-box">
            <div class="movie-info-line-one">
              <h3>${movieObject.Title}</h3>
              <i class="fa-solid fa-star star"></i>
              <span>${movieObject.imdbRating}</span>
            </div>
            <div class="movie-info-line-two">
              <span>${movieObject.Runtime}</span>
              <span>${movieObject.Genre}</span>
              ${watchlistBtn}
              </button>
            </div>
            <div class="movie-info-line-three">
              <span>${movieObject.Plot}</span>
            </div>
          </div>
      </div>
      <div class="divider"></div>
  `;
  });
  moviesHtml += `
 
    <button id="view-more-btn">View more</button>`;
  return moviesHtml;
}

//helper function, used by getMoviesHtml() for creating movieHtml
function getWatchlistBtnHtml(movieObject) {
  if (!localStorage.getItem(movieObject.imdbID)) {
    return `
      <button class="watchlist-btn" id="add-to-watchlist-btn" data-imdb-id="${movieObject.imdbID}">
        <i class="fa-solid fa-circle-plus plus"></i>
        <span>Watchlist</span>
      </button>`;
  } else {
    return `
      <button class="watchlist-btn" id="remove-from-watchlist-btn" data-imdb-id="${movieObject.imdbID}">
        <i class="fa-solid fa-circle-minus"></i>
        <span>Remove</span>
      </button>
      `;
  }
}

function addToWatchlist(imdbId) {
  resultsArray.forEach((movieObject) => {
    movieObject.imdbID === imdbId
      ? localStorage.setItem(imdbId, JSON.stringify(movieObject))
      : {};
  });
}

function removeFromWatchlist(imdbId) {
  localStorage.removeItem(imdbId);
}

function getWatchlistData() {
  const watchlistArray = Object.keys(localStorage).map((key) => {
    return JSON.parse(localStorage.getItem(key));
  });
  return watchlistArray;
}

renderMovies();
