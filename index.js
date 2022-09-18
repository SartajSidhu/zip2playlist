const APIController = (function() {
    
  const clientId = 'PASTE YOUR CLIENT ID HERE';
  const clientSecret = 'PASTE YOUR CLIENT SECRET HERE';

  const _getToken = async () => {

      const result = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
              'Content-Type' : 'application/x-www-form-urlencoded', 
              'Authorization' : 'Basic ' + btoa( clientId + ':' + clientSecret)
          },
          body: 'grant_type=client_credentials'
      });
      var
      createPlaylist(file, name) {
        var missedSongs = 0;
        for (f in file){
          try{
            addtrack(f.file)
          }
          catch(err){
            missedSongs+=1;
          }  
        }
        var result = await fetch('https://api.spotify.com/v1/browse/categories/${file}/playlists?limit=${name}');
        return [result, missedSongs]
      }

      const data = await result.json();
      return data.access_token;
  }


const token = "Your discord token";  

const { Client, GatewayIntentBits } = require('discord.js');


const client = new Client({intents: GatewayIntentBits.Guilds});

// on the top
const fetch = require('node-fetch');

client.on('message', async (message) => {
  if (message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'readfile') {
    message.channel.send('Send your file please...');

    const filter = (m) => m.author.id === message.author.id;

    try {
      const collected = await message.channel.awaitMessages(filter, { max: 1 });

      // get the file's URL
      const file = collected.first().attachments.first()?.url;
      if (!file) return console.log('No attached file found');

      // await the message, so we can later delete it
      const sent = await message.channel.send(
        'Reading the file! Fetching data...',
      );

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
      // take the response stream
      const text = await response.text();

      const playlist = await APICtrl.getPlaylistByGenre(text, attachments.first());       
      // create a playlist list item for every playlist returned
      playlist.forEach(p => UICtrl.createPlaylist(p.name, p.tracks.href));
      
      if (text) {
        sent.delete();
        return message.channel.send(`Here is your playlist\`${playlist[0]}\`\There were ${playlist[1]} missed songs`);
      }
    } catch (err) {
      console.log(err);
      return message.channel
        .send(`There was an error...`)
        .then((sent) => setTimeout(() => sent.delete(), 2000));
    }
client.login(token);