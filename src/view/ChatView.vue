<script setup lang = "ts">
import {onMounted} from "vue";
import {minimizeWindow, hideWindow} from "../common/WindowEvent";
import {
    selectUser,
    videoCall,
    sendMsg,
    init,
    user,
    msgObj,
    userIdx,
    chatHistory,
    userList,
} from "../script/ChatController";

onMounted(() => {
  init();
});

</script>

<template>
  <div data-tauri-drag-region class="titleBar">
    <div @click = "minimizeWindow()" class="titleBarBtn">
      <i class="iconfont iconMinus"></i>
    </div>
  </div>

  <div @click="hideWindow()" class="titleBar-btn closeBtn">
    <i class="iconfont iconClose"></i>
  </div>

  <div class="main">

    <div class = "sideBar">
     <img class="userAvatar" :src="user?.avatar" alt=""/>
      <div class="iconBox">
        <i class="iconfont iconChat"></i>
      </div>
    </div>

    <div class = "userList">

      <div class = "searchBox">
        <input type = "text" placeholder="Search">
      </div>

      <div class = "list">
        <div
            @click="selectUser(idx)"
            class = "item"
            :class="userIdx == idx ? 'active': ''"
            v-for="(item, idx) in userList"
            :key="idx"
          >
            <img class = "avatar" :src="item.avatar" alt=""/>
            <div>
              <h5>{{item.userName}}}</h5>
              <span class = "time">1 min ago</span>
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
            userIdx != -1 ? userList[userIdx].userName:""
          }}</span>
      </div>

      <div ref="record" class="record">
        <div
            :class="item.isSend == 1? 'self' : 'other'"
            v-for="(item,idx) in chatHistory"
            :key = "idx">
            <div v-if="item.isSend == 1" class="bubbleBox">
              {{ item.msg }}
            </div>
          <img
              class="avatar"
              :src="item.isSend == 1? user.avatar:item.senderAvatar"
              alt=""
          />
          <div v-if="item.isSend == 2" class="bubbleBox">
            {{ item.msg }}
          </div>
        </div>
      </div>

      <div class = "input">
          <div class="icon">
            <i @click = "videoCall(true)" class="iconfont icon-videoCall"></i>
          </div>
          <textarea v-model = "msgObj.msg" cols="30" rows="4"></textarea>
          <button @click="sendMsg()" class = "sendBtn">Send</button>
      </div>
      </div>
    </div>
</template>

<style lang="less" scoped>

.titleBar {
  height: 28px;
  user-select: none;
  display: flex;
  justify-content: flex-end;
  position: fixed;
  top: 0;
  right: 0;
  color: #494949;
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
  background: #e2e2e2;
}

.close-btn:hover {
  background: #fb7373;
  color: #ffffff;
}

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
        background: #ffffff;
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
      width: 100%;
      position: absolute;
      cursor: pointer;
      color: #0f0f0f;
      top: 20px;
      padding: 0 10px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      box-sizing: border-box;
      .iconfont {
        font-size: 18px;
        padding: 0 10px;
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
  background: #665dfe;
}
</style>