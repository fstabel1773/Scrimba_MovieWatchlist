class Watchlist {
  constructor() {}
}

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

function getFilmsOnWatchlist() {
  const watchlistArray = Object.keys(localStorage).map((key) => {
    return JSON.parse(localStorage.getItem(key));
  });
  return watchlistArray;
}

function setFilmOnWatchlist(filmObject) {
  localStorage.setItem(`${filmObject.imdbID}`, JSON.stringify(filmObject));
}

function removeFilmFromWatchlist(filmObject) {
  localStorage.removeItem(`${filmObject.imdbID}`);
}

export default Watchlist;
