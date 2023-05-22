import { ErrorBoundary } from "./error";
import Locale, { AllLangs, changeLang, getLang } from "../locales";
import { useUserStore } from "../store";
import { useEffect, useState } from "react";
import styles from "./register.module.scss";
import ChatIcon from "../icons/chatgpt.svg"
import { IconButton } from "./button";
import { showToast } from "./ui-lib";

export function Register(){
  const userStore=useUserStore() 
  const [userName, setUserName] = useState("");
  const [getcode, setgetcode] = useState("");
  const [codeStatus, setcodeStatus] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [mail, setMail] = useState("");
  const [code, setCode] = useState("");

  const onUserName = (text: string) => {
    setUserName(text)
  };
  const onName = (text: string) => {
    setName(text)
  };
  const onPassword = (text: string) => {
    setPassword(text)
  };
  const onMail = (text: string) => {
    setMail(text)
  };
  const onCode = (text: string) => {
    setCode(text)
  };

  const loginTo=()=>{
    userStore.register(userName,password,name,mail,code)
  }

  const getMailCode=()=>{
    userStore.getMailCode(userName,mail)
    getCode()
  }
  var countdown=60;
  const getCode=()=>{
      if (countdown == 0) {
          setcodeStatus("")
          setgetcode("发送验证码")
          countdown = 60;
          return;
      } else {
          setcodeStatus("true")
          setgetcode("(" + countdown + ")")
          countdown--;
      }
      setTimeout(function() {
              getCode() }
          ,1000)
  }

  useEffect(()=>{
    setcodeStatus("")
    setgetcode("发送验证码")
  },[])

  return (
    <ErrorBoundary>
      <div className="window-header">
        <div className="window-header-title">
          <div className="window-header-main-title">
            {Locale.User.Register}
          </div>
          <div className="window-header-sub-title">
            {Locale.User.RegisterTitle}
          </div>
        </div>
      </div>

      <div>
        <div className={styles.register}>
          <div><ChatIcon></ChatIcon></div>
          <div>
            <input
              type="input"
              className={styles.name}
              placeholder="呢称"
              onInput={(e) => onName(e.currentTarget.value)}
              value={name}
            ></input>
          </div>
          <div>
            <input
              type="input"
              className={styles.name}
              placeholder="账号 (纯数字)"
              onInput={(e) => onUserName(e.currentTarget.value)}
              value={userName}
            ></input>
          </div>
          <div>
            <input
              type="password"
              className={styles.name}
              placeholder="密码 (最少六位)"
              onInput={(e) => onPassword(e.currentTarget.value)}
              value={password}
            ></input>
          </div>
          <div>
            <input
              type="input"
              className={styles.name}
              placeholder="邮箱"
              onInput={(e) => onMail(e.currentTarget.value)}
              value={mail}
            ></input>
          </div>
          <div className={styles.codebox}>
            <input
              type="input"
              className={styles.code}
              placeholder="验证码"
              onInput={(e) => onCode(e.currentTarget.value)}
              value={code}
            ></input>
            <IconButton
              disabled={!!codeStatus}
              text={getcode}
              className={styles.codeButton}
              onClick={()=>{
                getMailCode()
              }}
            ></IconButton>
          </div>
          <div>
            <span className={styles.wangji}><a href="/#/findpwd">忘记密码</a></span>
            <span className={styles.zhuce}><a href="/#/login">登录</a></span>
          </div>
          <div>
            <IconButton
              text="注册"
              className={styles.registerButton}
              onClick={()=>{
                loginTo()
              }}
            ></IconButton>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}