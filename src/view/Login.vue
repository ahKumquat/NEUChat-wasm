<script setup lang="ts">
import {reactive} from "vue";
import {appWindow, WebviewWindow} from "@tauri-apps/api/window";
import {minimizeWindow, closeWindow} from "../common/WindowEvent";


import {login} from "../common/Api";

const user = reactive({
  account: "",
  password: ""
})

const requestLogin = async () => {
  const token = (await login(user)).data;
  if (!token) {
    console.log("The token is null!");
    return;
  }

  localStorage.setItem("token", token);
  appWindow?.hide();

  const webview = new WebviewWindow("chat", {
    url: "#/chat",
    center: true,
    minHeight: 600,
    minWidth: 800,
    decorations: false,
  });

  await webview.once("tauri://created", function () {
    appWindow?.close();
  });

};
</script>

<template>
  <div data-tauri-drag-region class = "titleBar">
    <div @click = " minimizeWindow()" class="titleBar-button minimize-btn">
      <i class="iconfont icon-minus"></i>
    </div>
    <div @click="closeWindow()" class = "titleBar-button close-btn">
      <i class="iconfont icon-close"></i>
    </div>
  </div>
  <div class="main">
    <div class = "back">
      <span>NEUChat</span>
    </div>
    <div class = "input-box">
      <div>
        <span>Account</span>
        <input v-model = "user.account" type = "text" placeholder="Your Account">
      </div>
      <div>
        <span>Password</span>
        <input v-model = "user.password" type = "password" placeholder="Your Password">
      </div>
      <button @click = "requestLogin()" class="login-btn">Login</button>
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
  .back {
    width: 100%;
    height: 125px;
    background: #665dfe;
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

.login-btn{
  width: 100%;
  height:40px;
  background: #665dfe;
  color: #ffffff;
  outline: none;
  border: none;
  margin-top: 20px;
  border-radius: 4px;
  font-size: 15px;
 }


</style>