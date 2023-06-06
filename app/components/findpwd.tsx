import { ErrorBoundary } from "./error";
import Locale from "../locales";
import ChatIcon from "../icons/chatgpt.svg"
import styles from "./findpwd.module.scss";
import { IconButton } from "./button";
import { useUserStore } from "../store";
import { useEffect, useState } from "react";


export function FindPwd(){ 
  const userStore=useUserStore() 
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [code, setCode] = useState("");
  const [codeStatus, setcodeStatus] = useState("");
  const [getcode, setgetcode] = useState("");

  const onEmail = (text: string) => {
    setEmail(text)
  };

  const onCode = (text: string) => {
    setCode(text)
  };

  async function findpwd(){
    setStatus("false")
    await useUserStore.getState().findPwd(email,code)
    setTimeout(()=>{
      setStatus("")
    },4000)
  }

  const getMailCode=()=>{
    userStore.getRestPwdCode(email)
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
            {Locale.User.Findpwd}
          </div>
          <div className="window-header-sub-title">
            {Locale.User.FindpwdTitle}
          </div>
        </div>
      </div>

      <div>
        <div className={styles.login}>
          <div><ChatIcon></ChatIcon></div>
          <div>
            <input
              type="input"
              className={styles.name}
              placeholder={Locale.User.Email}
              onInput={(e) => onEmail(e.currentTarget.value)}
              value={email}
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
          </div>
          <div>
            <span className={styles.wangji}><a href="/#/login">{Locale.User.Login}</a></span>
            <span className={styles.zhuce}><a href="/#/register">{Locale.User.Register}</a></span>
          </div>
          <div>
            <IconButton
              text={Locale.User.Findpwd}
              disabled={!!status}
              className={styles.loginButton}
              onClick={()=>{
                findpwd()
              }}
            ></IconButton>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}