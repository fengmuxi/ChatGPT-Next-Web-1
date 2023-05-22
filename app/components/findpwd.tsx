import { ErrorBoundary } from "./error";
import Locale from "../locales";
import ChatIcon from "../icons/chatgpt.svg"
import styles from "./findpwd.module.scss";
import { IconButton } from "./button";
import { useUserStore } from "../store";
import { useState } from "react";


export function FindPwd(){ 
  const [user, setUser] = useState("");
  const [status, setStatus] = useState("");

  const onUser = (text: string) => {
    setUser(text)
  };

  function findpwd(){
    useUserStore.getState().findPwd(user)
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
              placeholder={Locale.User.User}
              onInput={(e) => onUser(e.currentTarget.value)}
              value={user}
            ></input>
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