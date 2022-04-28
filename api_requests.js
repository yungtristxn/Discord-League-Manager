const axios = require("axios").default;
const { riotKey } = require("./data/config.json");

let version = "12.5.1";

async function getSummonerDataByName(summonerName, pRegion) {
  let region;
  if (pRegion) {
    region = `${pRegion}1`;
  } else {
    region = "euw1";
  }
  let response = await axios
    .get(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${riotKey}`
    )
    .catch(() => {
      console.log("Couldn't get summoner data by name");
    });
  if (response) {
    return response.data;
  }
}

async function getSummonerDataById(summonerId) {
  let response = await axios
    .get(
      `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/${summonerId}?api_key=${riotKey}`
    )
    .catch(() => {
      console.log("Couldn't get summoner data by id");
    });
  if (response) {
    return response.data;
  }
}

async function getRankDataById(summonerId, pRegion) {
  let region;
  if (pRegion) {
    region = `${pRegion}1`;
  } else {
    region = "euw1";
  }

  let response = await axios
    .get(
      `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${riotKey}`
    )
    .catch(() => {
      console.log("Couldn't get rank data by id");
    });
  if (response) {
    return response.data;
  }
}

async function getSummonerMmrByName(summonerName, pRegion) {
  let region;
  if (pRegion) {
    region = pRegion;
  } else {
    region = "euw";
  }
  let response = await axios
    .get(
      `https://${region}.whatismymmr.com/api/v1/summoner?name=${summonerName}`,
      {
        headers: {
          header1: "Windows:discord-league-manager.com:v1.0.0",
        },
      }
    )
    .catch(() => {
      console.log("Couldn't get mmr data by name");
    });
  if (response) {
    return response.data.ranked;
  }
}

async function getChampData() {
  let response = await axios
    .get(
      `http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
    )
    .catch(() => {
      console.log("Couldn't get champ data");
    });
  if (response) {
    return response;
  }
}

async function getGameDataById(summonerId) {
  let response = await axios
    .get(
      `https://euw1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summonerId}?api_key=${riotKey}`
    )
    .catch(() => {
      console.log("Couldn't get game data by id");
    });
  if (response) {
    return response.data;
  }
}

module.exports = {
  getSummonerDataByName: getSummonerDataByName,
  getRankDataById: getRankDataById,
  getSummonerMmrByName: getSummonerMmrByName,
  getChampData: getChampData,
  getGameDataById: getGameDataById,
  getSummonerDataById: getSummonerDataById,
};
