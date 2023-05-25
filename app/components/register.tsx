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
  const [status, setStatus] = useState("");

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

  const registerTo=()=>{
    userStore.register(userName,password,name,mail,code)
    setStatus("false")
    setTimeout(()=>{
      setStatus("")
    },4000)
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
          <div className={styles.title}>账号为QQ号将自动绑定QQ邮箱方便找回密码</div>
          <div>
            <input
              type="input"
              className={styles.name}
              placeholder={Locale.User.NickName}
              onInput={(e) => onName(e.currentTarget.value)}
              value={name}
            ></input>
          </div>
          <div>
            <input
              type="input"
              className={styles.name}
              placeholder={Locale.User.User}
              onInput={(e) => onUserName(e.currentTarget.value)}
              value={userName}
            ></input>
          </div>
          <div>
            <input
              type="password"
              className={styles.name}
              placeholder={Locale.User.Password}
              onInput={(e) => onPassword(e.currentTarget.value)}
              value={password}
            ></input>
          </div>
          {/* <div>
            <input
              type="input"
              className={styles.name}
              placeholder={Locale.User.Email}
              onInput={(e) => onMail(e.currentTarget.value)}
              value={mail}
            ></input>
          </div>
          <div className={styles.codebox}>
            <input
              type="input"
              className={styles.code}
              placeholder={Locale.User.Code}
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
          </div> */}
          <div>
            <span className={styles.wangji}><a href="/#/findpwd">{Locale.User.Findpwd}</a></span>
            <span className={styles.zhuce}><a href="/#/login">{Locale.User.Login}</a></span>
          </div>
          <div>
            <IconButton
              text={Locale.User.Register}
              disabled={!!status}
              className={styles.registerButton}
              onClick={()=>{
                registerTo()
              }}
            ></IconButton>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}