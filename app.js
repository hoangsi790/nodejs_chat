var express = require('express');
var app = express();
app.use(express.static('./public')); // Tất cả Request khách hàng gửi lên thì vào thư mục này

app.set('view engine','ejs');
app.set('views','./views')

var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(3000);


  var arr_User = []; /* mảng chứa user */

io.on('connection', function(socket){ /* connection là lắng nghe sự kiện người dùng kết nối lên server*/
  console.log('- Có người vừa kết nối tới SERVER ' + socket.id);

  // socket.on('disconnect', function(){ /* disconnect là bắt sự kiện khi người dùng ngắt kết nối lên server*/
  //  console.log(socket.id + ' vừa ngắt kết nối');
  // });

  socket.on('client-register', function(data_register){
   console.log(data_register);
    if(arr_User.indexOf(data_register[0])>=0) {
      socket.emit('server-register-fail', data_register); /* gửi thông báo về cho người dùng */
   } else {
     arr_User.push(data_register[0]); /* chèn data thông tin user đăng ký vào mảng */
     socket.username = data_register[0];
     console.log(arr_User);
     socket.emit('server-register-success', data_register );
     io.sockets.emit('server-list-online', arr_User); /* server gửi danh sách online về */
     socket.broadcast.emit('server-ridirect-user-online', socket.username ); /* thông báo tình trạng online cho các người dùng khác*/
   }
    // console.log(data_register[0]);
    // console.log(data_register[1]);
  });
  /***/
 socket.on('logout', function() {

   socket.broadcast.emit('server-difirence-user-logout', socket.username); /* gửi thông báo có ng logout */
   arr_User.splice(
     arr_User.indexOf(socket.username), 1
   );
   socket.broadcast.emit('server-list-online', arr_User); /* cập nhật lại danh sách */
   socket.emit('server-ridirect-after-logout');
 });

socket.on('user-send-messages', function(content) {
  io.sockets.emit('server-send-meesages', {_username : socket.username, _content : content});
})


});

/*
Emit là phát tín hiệu
On là lắng nghe

io.sockets.emit -- đứng từ phía server, câu lệnh này giúp trả tín hiệu cho tất cả người kết nối
socket.emit -- server chỉ trả về tín hiệu cho người tác gửi
socket.broadcast.emit -- server trả tín hiệu về cho tất cả ngoại trừ người gửi
io.to('socket_id').emit();
*/

app.get('/', function(req, res) {
  res.render('index');
})
