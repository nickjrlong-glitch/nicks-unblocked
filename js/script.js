class Main {
  gamesList = document.querySelector("#game-list");
  searchBar = document.querySelector("#search-bar");
  status = document.querySelector("#games-query-data");

  constructor() {
    this.ini();
  }

  ini() {
    document.addEventListener("DOMContentLoaded", () => {
      this.setStatusObserver();

      this.readData().then(json => {
        this.renderButtons(json);
        this.handleSearchBar(json)
      })
    })
  }

  async readData() {
    const games_data = await fetch("./json/games_data.json");
    const json = await games_data.json();
    return json;
  }

  setStatusObserver() {
    const config = {
      attributes: true, childList: true, subtree: true
    }

    const callback = (mutationsList) => {
      for (const _ of mutationsList) {
        const gameCount = this.gamesList.childElementCount;

        if (gameCount == 0) {
          this.status.innerText = "No games found.";
        } else {
          this.status.innerText = `${gameCount} game${gameCount == 1 ? "" : "s"} found.`;
        }
      }
    }

    const observer = new MutationObserver(callback);
    observer.observe(this.gamesList, config);
  }

  renderButtons(json = []) {
    for (const game of json) {
      const name = game.name;
      const url = game.url;

      this.appendGameButton(name, url);
    }
  }

  handleSearchBar(data = []) {
    let timeout;

    this.searchBar.addEventListener("input", () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (data === null) return;
        const contents = this.searchBar.value.trim();
        if (contents === "") {
          this.gamesList.innerHTML = "";
          for (const element of data) {
            this.appendGameButton(element.name, element.url);
          }
          return;
        }

        let suggestions = [];
        for (const element of data) {
          const difference = this.levenshtein(element.name.toLowerCase(), contents.toLowerCase());
          if (difference === 0 || difference < 0.25) continue;
          suggestions.push({ query: element.name, difference: difference, url: element.url });
        }
        suggestions.sort((a, b) => b.difference - a.difference);
        this.gamesList.innerHTML = "";

        for (const suggestion of suggestions) {
          this.appendGameButton(suggestion.query, suggestion.url);
        }
      });
    })
  }

  appendGameButton(text, url) {
    const div = document.createElement("div");
    div.addEventListener("click", () => {
      window.open(`./games/${url}`);
    });
    div.textContent = text;
    this.gamesList.appendChild(div);
  }

  levenshtein(first, second) {
    const m = first.length,
      n = second.length;
    let t = [...Array(n + 1).keys()],
      u = [];
    for (let i = 0; i < m; i++) {
      u = [i + 1];
      for (let j = 0; j < n; j++) {
        u[j + 1] = first[i] === second[j] ? t[j] : Math.min(t[j], t[j + 1], u[j]) + 1;
      }
      t = u;
    }
    return 1 - u[n] / Math.max(m, n);
  }
}

new Main(); 