const router = require('express').Router();

router.use(functionName); // 현재 라우터 파일 모든 url에 적용할 미들웨어

router.use('/url', (functionName)); // 특정 라우터에 접속한 url에만 적용할 미들웨어

module.exports = router;