import { ErrorBoundary } from "./error";
import Locale, { AllLangs, changeLang, getLang } from "../locales";
import ChatIcon from "../icons/chatgpt.svg";
import styles from "./login.module.scss";
import { IconButton } from "./button";
import { useUserStore } from "../store";
import { useEffect, useState } from "react";
import Image from "next/image";
import { encrypt } from "../rsaEncrypt";

export function Login() {
  const userStore = useUserStore();
  const [user, setUser] = useState("");
  const [status, setStatus] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [img, setImg] = useState("");

  const onUser = (text: string) => {
    setUser(text);
  };
  const onPassword = (text: string) => {
    setPassword(text);
  };
  const onCode = (text: string) => {
    setCode(text);
  };

  const loginTo = async () => {
    setStatus("false");
    await userStore.login(user, String(encrypt(password)), code);
    setTimeout(() => {
      setStatus("");
    }, 4000);
    getCode();
  };

  async function getCode() {
    let img = await userStore.getCode();
    setImg(img);
  }

  useEffect(() => {
    getCode();
  }, []);

  return (
    <ErrorBoundary>
      <div className="window-header">
        <div className="window-header-title">
          <div className="window-header-main-title">{Locale.User.Login}</div>
          <div className="window-header-sub-title">
            {Locale.User.LoginTitle}
          </div>
        </div>
      </div>

      <div>
        <div className={styles.login}>
          <div>
            <ChatIcon></ChatIcon>
          </div>
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
              className={styles.password}
              placeholder={Locale.User.Password}
              onInput={(e) => onPassword(e.currentTarget.value)}
              value={password}
            ></input>
          </div>
          <div>
            <div className={styles.codeImg}>
              <input
                type="input"
                className={styles.code}
                placeholder={Locale.User.Code}
                onInput={(e) => onCode(e.currentTarget.value)}
                value={code}
              ></input>
              <Image
                src={img}
                alt="验证码"
                width={80}
                height={40}
                onClick={getCode}
              ></Image>
            </div>
          </div>
          <div>
            <span className={styles.wangji}>
              <a href="/#/findpwd">{Locale.User.Findpwd}</a>
            </span>
            <span className={styles.zhuce}>
              <a href="/#/register">{Locale.User.Register}</a>
            </span>
          </div>
          <div>
            <IconButton
              text={Locale.User.Login}
              disabled={!!status}
              className={styles.loginButton}
              onClick={() => {
                loginTo();
              }}
            ></IconButton>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
