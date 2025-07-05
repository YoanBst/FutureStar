


/*fetch("http://localhost:3000/api/nba/teams")
  .then(response => response.json())
  .then(data => {
    let html = "<h2>Equipes NBA</h2><ul>";
    data.data.forEach(team => {
      html += `<li>${team.full_name} (${team.abbreviation})</li>`;
    });
    html += "</ul>";
    document.querySelector('.team').innerHTML = html;
  })
  .catch(err => {
    document.querySelector('.team').innerHTML = "Erreur lors du chargement des équipes NBA.";
    console.error(err);
  });
*/

document.querySelector('.valider').addEventListener('click', () => {
  const firstname = document.querySelector(".prenom").value.trim();
  const lastname = document.querySelector(".nom").value.trim();
  if (firstname !== ""  || lastname !== ""){
    const params = new URLSearchParams();
    if (firstname) params.append("first_name", firstname);
    if (lastname) params.append("last_name", lastname);

    fetch(`http://localhost:3000/api/nba/players?${params.toString()}`)
      .then(response => response.json())
      .then(data => {
        if (data && data.data && data.data.length > 0) {
          let html = `
            <table class="player-table">
              <tr>
                <th>first-name</th>
                <th>last-name</th>
                <th>team</th>
                <th>number</th>
                <th>position</th>
                <th>height</th>
                <th>country</th>
                <th>college</th>
                <th>draft year</th>
              </tr>
          `;
          data.data.forEach(player => {
            html += `
              <tr>
                <td>${player.first_name}</td>
                <td>${player.last_name}</td>
                <td>${player.team.full_name}</td>
                <td>${player.jersey_number}</td>
                <td>${player.position}</td>
                <td>${player.height}</td>
                <td>${player.country}</td>
                <td>${player.college}</td>
                <td>${player.draft_year}</td>
              </tr>
            `;
          });
          html += `</table>`;
          document.querySelector('.answer').innerHTML = html;
        } else {
          document.querySelector('.answer').innerHTML = "No player found";
        }
      });
  }
});





document.querySelector('.teamButton').addEventListener('click', ()=> {
  document.querySelector('.player').style.display = "none";
  document.querySelector('.game').style.display = "none";
  document.querySelector('.team').style.display = "block";
  document.querySelector('.answer').innerHTML = "";
});

document.querySelector('.playerButton').addEventListener('click', ()=> {
  document.querySelector('.team').style.display = "none";
  document.querySelector('.game').style.display = "none";
  document.querySelector('.player').style.display = "block";
  document.querySelector('.answer').innerHTML = "";
});

document.querySelector('.gameButton').addEventListener('click', ()=> {
  document.querySelector('.player').style.display = "none";
  document.querySelector('.team').style.display = "none";
  document.querySelector('.game').style.display = "block";
  document.querySelector('.answer').innerHTML = "";
});