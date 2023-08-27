const express = require('express');
const app = express();
var path = require('path');

// session
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');

// middle ware - 웹서버의 요청과 응답 중간에 무언가를 하고 싶을 때 사용
app.use(session({ secret: '0905', resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// html form - method에 put, delete 쓸 수 있게 해줌
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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

app.use(express.static(path.join(__dirname, 'public')));

// get

app.get('/', function (req, res, next) {
  // res.sendFile(__dirname + 'index.html');
  res.render('index', {});
});

app.get('/write', function (req, res, next) {
  res.render('write', {});
});

app.get('/list', (req, res, next) => {
  // db에 저장된 post라는 collection 안의 모든 데이터를 꺼냄
  db.collection('post')
    .find()
    .toArray((error, result) => {
      // 배열로

      res.render('list.ejs', { posts: result }); // 데이터를 꺼낸 함수 안에 위치해야 변수가 값을 가져올 수 있음
    });
});

app.get('/detail/:id', (req, res, next) => {
  db.collection('post').findOne({ _id: parseInt(req.params.id) }, (error, result) => {
    // params - 파라미터 중 id 가져옴
    res.render('detail.ejs', { data: result });
  });
});

app.get('/edit/:id', (req, res, next) => {
  db.collection('post').findOne({ _id: parseInt(req.params.id) }, (error, result) => {
    if (error) {
    } else {
      res.render('edit.ejs', { post: result });
    }
  });
});

app.get('/login', (req, res) => {
  res.render('login.ejs', {user: req.user});
});

function loginYes(req, res ,next) { // 로그인했는지 검사하는 커스텀 미들웨어
  if (req.user) {
    next();
  } else {
    res.send('로그인하세여');
  };
};

app.get('/mypage', loginYes, (req, res) => {
  res.render('mypage.ejs');
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
    db.collection('post').insertOne({ _id: totalPost + 1, todo: todo, date: date }, (error, result) => {
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

  // 로그인하면 인증해주세요 라는 라이브러리 문법
  app.post('/login', passport.authenticate('local', {failureRedirect : '/fail'}), function(req, res){
    res.redirect('/');  
  });

// delete

app.delete('/delete', (req, res, next) => {
  req.body._id = parseInt(req.body._id);
  db.collection('post').deleteOne(req.body, (error, result) => {
    res.status(200).send(); //200 - 요청 성공 400 - 요청 실패
  });
});

// put

app.put('/edit', (req, res, next) => {
  db.collection('post').updateOne(
    { _id: parseInt(req.body.id) },
    { $set: { todo: req.body.todo, date: req.body.date } },
    (error, result) => {
      // 왼쪽 중괄호에 있는 값을 오른쪽 중괄호에 있는 값을 바꾼다
      res.redirect('/list');
    }
  );
});

// session login id, pw check

passport.use(new LocalStrategy({
  usernameField: 'loginId',
  passwordField: 'loginPw',
  session: true, // session 만들 것임
  passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) {
  //console.log(입력한아이디, 입력한비번);
  db.collection('login').findOne({ id: 입력한아이디 }, function (error, result) {
    if (error) return done(error);

    if (!result) return done(null, false, { message: '존재하지않는 아이디요' }); // db에 아이디가 없으면
    if (입력한비번 == result.pw) { // 그 아이디와 비밀번호가 맞는지
      return done(null, result);
    } else {
      return done(null, false, { message: '비번틀렸어요' });
    }
  })
}));

passport.serializeUser(function (user, done) { // user.id라는 정보로 세션 생성, 위의 result를 user로 가져옴
  done(null, user.id); // 세션 데이터를 만들고 세션의 id 정보를 쿠키로 보냄
;});
passport.deserializeUser(function (id, done) { // 세션이 존재한다면 어떤 정보를 가지고 있는지 분석
  db.collection('login').findOne({ id: id }, function (error, result) { // db에서 위에 있는 user.id로 유저를 찾은 뒤에 유저 정보를 
    done(null, result); // result라는 이름으로 넣음 -> 마이페이지 같은 곳에서 다른 정보들 출력 가능
  });
});