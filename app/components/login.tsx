import { ErrorBoundary } from "./error";
import Locale, { AllLangs, changeLang, getLang } from "../locales";
import ChatIcon from "../icons/chatgpt.svg"
import styles from "./login.module.scss";
import { IconButton } from "./button";
import { useUserStore } from "../store";
import { useState } from "react";


export function Login(){ 
  const userStore=useUserStore() 
  const [user, setUser] = useState("");
  const [status, setStatus] = useState("");
  const [password, setPassword] = useState("");

  const onUser = (text: string) => {
    setUser(text)
  };
  const onPassword = (text: string) => {
    setPassword(text)
  };

  const loginTo=()=>{
    userStore.login(user,password)
    setStatus("false")
    setTimeout(()=>{
      setStatus("")
    },4000)
  }

  return (
    <ErrorBoundary>
      <div className="window-header">
        <div className="window-header-title">
          <div className="window-header-main-title">
            {Locale.User.Login}
          </div>
          <div className="window-header-sub-title">
            {Locale.User.LoginTitle}
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
              placeholder={Locale.User.User}
              onInput={(e) => onUser(e.currentTarget.value)}
              value={user}
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
          <div>
            <span className={styles.wangji}><a href="/#/findpwd">{Locale.User.Findpwd}</a></span>
            <span className={styles.zhuce}><a href="/#/register">{Locale.User.Register}</a></span>
          </div>
          <div>
            <IconButton
              text={Locale.User.Login}
              disabled={!!status}
              className={styles.loginButton}
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