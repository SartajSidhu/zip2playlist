
const token = "MTAyMTA2NDk0NjgxMDg5NjQ4NA.GJ-YKe.V9XKfZgylaK5moLJ1Y65Q0pJbmlNjvQVjclKUQ";  //token for discord app

const { Client, GatewayIntentBits, Collection, EmbedBuilder, PermissionsBitField, Permissions, Message } = require(`discord.js`);

const prefix = '!'; //prefix for discord commands

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const fetch = require('node-fetch');// package to read files through discord without having on PC

//setting up spotify 
const SpotifyWebApi = require('spotify-web-api-node');
const authorizationCode = '<insert authorization code>';

const spotifyApi = new SpotifyWebApi({
  clientId: '<insert client id>',
  clientSecret: '<insert client secret>',
  redirectUri: '<insert redirect URI>'
});

client.on("ready", ()=> {
  console.log("bot is online");
})

client.on("messageCreate", async (message) =>{
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  //msg array
  const messageArray = message.content.split(" ");
  const arguement = messageArray.slice(1);
  const cmd = messageArray[0];



  if (command === 'zip2playlist') {
    message.channel.send('Send your Zip file please with a Playlist name!...');

    const filter = (m) => m.author.id === message.author.id;

    try {
      const collected = await message.channel.awaitMessages(filter, { max: 1 });
      
      //get playlist name
      const playlistName = message.channel.lastMessage();
      // get the file's URL
      const file = collected.first().attachments.first()?.url;

      spotifyApi.createPlaylist(playlistName, { 'description': '', 'public': true }) 
      .then(function(data) {
        console.log('Created playlist');
        const playlistID = data.playlistID; //playlist id needed for adding tracks
      }, function(err) {
        return message.channel.send('Error creating playlist through spotify');
      });
      
      if (!file) return console.log('No attached file found');

      // await the message, so it can be deleted if error
      const sent = await message.channel.send('Reading the file! Creating your playlist! ...');

      // fetch the file from the external URL
      const response = await fetch(file);

      // if there was an error send a message with the status
      if (!response.ok) {
        sent.delete();
        return message.channel.send(
          'There was an error fetching your file:',
          response.statusText,
        );
      }

      // take the response stream and read it to completion
      const potentialTracks = await response.text();
      var missedSongs = 0;

      //loop through all mp3 file names within zip
      for (var track of potentialTracks){
        //searching for track close to mp3 file name
        spotifyApi.authorizationCodeGrant(authorizationCode).then(function(data) {
          spotifyApi.setAccessToken(data.body['access_token']);
          // Use the access token to retrieve information about the user connected to it
          return spotifyApi.searchTracks(track); 
        })
        .then(function(data) {
          var curTrack = data.body.tracks.index(0); //top most result
          // adding track to palylist
          spotifyApi.authorizationCodeGrant(authorizationCode).then(function(data) {
            spotifyApi.setAccessToken(data.body['access_token']);
            return spotifyApi.addTracksToPlaylist(
              playlistID, //id of newly created playlist
              {track:curTrack.uri}, {position: 0} //adding track using track uri at first position
            );
          })
          .then(function(data) {
            console.log('Added tracks to the playlist!');
          })
          .catch(function(err) {
            console.log('Something went wrong:', err.message);
          });

        }).catch(function(err) {
          missedSongs+=1; //no track was found, add to count
        });
      }
      spotifyApi.getPlaylist(playlistID).then(function(data) {
        const playlistURL = data.body.preview_url; //setting url var
      }, function(err) {
        console.log('Something went wrong!', err);
      });

      if(missedSongs > 0){ //if songs couldnt be found inform user how many
        message.channel.send('We couldnt find'+ missedSongs +'from your file but here is your playlist: ');
      }
      else{
        message.channel.send("Here is your playlist: ");
      }
      return message.channel.send(playlistURL);

    } catch (err) {
      console.log(err);
      return message.channel
        .send(`There was an error creating your playlist ...`)
        .then((sent) => setTimeout(() => sent.delete(), 2000));
    }
  }
})

client.login(token);
