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
    let plotText = event.target.closest(".plot-info").textContent;
    event.target.closest(".plot-container").innerHTML = getPlotHtml(
      plotText,
      true
    );
  }
  if (event.target.id === "read-less-btn") {
    let plotText = event.target.closest(".plot-info").textContent;
    event.target.closest(".plot-container").innerHTML = getPlotHtml(
      plotText,
      false
    );
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
  try {
    const response = await fetch(
      `http://www.omdbapi.com/?apikey=fa0d068f&s=${searchTitle}&page=${page}`
    );
    const basicMovieData = await response.json();
    const basicMovieDataArray = await basicMovieData.Search;

    let promisedDetailedMovieDataArray = basicMovieDataArray.map(
      async (basicMovieObject) => {
        const detailedMovieObject = await fetch(
          `http://www.omdbapi.com/?apikey=fa0d068f&i=${basicMovieObject.imdbID}&plot=full`
        );
        const detailedMovieData = await detailedMovieObject.json();
        return detailedMovieData;
      }
    );
    // let bla = await Promise.all(promisedDetailedMovieDataArray);
    // console.log(bla);
    return Promise.all(promisedDetailedMovieDataArray);
  } catch (error) {
    searchMoviesContainer.innerHTML = `
      <p class="error-message">Unable to find what you're looking for. Please try another search.</p>
    `;
  }
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
    const plotTeaserHtml = getPlotHtml(movieObject.Plot, false, 150);

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
            <div class="plot-container">
              ${plotTeaserHtml}
            </div>
            </div>
          </div>
      </div>
      <div class="divider"></div>
  `;
  });
  moviesHtml += `<button id="view-more-btn">View more</button>`;
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

function getPlotHtml(fullPlotString, fullLength = false, maxLength = 155) {
  let visiblePlotString = fullPlotString;
  let invisiblePlotString = ``;

  if (fullPlotString.length <= maxLength) {
    return `
      <p class="plot-info">${visiblePlotString}</p>
    `;
  } else {
    if (!fullLength) {
      visiblePlotString = fullPlotString.slice(0, maxLength + 1);
      invisiblePlotString = fullPlotString.slice(maxLength + 1);
      const readMoreBtn = `<input id="read-more-btn" type="button" value="... Read more"</input>`;

      return `
        <p class="plot-info">${visiblePlotString}${readMoreBtn}<span class="invisible">${invisiblePlotString}<span></p>
      `;
    } else {
      const readLessBtn = `<input id="read-less-btn" type="button" value="Read less"</input>`;

      return `<p class="plot-info">${visiblePlotString}${readLessBtn}</p>`;
    }
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

// helper function for splitting plot-info, enabling read-more
// function splitPlotInfo(string) {
//   const wordArray = string.split(" ");
//   let lineOne = "";
//   let lineTwo = "";
//   let lineMore = "";
//   wordArray.forEach((word, index) => {
//     if (index < 6) {
//       lineOne += `${word} `;
//     } else if (index < 12) {
//       lineTwo += `${word} `;
//     } else if (index >= 12 && index < wordArray.length - 1) {
//       lineMore += `${word} `;
//     } else {
//       lineMore += `${word}`;
//     }
//   });

//   return [lineOne, lineTwo, lineMore];
// }

// // overflow doesn't exist if height of movie-wrapper is set to "auto" -> toggle via read-more-btn
// function checkForOverflow() {
//   const movieWrapper = document.querySelectorAll("movie-wrapper");
//   movieWrapper.forEach((movieHtml) => {
//     if (movieHtml.offsetHeight < movieHtml.scrollHeight) {
//       let bla = $(document).ready(() => {
//         $("div").find(".plot-info");
//       });
//       console.log("test");
//       console.log(bla);
//     }
//   });
// }
