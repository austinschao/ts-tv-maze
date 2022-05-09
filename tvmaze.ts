import axios from "axios";
import * as $ from 'jquery';
import { IEpisode, IShow, IProgram } from "./interfaces";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const BASE_API_URL = "https://api.tvmaze.com/";
const DEFAULT_IMG = "https://tinyurl.com/tv-missing";


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<IShow[]> {
  const resp = await axios.get(`${BASE_API_URL}/search/shows/`, { params: { q: term } });
  const shows = resp.data.map((program: IProgram) => {
    const show = program.show
    const id = show.id;
    const name = show.name;
    const summary = show.summary || "";
    const image = show.image?.medium || DEFAULT_IMG;
    return { id, name, summary, image };
  });

  return shows;
};


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: IShow[]): void {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val() as string;
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(showId: number): Promise<IEpisode[]> {
  const resp = await axios.get(`${BASE_API_URL}shows/${showId}/episodes`);
  const shows = resp.data.map((show: IEpisode) => {
    const { id, name, season, number } = show;
    return { id, name, season, number };
  });

  return shows;
}

/** Given list of epsiodes, create markup for each and append to DOM */

function populateEpisodes(episodes: IEpisode[]): void {
  $episodesArea.empty();

  for (let episode of episodes) {
    const $episode = $(
      `<li id="${episode.id}">
        ${episode.name} (season, ${episode.season}, number ${episode.number})
      </li>
      `);

    $episodesArea.append($episode);
  }
  $showsList.hide();
  $episodesArea.show();
}

/** Click event that fires API call and appends episode to DOM. */

async function handleClick(evt:JQuery.ClickEvent): Promise<void> {
  const $episode = $(evt.target.closest(".Show"));
  const showId = $episode.data().showId;
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}


$showsList.on('click', ".Show-getEpisodes", handleClick);