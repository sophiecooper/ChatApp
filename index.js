var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

//initialize the user index and the hashmap of bad words
var user_num = 1;
var bad_words = {};
var bad_words_list = ["Trump","poop","fart","pee","hate","butt","idiot","jerk","poo","bitch","shit","fuck","damn","shitty","fucking","whore","slut","ass","asshole"];
for (i = 0; i < bad_words_list.length; i++){
	bad_words[bad_words_list[[i]]] = true;
}

io.on('connection', function(socket){
  
  var curr_user = user_num;
  user_num += 1;

  console.log('user ' + curr_user + ' has connected');
  socket.broadcast.emit('chat message', 'user ' + curr_user + ' has entered the chat');

  socket.on('chat message', function(msg){
  	
  	//CENSORING MESSAGES THAT CONTAIN WORDS ON THE BLACKLIST
  	if (msg.indexOf(" ") > -1) {
  		//the message contains a space, so we split the message into a list of words to check for items on the blacklist
	  	var split_message = msg.split(" ");
	  	for (i = 0; i < split_message.length; i++) {
	  		// if any word is on the blacklist, it will be replaced with "*censored*", else leave the word
	  		if (bad_words[split_message[i]]) {
	  			split_message[i] = "*censored*";
	  		}
	  	}
	  	msg = String(split_message.join(" "));

  	} else {
  		//the message does not contain a space, so compare with words on the blacklist
  		if (bad_words[msg]) {
	  			msg = "*censored*";
	  		}
  	}

  	// print 1000 random messages from random users, begins when a user types "start"
  	function print_random_messages(){
  	// this function will print 1000 random messages from random users
	  	for (x = 0; x < 1000; x++) {
	  		var random_message = "";
	  		var possible_letters = "abcdefghijklmnopqrstuvwxyz  ";
	  		var word_length = Math.floor(Math.random()*20);
	  		for (i = 0; i < word_length; i++){
	  			random_message += possible_letters.charAt(Math.floor(Math.random()*possible_letters.length));
	  		}
	  		io.emit('chat message', "user " + Math.floor(Math.random()*user_num) + " :  " + random_message);
	  		console.log(random_message);
	  	}
	}
  	if (msg == "start") {
  		//this runs the fuction print_random_messages every 5 seconds
	  	var repeatTimer = setInterval(print_random_messages, 5000);
	}
 
    io.emit('chat message', "user " + curr_user + " :  " + msg);
    console.log('user' + curr_user + ' : ' + msg);
  });

  socket.on('disconnect', function(){
  	console.log('user ' + curr_user + ' has disconnected');
  	socket.broadcast.emit('chat message', 'user ' + curr_user + ' has left the chat');
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});