const express = require('express');
const app = express();
var path = require('path');

// mongodb 연결
const MongoClient = require('mongodb').MongoClient;

let db;
MongoClient.connect('mongodb+srv://ellen095:dlgmldus1@todo.x76qux6.mongodb.net/?retryWrites=true&w=majority', function(error, client){
  if (error) return console.log(error);

  // Todolist라는 database에 연결
  db = client.db('Todolist');

  // 데이터 저장 형식
  // post : database 만들때 만든 collection 이름
  db.collection('post').insertOne({name : 'hee', age : 24}, (error, result) => {
    console.log('finish!');
  });
  
  // 서버띄우는 코드 여기로 옮기기
  app.listen(3000, function () {
    console.log('listening on 3000');
  });
})


// post 요청으로 서버에 데이터 전송할 때 쓰임
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'css')));

app.get('/', function (req, res, next) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/write', function (req, res, next) {
  res.sendFile(__dirname + '/write.html');
});

app.post('/add', (req, res, next) => {
  res.send('hi');
  console.log(req.body.todo);
});

