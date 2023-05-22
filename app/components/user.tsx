import { useState, useEffect } from "react";

import styles from "./user.module.scss";
import EditIcon from "../icons/edit.svg";
import { List, ListItem, Popover, showModal, showToast } from "./ui-lib";

import { IconButton } from "./button";
import {
  useAccessStore,
  useAppConfig,
} from "../store";

import Locale from "../locales";
import { Path } from "../constant";
import { ErrorBoundary } from "./error";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarPicker } from "./emoji";
import { useUserStore } from "../store/user";

export function User() {
  const navigate = useNavigate();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const config = useAppConfig();
  const updateConfig = config.update;

  const accessStore = useAccessStore();
  const userStor = useUserStore()

  const [userName, setUserName] = useState("");
  const [kami, setKami] = useState("");
  const onUserName = (text: string) => {
    setUserName(text)
    userStor.updateName(userName)
  };

  function getVipTime(){
    if(!userStor.vip_time_stmp){
      return ""
    }
    let time=new Date().getTime();
    console.log(time)
    time=time+Number(userStor.vip_time_stmp)*1000
    console.log(time)
    const date = new Date(time)
    const Y = date.getFullYear()
    const M = date.getMonth() + 1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1 
    const D = date.getDate()
    return `${Y} - ${M} - ${D}`
  }

  useEffect(()=>{
    setUserName(()=>{return userStor.name;})
  },[])

  useEffect(() => {
    const keydownEvent = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        navigate(Path.Home);
      }
    };
    document.addEventListener("keydown", keydownEvent);
    return () => {
      document.removeEventListener("keydown", keydownEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ErrorBoundary>
      <div className="window-header">
        <div className="window-header-title">
          <div className="window-header-main-title">
            {Locale.User.Title}
          </div>
          <div className="window-header-sub-title">
            {Locale.User.SubTitle}
          </div>
        </div>
      </div>
      <div className={styles["user"]}>
        <List>
          <ListItem title={Locale.Settings.Avatar}>
            <Popover
              onClose={() => setShowEmojiPicker(false)}
              content={
                <AvatarPicker
                  onEmojiClick={(avatar: string) => {
                    updateConfig((config) => (config.avatar = avatar));
                    setShowEmojiPicker(false);
                  }}
                />
              }
              open={showEmojiPicker}
            >
              <div
                className={styles.avatar}
                onClick={() => setShowEmojiPicker(true)}
              >
                <Avatar avatar={config.avatar} />
              </div>
            </Popover>
          </ListItem>

          <ListItem title={Locale.User.Name}>
          <input
              type="input"
              className={styles.name}
              value={userName}
              disabled={!accessStore.auth}
              onBlur={(e)=>{onUserName(e.currentTarget.value)}}
              onChange={(e)=>{setUserName(e.currentTarget.value)}}
            ></input>
          </ListItem>

          <ListItem title={Locale.User.Mail}>
          <span>{userStor.mail}</span>
          </ListItem>

          <ListItem title={Locale.User.Wallet}>
          <div className={styles.font} >
            剩余积分：<span className={styles.wallet}>{userStor.wallet}</span>
            </div>
          </ListItem>

          <ListItem title={Locale.User.Vip}>
            <div className={styles.font}>
              <div className={styles.vipState}>{userStor.vip_state=="已开通"?"VIP":"非VIP"}</div>
              <div className={styles.vipTime}>{getVipTime()}</div>
            </div>
          </ListItem>

          <ListItem title={Locale.User.kami}>
            <div>
              <input
                  type="input"
                  className={styles.kamicode}
                  value={kami}
                  onChange={(e)=>{setKami(e.currentTarget.value)}}>
                </input>
                <IconButton
                className={styles.kamiButton}
                disabled={!accessStore.auth}
                text="兑换"
                onClick={()=>{
                  userStor.useKami(kami)
                  setKami("")
                }}
              />
            </div>
          </ListItem>

          <ListItem title={Locale.User.SigState}>
                <IconButton
                icon={<EditIcon />}
                disabled={!accessStore.auth || userStor.sig_state=="已签到"}
                text="签到"
                onClick={()=>{
                  userStor.userSig()
                }}
              />
          </ListItem>

          <ListItem title={Locale.User.Ststus}>
                <IconButton
                className={styles.logoutButton}
                disabled={!accessStore.auth}
                text="登出"
                onClick={()=>{
                  accessStore.updateAuth("")
                  userStor.reset()
                  showToast("登出成功！")
                }}
              />
          </ListItem>
        </List>
      </div>
    </ErrorBoundary>
  );
}

