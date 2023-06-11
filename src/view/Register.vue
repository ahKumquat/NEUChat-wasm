<script setup lang="ts">

import {reactive} from "vue";
import {register} from "../common/Api";
import {appWindow, WebviewWindow} from "@tauri-apps/api/window";


const newUser = reactive({
  account: "",
  username: "",
  password: "",
})


const requestRegister = async () => {
  const token = (await register(newUser)).data;
  if (!token) {
    console.log("The token is null!");
    return;
  }

  //Save token to local cache
  localStorage.setItem("token", token);
  appWindow?.hide();

  //Create a new window for chat view
  const webview = new WebviewWindow("chat", {
    url: "#/chat",
    center: true,
    minHeight: 600,
    minWidth: 800,
  });

  //Creating successfully
  await webview.once("tauri://created", function () {
    appWindow?.close();
  });

}

</script>

<template>
  <div class="main">
    <div class = "back">
      <span>NEUChat</span>
    </div>
    <div class = "input-box">
      <div>
        <span>Account</span>
        <input v-model = "newUser.account" type = "text" placeholder="Your Account">
      </div>
      <div>
        <span>Username</span>
        <input v-model = "newUser.username" type = "text" placeholder="Your UserName">
      </div>
      <div>
        <span>Password</span>
        <input v-model = "newUser.password" type = "password" placeholder="Your Password">
      </div>
      <button @click = "requestRegister()" class="register-btn">Register</button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.titleBar{
  height: 28px;
  user-select: none;
  display: flex;
  justify-content: flex-end;
  position: fixed;
  top: 0;
  right: 0;
  color: #ffffff;
}
.titleBar-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 26px;
  cursor: pointer;
  i {
    font-size: 16px;
  }
}
.titleBar-button:hover {
  background: rgba(255, 255, 255, 0.2);
}
.close-btn:hover {
  background: #fb7373;
  color: #ffffff;
}

.main{
  align-items: center;
  height: 100%;
  background: #ffffff;
  .back {
    width: 100%;
    height: 125px;
    background: #0f0f0f;
    span{
      display: inline-block;
      color: #ffffff;
      margin: 20px;
      font-size: 50px;
    }
  }
  .input-box {
    width: 240px;
    margin: 0 auto;
    input {
      background: #ffffff;
      color: #0f0f0f;
    }
    div {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #e5e5e5;
      margin-top: 15px;
    }
    span {
      flex-shrink: 0;
      color: #808080;
      font-size: 13px;
      width: 55px;
    }
    input {
      margin-left: 10px;
      margin-bottom: 10px;
      outline: none;
      border: none;
      width: 100%;
      height: 30px;
      font-size: 16px;
      box-shadow: none;

    }
  }
}

.register-btn{
  width: 100%;
  height:40px;
  background: #0f0f0f;
  color: #ffffff;
  outline: none;
  border: none;
  margin-top: 20px;
  border-radius: 4px;
  font-size: 15px;
}




</style>