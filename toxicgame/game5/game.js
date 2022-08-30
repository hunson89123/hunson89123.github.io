//載入fb文件
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-app.js'
import { getDatabase, ref, child, get, set } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-database.js"

//初始化fb
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
//增
function writeUserData(userId, name, email, imageUrl) {
  const db = getDatabase();
  set(ref(db, 'users/' + userId), {
    username: name,
    email: email,
    profile_picture : imageUrl
  });
}

//查
function selectdata(){
  const dbRef = ref(getDatabase());
  get(child(dbRef, `users/0`)).then((snapshot) => {
    if (snapshot.exists()) {
      console.log(snapshot.val().email);
      document.getElementById('read').innerHTML=snapshot.val().email;
    } else {
      console.log("No data available");
    }
  }).catch((error) => {
    console.error(error);
  });
}
writeUserData("0","hunson","hunson89123@gmail.com","https://lh3.googleusercontent.com/ogw/AOh-ky2GM3d-efYoL1aCQkD_urwJqsenth6BMHnibpViUQ=s32-c-mo")
selectdata();