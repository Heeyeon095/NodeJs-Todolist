const express = require('express');
const app = express();
var path = require('path');

app.set('view engine', 'ejs');

// mongodb 연결
const MongoClient = require('mongodb').MongoClient;

let db;
MongoClient.connect(
  'mongodb+srv://ellen095:dlgmldus1@todo.x76qux6.mongodb.net/?retryWrites=true&w=majority',
  function (error, client) {
    if (error) return console.log(error);

    // Todolist라는 database에 연결
    db = client.db('Todolist');

    // 서버띄우는 코드 여기로 옮기기
    app.listen(3000, function () {
      console.log('listening on 3000');
    });
  }
);

// post 요청으로 서버에 데이터 전송할 때 쓰임
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'css')));

// get

app.get('/', function (req, res, next) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/write', function (req, res, next) {
  res.sendFile(__dirname + '/write.html');
});

app.get('/list', (req, res, next) => {
  // db에 저장된 post라는 collection 안의 모든 데이터를 꺼냄
  db.collection('post').find().toArray((error, result) => { //배열로
    console.log(result);
    res.render('list.ejs', {posts : result}); // 데이터를 꺼낸 함수 안에 위치해야 변수가 값을 가져올 수 있음
  });
  
});

// post

app.post('/add', (req, res, next) => {
  let todo = req.body.todo;
  let date = req.body.date;

  // findOne : 하나만 찾고 싶을 때 find : 전부 찾고 싶을 때
  db.collection('counter').findOne({ name: '게시물 갯수' }, (error, result) => { 
    let totalPost = result.totalPost;

    // 데이터 저장 형식
    // post : database 만들때 만든 collection 이름
    db.collection('post').insertOne({_id: totalPost + 1, todo: todo, date: date }, (error, result) => {
      if (error) {
        alert(error);
      } else {
        console.log('sucessful saved!');

        // total count 증가
        // 많이 바꾸고 싶을 땐 updateMany, {수정할 데이터}, {수정할 값}, $set - 값을 바꿀 때 set 사용, $inc - 현재 값 + 작성한 만큼 증가
        db.collection('counter').updateOne({ name: '게시물 갯수' }, { $inc: { totalPost: 1 } }, (error, result) => {
          
          if (error) {
            console.error(error);
          }

        });

      }
    });

  });

  res.redirect('/');
});
