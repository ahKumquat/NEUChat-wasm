<template>
  <div class="main">
    <div class = "sideBar">
      <img class="userAvatar" :src="user?.avatar" alt=""/>
      <div class="iconBox">
        <i class="iconfont iconChat"></i>
      </div>
      <button class = "gameRoom" @click = "openGame()"/>
    </div>

    <div class = "userList">
      <div class = "searchBox">
        <input type = "text" placeholder="Search" @click = "openAuto()" @blur = "closeAuto()">
        <div class="result" :hidden="true" id="searchinput">
          <div v-for = "u in userList" >
            <span> {{u}} </span>
          </div>
        </div>
      </div>


      <div class = "list" id = "items">
        <div
            @click = "selectUser(idx)"
            v-for = "(item, idx) in userList"
            class="result2"
            :key = "idx"
            :class="userIdx == idx ? 'active':''"
        >
          <div class="item">
            <h5>{{item}}</h5>
          </div>
            <div>
              <div v-show="item.unread" class = "mark"></div>
            </div>
        </div>
      </div>
    </div>

    <div class="content">
      <div class="title">
        <span>{{
            userIdx != -1 ? userList[userIdx]:""
          }}
        </span>
      </div>

      <div ref="record" class="record" :style = " userIdx == -1 ? 'visibility: hidden' : ''">
        <div
            :class="item.isSend == 1? 'self' : 'other'"
            v-for="(item,idx) in chatHistory"
            :key = "idx">
          <div v-if="item.isSend == 1" class="bubbleBox">
            {{item.msg}}
          </div>
          <img
              class="avatar"
              :src="item.isSend == 1? user.avatar:item.senderAvatar"
              alt=""
          />
          <div v-if="item.isSend == 2" class="bubbleBox">
            {{item.msg}}
          </div>
        </div>
      </div>

      <div class = "input" :style = " userIdx == -1 ? 'visibility: hidden' : ''">
        <div class="icon">
          <button @click="openGame()" class="gameButton"/>
        </div>
        <textarea v-model = "msgObj.msg" cols="30" rows="4"></textarea>
        <button @click="sendMsg()" class = "sendBtn">Send</button>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>


.main {
  height: 100%;
  display: flex;
  background: #f8f8f8;
}

.sideBar {
  width: 60px;
  height: 100%;
  background: #0f0f0f;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  .iconBox {
    width: 40px;
    height: 40px;
    background: rgba(255,255,255,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    .iconfont {
      font-size: 22px;
    }
  }
}

.userList {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
}

.searchBox {
  height: 60px;
  border-right: 1px solid #e5e9f2;
  flex-shrink: 0;
  display: flex;
  padding: 0 10px;
  input {
    width: 100%;
    height: 34px;
    border-radius: 40px;
    outline: none;
    padding: 0 15px;
    border: 1px solid #ced4da;
    background: #ffffff;
    color: #0f0f0f;
    margin-top: 10px;
  }
  .result {
    color: #0f0f0f;
    background: #665dfe;
    border-radius: 7px;
    border: 1px solid #e5e9f2;
    position: fixed;
    top: 50px;
    width: calc(100% - 550px);
    height: 100px;
    overflow: auto;
    z-index: 1;
    div {
      display: flex;
      padding: 0 20px;
      span {
        margin-top: 10px;
      }
    }
  }
}

.list {
  width: 260px;
  height: 100%;
  overflow-y: auto;
  padding: 10px;
  border-top: 1px solid #e5e9f2;
  border-right: 1px solid #e5e9f2;
  border-bottom: 1px solid #e5e9f2;
  .item {
    display: flex;
    height: 80px;
    align-items: center;
    padding: 0 20px;
    color: #705057;
    position: relative;
    > div {
      margin-left: 10px;
      .time {
        font-size: 12px;
        color: #49556c;
      }
    }

    img {
      flex-shrink: 0;
    }

    .mark {
      position: absolute;
      right: 10px;
      top: 10px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: #ff3b30;
    }
  }
  .active {
    background: #665dfe;
    border-radius: 4px;
    color: #ffffff;
    > div {
      .time {
        color: #ffffff;
      }
    }
  }
}

.content {
  display: flex;
  flex-direction: column;
  width: 100%;
  .title {
    flex-shrink: 0;
    height: 60px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #e5e9f2;
    padding: 0 20px;
    font-size: 20px;
    color: #0f0f0f;
  }
  .record {
    height: 100%;
    overflow-y: auto;
    > div {
      width: 60%;
      padding: 5px 30px;
      display: flex;
      justify-content: flex-start;
      margin: 5px 0;
      > div {
        word-break: break-word;
        padding: 10px;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
        font-size: 14px;
        line-height: 22px;
      }
      img {
        width: 40px;
        height: 40px;
      }
    }
    .self {
      justify-content: flex-end;
      margin-left: auto;
      .bubbleBox {
        border-top-left-radius: 4px;
        margin-left: 10px;
        background: #665dfe;
        color: #ffffff;
      }
    }
    .other {
      justify-content: flex-start;
      margin-right: auto;
      .bubbleBox {
        border-bottom-right-radius: 4px;
        margin-left: 10px;
        color: #f6f6f6;
        background: #49556c;
      }
    }
  }

  .input {
    width: 100%;
    flex-shrink: 0;
    border-top: 1px solid #e5e9f2;
    position: relative;
    line-height: 0;
    .icon {
      width: 30px;
      height: 40px;
      position: absolute;
      cursor: pointer;
      right: 10px;
      display: flex;
      justify-content: flex-end;
      box-sizing: border-box;
      .gameButton{
        background: #665dfe;
        margin-left: 10px;
      }
    }
    .sendBtn {
      background: #0f0f0f;
      color: #ffffff;
      outline: none;
      border: none;
      padding: 6px 20px;
      border-radius: 4px;
      position: absolute;
      right: 20px;
      bottom: 10px;
      cursor: pointer;
      &:hover {
        background: #1520A6;
      }
    }
  }
}
.gameRoom{
  background: #fb7373;
  margin-top: 10px;
  width: 40px;
  height: 40px;
}
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

textarea {
  width: 100%;
  resize: none;
  outline: 0;
  border: none;
  margin: 40px 0;
  padding: 0 30px;
  font-size: 16px;
  box-sizing: border-box;
  background: #f8f8f8;
}

::-webkit-scrollbar {
  width: 7px;
}

::-webkit-scrollbar-thumb {
  border-radius: 7px;
  background: #494949;
}

.result2 {
  color: #0f0f0f;
  border-radius: 7px;
}
</style>

<script setup lang = "ts">

import {onMounted} from "vue";
import {
  selectUser,
  sendMsg,
  init,
  user,
  msgObj,
  userIdx,
  chatHistory,
  userList, videoCall,
} from "../script/ChatController";
import {appWindow, WebviewWindow} from "@tauri-apps/api/window";

onMounted(() => {
  init();
});

const openAuto = () => {
  document.getElementById("searchinput")!.hidden = false;
  document.getElementById("items")!.style.overflow = "hidden";
}

const closeAuto = () => {
  document.getElementById("searchinput")!.hidden = true;
  document.getElementById("items")!.style.overflow = "auto";
}

const openGame = async () => {
 new WebviewWindow("game", {
    url: "#/game",
    center: true,
    minHeight: 600,
    minWidth: 800,
  });

}

const requestSearch = async() => {

}


</script>

