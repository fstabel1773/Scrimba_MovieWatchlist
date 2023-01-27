// http://www.omdbapi.com/?apikey=fa0d068f&

const searchTitle = document.getElementById("search-title-input");
const searchTitleBtn = document.getElementById("search-title-btn");
const moviesContainer = document.getElementById("movies-container");
const watchlistMoviesContainer = document.getElementById(
  "watchlist-movies-container"
);

let searchHistoryArray = [];

document.addEventListener("click", async (event) => {
  if (event.target.id === "search-title-btn") {
    let html = ``;
    const response = await fetch(
      `http://www.omdbapi.com/?apikey=fa0d068f&s=${searchTitle.value}`
    );
    const data = await response.json();
    const resultsArray = await data.Search.map(async (film) => {
      const fullFilmObject = await fetch(
        `http://www.omdbapi.com/?apikey=fa0d068f&i=${film.imdbID}`
      );
      const data = await fullFilmObject.json();
      return data;
    });

    Promise.all(resultsArray).then(async (filmArray) => {
      await filmArray.forEach((film) => {
        searchHistoryArray.push(film);
        html += `
            <div class="film-wrapper">
                <img class="poster" src=${film.Poster} />
                <div class="film-info-box">
                  <div class="film-info-line-one">
                    <h3>${film.Title}</h3>
                    <span>${film.imdbRating}</span>
                  </div>
                  <div class="film-info-line-two">
                    <span>${film.Runtime}</span>
                    <span>${film.Genre}</span>
                    <button id="add-to-watchlist-btn" data-imdb-id="${film.imdbID}">
                      <span>+</span>
                      <span>Watchlist</span>
                    </button>
                  </div>
                  <div class="film-info-line-three">
                    <p>${film.Plot}</p>
                    <span>Read more</span>
                  </div>
                </div>
            </div>
            <div class="divider"></div>
        `;
      });
      moviesContainer.innerHTML = html;
    });
  }
  if (event.target.parentElement.id === "add-to-watchlist-btn") {
    // add to localStorage
    const addToWatchlistBtn = event.target.parentElement;
    searchHistoryArray.forEach((film) => {
      film.imdbID === addToWatchlistBtn.dataset.imdbId
        ? localStorage.setItem(`${film.imdbID}`, JSON.stringify(film))
        : {};
    });
  }
  if (event.target.parentElement.id === "remove-from-watchlist-btn") {
    // remove from localStorage
    const removeFromWatchlistBtn = event.target.parentElement;
    const watchlist = getFilmsOnWatchlist();
    watchlist.forEach((film) => {
      film.imdbID === removeFromWatchlistBtn.dataset.imdbId
        ? localStorage.removeItem(`${film.imdbID}`)
        : {};
    });
    renderWatchlist();
  }
});

function getWatchlistHtml() {
  const watchlist = getFilmsOnWatchlist();
  let watchlistHtml = ``;
  watchlist.forEach((film) => {
    watchlistHtml += `
    <div class="film-wrapper">
        <img class="poster" src=${film.Poster} />
        <div class="film-info-box">
          <div class="film-info-line-one">
            <h3>${film.Title}</h3>
            <span>${film.imdbRating}</span>
          </div>
          <div class="film-info-line-two">
            <span>${film.Runtime}</span>
            <span>${film.Genre}</span>
            <button id="remove-from-watchlist-btn" data-imdb-id="${film.imdbID}">
              <span>-</span>
              <span>Remove</span>
            </button>
          </div>
          <div class="film-info-line-three">
            <p>${film.Plot}</p>
            <span>Read more</span>
          </div>
        </div>
    </div>
    <div class="divider"></div>
`;
  });
  return watchlistHtml;
}

function renderWatchlist() {
  if (watchlistMoviesContainer) {
    watchlistMoviesContainer.innerHTML = getWatchlistHtml();
  }
}

function getFilmsOnWatchlist() {
  // would an object do it too?
  // const watchlistObject = { ...localStorage };
  // console.log(watchlistObject);

  const watchlistArray = Object.keys(localStorage).map((key) => {
    return JSON.parse(localStorage.getItem(key));
  });
  return watchlistArray;
}

function render() {
  moviesContainer.innerHTML = getResultsHtml();
}

function getResultsHtml() {
  // array with objects of search result, including necessary movie-info
  // iterating over array -> html string
}

renderWatchlist();
