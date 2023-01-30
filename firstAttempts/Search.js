class Search {
  constructor(searchString) {
    this.searchString = searchString;
    this.page = 0;
    this.results = [];
  }

  async getFilmsHtml() {
    const filmDataArray = await this.getFullResults(
      this.searchString,
      this.page
    );

    let filmsHtml = ``;
    filmDataArray.forEach((filmObject) => {
      filmsHtml += `
      <div class="film-wrapper">
          <img class="poster" src=${filmObject.Poster} />
          <div class="film-info-box">
            <div class="film-info-line-one">
              <h3>${filmObject.Title}</h3>
              <span>${filmObject.imdbRating}</span>
            </div>
            <div class="film-info-line-two">
              <span>${filmObject.Runtime}</span>
              <span>${filmObject.Genre}</span>
              <button id="add-to-watchlist-btn" data-imdb-id="${filmObject.imdbID}">
                <span>+</span>
                <span>Watchlist</span>
              </button>
            </div>
            <div class="film-info-line-three">
              <p>${filmObject.Plot}</p>
              <span>Read more</span>
            </div>
          </div>
      </div>
      <div class="divider"></div>
  `;
    });
    filmsHtml += `<button id="view-more-btn">View more</>`;
    return filmsHtml;
  }

  async getFullResults(searchTitle, page = 1) {
    const basicFilmDataArray = await this.getBasicFilmData(searchTitle, page);

    const detailedFilmDataArray = await this.getDetailedFilmData(
      basicFilmDataArray
    );
    this.results.push(detailedFilmDataArray);
    return this.results.flat();
  }

  // fn for search string returning array with ten results, by default first ten
  async getBasicFilmData(searchTitle, page = 1) {
    const response = await fetch(
      `http://www.omdbapi.com/?apikey=fa0d068f&s=${searchTitle}&page=${page}`
    );
    const filmData = await response.json();
    return filmData.Search;
  }

  // fn taking array, returning array with detailed film info for each
  getDetailedFilmData(filmArray) {
    const detailedFilmInfoArray = filmArray.map(async (film) => {
      const detailedFilmInfoObject = await fetch(
        `http://www.omdbapi.com/?apikey=fa0d068f&i=${film.imdbID}&plot=short`
      );
      const detailedFilmInfo = await detailedFilmInfoObject.json();
      return detailedFilmInfo;
    });
    return Promise.all(detailedFilmInfoArray);
  }
}

export default Search;
