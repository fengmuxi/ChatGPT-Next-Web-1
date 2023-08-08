import { useState, useEffect } from "react";

import styles from "./user.module.scss";
import EditIcon from "../icons/edit.svg";
import { List, ListItem, Modal, Popover, showModal, showToast } from "./ui-lib";

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
import { encrypt } from "../rsaEncrypt";

function UserPwdModal(props: { onClose?: () => void }) {
  const useStor = useUserStore()
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [newPwd1, setNewPwd1] = useState('');

  async function updatePass():Promise<any>{
    if(newPwd!=newPwd1){
      showToast("两次输入的新密码不一致！")
      return false
    }
    if(oldPwd==newPwd1||oldPwd==newPwd){
      showToast("新密码与旧密码一致！")
      return false
    }
    await useStor.updatePass(String(encrypt(oldPwd)),String(encrypt(newPwd)))
  }

  return (
    <div className="modal-mask">
      <Modal
        title={Locale.User.Pass.Title}
        onClose={() => props.onClose?.()}
        actions={[
          <IconButton
            key="add"
            icon={<EditIcon />}
            onClick={()=>{
              updatePass().then(()=>{
                props.onClose?.()
              })
            }}
            bordered
            text={Locale.User.Save}
          />,
        ]}
      >
        <div>
          <List>
            <ListItem title={Locale.User.Pass.OldPwd}>
                <input
                  type="password"
                  className={styles.kamicode}
                  value={oldPwd}
                  onChange={(e)=>{setOldPwd(e.currentTarget.value)}}
                  >
                </input>
            </ListItem>
            <ListItem title={Locale.User.Pass.NewPwd}>
                <input
                  type="password"
                  className={styles.kamicode}
                  value={newPwd}
                  onChange={(e)=>{setNewPwd(e.currentTarget.value)}}
                  >
                </input>
            </ListItem>
            <ListItem title={Locale.User.Pass.NewPwd1}>
                <input
                  type="password"
                  className={styles.kamicode}
                  value={newPwd1}
                  onChange={(e)=>{setNewPwd1(e.currentTarget.value)}}
                  >
                </input>
            </ListItem>
          </List>
        </div>
      </Modal>
    </div>
  );
}

export function User() {
  const navigate = useNavigate();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [shouldShowPwdModal, setShowPwdModal] = useState(false);
  const config = useAppConfig();
  const updateConfig = config.update;

  const accessStore = useAccessStore();
  const useStor = useUserStore()

  const [userName, setUserName] = useState("");
  const [kami, setKami] = useState("");
  const onUserName = (text: string) => {
    setUserName(text)
    useStor.updateName(userName)
  };

  function getVip(){
    const curDate = new Date();
    const paramDate = new Date(useStor.vip_time.replace(/-/g, "/")); 
    console.log(paramDate);
    if (curDate >= paramDate) {
        return true;
    }
    return false;
  }

  function getVipTime(){
    let time = String(new Date());
    if(useStor.vip_time!=null || useStor.vip_time!=''){
      console.log(useStor.vip_time)
      time=useStor.vip_time
    }
    const date = new Date(time)
    const Y = date.getFullYear()
    const M = date.getMonth() + 1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1 
    const D = date.getDate()
    return `${Y} - ${M} - ${D}`
  }

  useEffect(()=>{
    if(accessStore.auth){
      useStor.getUserInfo()
    }
    setUserName(useStor.name)
  },[useStor,accessStore])

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
          <span>{useStor.mail}</span>
          </ListItem>

          <ListItem title={Locale.User.Wallet}>
          <div className={styles.font} >
            剩余积分：<span className={styles.wallet}>{useStor.wallet}</span>
            </div>
          </ListItem>

          <ListItem title={Locale.User.Vip}>
            <div className={styles.font}>
              <div className={styles.vipState}>{getVip()?"非会员":"会员"}</div>
              <div className={styles.vipTime}>{getVipTime()}</div>
            </div>
          </ListItem>
          </List>

          <List>
          <ListItem title={Locale.User.kami}>
            <div className={styles.kamidiv}>
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
                  useStor.useKami(kami)
                  setKami("")
                }}
              />
            </div>
          </ListItem>

          <ListItem title="充值">
                <IconButton
                text="购买卡密"
                onClick={()=>{
                  window.location.href="https://qtka.scgzfw.cn/links/879AEC7D"
                }}
              />
          </ListItem>

          <ListItem title={Locale.User.SigState}>
                <IconButton
                disabled={!accessStore.auth}
                text="签到(送积分)"
                onClick={()=>{
                  useStor.userSig()
                }}
              />
          </ListItem>
          <ListItem title={Locale.User.Pass.Title}>
                <IconButton
                disabled={!accessStore.auth}
                text={Locale.User.Pass.Title}
                onClick={()=>{
                  setShowPwdModal(true)
                }}
              />
          </ListItem>
          </List>

          <List>
          <ListItem title="QQ频道">
                <IconButton
                className={styles.qqButton}
                text="加入"
                onClick={()=>{
                  window.location.href="https://pd.qq.com/s/e1veynn5h"
                }}
              />
          </ListItem>
            <ListItem title={Locale.User.Ststus}>
                <IconButton
                className={styles.logoutButton}
                disabled={!accessStore.auth}
                text="登出"
                onClick={()=>{
                  useStor.logOut().then(()=>{
                    accessStore.updateAuth("")
                    setUserName("")
                  })
                  showToast("登出成功！")
                }}
              />
          </ListItem>
          </List>
          {shouldShowPwdModal && (
          <UserPwdModal onClose={() => setShowPwdModal(false)} />
        )}
      </div>
    </ErrorBoundary>
  );
}

