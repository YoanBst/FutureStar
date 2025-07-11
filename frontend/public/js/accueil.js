


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
*/function findTeamId(nameOfTheTeam){
  for (let i = 0; i<teamsList.length; i++){
    if (teamsList[i].full_name === nameOfTheTeam){
      return teamsList[i].id;
    }
  }
}

const teamsList = [
  { id: 1, full_name: "Atlanta Hawks" },
  { id: 2, full_name: "Boston Celtics" },
  { id: 3, full_name: "Brooklyn Nets" },
  { id: 4, full_name: "Charlotte Hornets" },
  { id: 5, full_name: "Chicago Bulls" },
  { id: 6, full_name: "Cleveland Cavaliers" },
  { id: 7, full_name: "Dallas Mavericks" },
  { id: 8, full_name: "Denver Nuggets" },
  { id: 9, full_name: "Detroit Pistons" },
  { id: 10, full_name: "Golden State Warriors" },
  { id: 11, full_name: "Houston Rockets" },
  { id: 12, full_name: "Indiana Pacers" },
  { id: 13, full_name: "LA Clippers" },
  { id: 14, full_name: "Los Angeles Lakers" },
  { id: 15, full_name: "Memphis Grizzlies" },
  { id: 16, full_name: "Miami Heat" },
  { id: 17, full_name: "Milwaukee Bucks" },
  { id: 18, full_name: "Minnesota Timberwolves" },
  { id: 19, full_name: "New Orleans Pelicans" },
  { id: 20, full_name: "New York Knicks" },
  { id: 21, full_name: "Oklahoma City Thunder" },
  { id: 22, full_name: "Orlando Magic" },
  { id: 23, full_name: "Philadelphia 76ers" },
  { id: 24, full_name: "Phoenix Suns" },
  { id: 25, full_name: "Portland Trail Blazers" },
  { id: 26, full_name: "Sacramento Kings" },
  { id: 27, full_name: "San Antonio Spurs" },
  { id: 28, full_name: "Toronto Raptors" },
  { id: 29, full_name: "Utah Jazz" },
  { id: 30, full_name: "Washington Wizards" },
  // Anciennes équipes 
  { id: 37, full_name: "Chicago Stags" },
  { id: 38, full_name: "St. Louis Bombers" },
  { id: 39, full_name: "Cleveland Rebels" },
  { id: 40, full_name: "Detroit Falcons" },
  { id: 41, full_name: "Toronto Huskies" },
  { id: 42, full_name: "Washington Capitols" },
  { id: 43, full_name: "Providence Steamrollers" },
  { id: 44, full_name: "Pittsburgh Ironmen" },
  { id: 45, full_name: "Baltimore Bullets" },
  { id: 46, full_name: "Indianapolis Jets" },
  { id: 47, full_name: "Anderson Packers" },
  { id: 48, full_name: "Waterloo Hawks" },
  { id: 49, full_name: "Indianapolis Olympians" },
  { id: 50, full_name: "Denver Nuggets" }, 
  { id: 51, full_name: "Sheboygan Redskins" }
];


document.querySelector('.valider').addEventListener('click', () => {
  const firstname = document.querySelector(".prenom").value.trim();
  const lastname = document.querySelector(".nom").value.trim();
  const poste = document.querySelector(".poste").value;
  const height = document.querySelector(".height").value.trim();
  const team= document.querySelector(".team-select").value;
  const params = new URLSearchParams();



  if (firstname && !lastname  && poste === "Position : none" && team == "team" && height===""){
    params.append("first_name", firstname);
  }else if (!firstname && lastname  && poste === "Position : none" && team == "team" && height===""){
    params.append("last_name", lastname);
  }else if (firstname && lastname  && poste === "Position : none" && team == "team" && height===""){
    
    params.append("first_name", firstname);
    params.append("last_name", lastname);
  }else if  (!firstname &&!lastname && poste!=="Position : none" && height==="" && team == "team"){
      
     params.append("position", poste);
  }else if (!firstname &&!lastname && poste =="Position : none" && height && team == "team"){
    params.append("height", height);
  }else if (!firstname &&!lastname && poste == "Position : none" && height==="" && team !== "team"){
    params.append("team", team);
  }else if (!firstname &&!lastname && poste == "Position : none" && height && team !== "team"){
    params.append("team", team);
    params.append("height", height);
  }else if (!firstname &&!lastname && poste != "Position : none" && height==="" && team !== "team"){
    params.append("position", poste);
    params.append("team", team);
  }else if (!firstname &&!lastname && poste == "Position : none" && height && team == "team"){
    params.append("position", poste);
    params.append("height", height);
  }else if (!firstname &&!lastname && poste !== "Position : none" && height && team  !== "team"){
    params.append("position", poste);
    params.append("height", height);
    params.append("team", team)

  }else if (firstname &&lastname && (poste !== "Position : none" | height | team  !== "team")){
    document.querySelector('.answer').innerHTML = "Please choose firstname+last-name or select others elements";
    return;
  
  }

    fetch(`http://localhost:3000/api/nba/players?${params.toString()}`)
      .then(response => response.json())
      .then(data => {
         let players = data.data;
        
        

        if (!players || players.length === 0) {
          document.querySelector('.answer').innerHTML = "No player found";
          return;
        }

        if (height !== "" ) {
          players = players.filter(player =>
            player.height === height
          );
        };
        if (poste!== "Position : none"){
          players = players.filter(player =>
            player.position === poste
          );
        
        }

        

        

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
          players.forEach(player => {
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
  });






document.querySelector('.searchTeam').addEventListener('click', () => {
  
  const team_search = document.querySelector(".team-select2").value;
  const old_team = document.querySelector(".oldTeam").value;
  const conference = document.querySelector(".conference").value;
  const division = document.querySelector(".division").value;
  


  
   

    fetch(`http://localhost:3000/api/nba/teams`)
      .then(response => response.json())
      .then(data => {
         let teams = data.data;
        
        

        if (!teams || teams.length === 0) {
          document.querySelector('.answer').innerHTML = "No team found";
          return;
        }

        if(team_search !== "team" && old_team === "old team"){
          teams = teams.filter(team =>
            team.full_name === team_search
          )
        };
        if(team_search == "team" && old_team !== "old team"){
          teams = teams.filter(team =>
            team.full_name === old_team
          )
        };

        if(team_search === "team" && old_team === "old team" && conference !== "conference" && division !== "division"){
          teams = teams.filter(team =>
            team.conference === conference &&
            team.division === division
          )
        };






        if(team_search === "team" && old_team === "old team" && conference !== "conference" && division == "division"){
          teams = teams.filter(team =>
            team.conference === conference
          )
        };

        if(team_search === "team" && old_team === "old team" && conference === "conference" && division !== "division"){
          teams = teams.filter(team =>
            team.division === division
          )
        };


        
        

        

        

        if (data && data.data && data.data.length > 0) {
          let html = `
            <table class="player-table">
              <tr>
                <th>full name</th>
                <th>abbreviation</th>
                <th>city</th>
                <th>conference</th>
                <th>division</th>
                
              </tr>
          `;
          teams.forEach(team => {
            html += `
              <tr>
                <td>${team.full_name}</td>
                <td>${team.abbreviation}</td>
                <td>${team.city}</td>
                <td>${team.conference}</td>
                <td>${team.division}</td>
              </tr>
            `;
          });
          html += `</table>`;
          document.querySelector('.answer').innerHTML = html;
        } else {
          document.querySelector('.answer').innerHTML = "No team found";
        }
      });
  });




document.querySelector('.searchGame').addEventListener('click', () => {
  
  const team_game = document.querySelector(".team_game").value;
  const season = document.querySelector(".season").value;
  const playoff = document.querySelector(".playoff");
  const params = new URLSearchParams();

  if(team_game !== "team" && season !== null ){
    params.append("team", team_game);
    params.append("season", season);
  }else{
    document.querySelector(".answer").innerHTML = "Error : you need to choose a team and a year";
  }


  


  
   

    fetch(`http://localhost:3000/api/nba/games?${params.toString()}`)
      .then(response => response.json())
      .then(data => {
         let games = data.data;
        
        

        if (!games || games.length === 0) {
          document.querySelector('.answer').innerHTML = "No game found";
          return;
        }
        if (playoff.checked) {
          games = games.filter(game => game.postseason === true);
        }


        
        

        

        

        if (data && data.data && data.data.length > 0) {
          let html = `
            <table class="player-table">
              <tr>
                <th>season</th>
                <th>postseason</th>
                <th>home team</th>
                <th>score home team</th>
                <th>score visitor team</th>
                <th>visitor team</th>
                
                
              </tr>
          `;
          games.forEach(game => {
            html += `
              <tr>
                <td>${game.season}</td>
                <td>${game.postseason}</td>
                <td>${game.home_team.full_name}</td>
                <td>${game.home_team_score}</td>
                <td>${game.visitor_team_score}</td>
                <td>${game.visitor_team.full_name}</td>
              </tr>
            `;
          });
          html += `</table>`;
          document.querySelector('.answer').innerHTML = html;
        } else {
          document.querySelector('.answer').innerHTML = "No team found";
        }
      });
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

document.querySelector('.clear').addEventListener('click', () => {
  document.querySelector('.prenom').value = "";
  document.querySelector('.nom').value = "";
  document.querySelector('.height').value = "";
  document.querySelector('.poste').value = "Position : none";
  document.querySelector('.team-select').value = "team";
  document.querySelector('.answer').innerHTML= "";

});

document.querySelector('.clearTeam').addEventListener('click', () => {
  document.querySelector('.team-select2').value = "team";
  document.querySelector('.oldTeam').value = "old team";
  document.querySelector('.conference').value = "conference";
  document.querySelector('.division').value = "division";

  document.querySelector('.answer').innerHTML= "";
});

document.querySelector('.clearGame').addEventListener('click', () => {
  document.querySelector('.team_game').value = "team";
  
  document.querySelector('.playoff').checked = false;
  document.querySelector('.season').value = "";
  document.querySelector('.answer').innerHTML= "";




});