import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StoreKey } from "../constant";
import { showToast } from "../components/ui-lib";
import { useAccessStore } from "./access";
import { getHeaders } from "../requests";
import { encrypt } from "../rsaEncrypt";

export interface shuixianRes {
  code: number;
  msg: string;
  token: string;
  data: {
    name: string;
    head: string;
    signatrue: string;
    wallet: number;
    vip_state: string;
    vip_time_stmp: string;
    ban: string;
    sig_state: string;
    title: string;
    mail: string;
  };
}

function getLogin(){
  setTimeout(() => {
    window.location.href = "/#/login";
  }, 1000);
}

export interface eladminRes {
  data:object;
  flag:boolean;
  msg:string;
}

export interface codeRes {
  uuid:string;
  img:string;
}

export interface UserStore {
  user: string;
  password: string;
  name: string;
  wallet: number;
  vip_time: string;
  mail: string;
  sig_state: string;
  head: string;
  uuid: string;
  img: string;
  update: (updater: (user: UserInfo) => void) => void;
  login: (userName: string, password: string,code:string) => void;
  register: (
    user: string,
    password: string,
    name: string,
    mail: string,
    code: string,
  ) => void;
  getMailCode: (mail: string) => void;
  userSig: () => void;
  setUuidAndImg:(uuid:string,img:string) => void;
  getCode:() => any;
  reset: () => void;
  updateUser: (user: string) => void;
  updatePassword: (password: string) => void;
  updateInfo: (
    name: string,
    wallet: number,
    vip_time: string,
    mail: string,
    sig_state: string,
    head: string,
  ) => void;
  updateWallet: (wallet: number) => void;
  updateName: (name: string) => void;
  getUserInfo: () => void;
  findPwd: (user: string) => void;
  useKami: (code: string) => void;
}
export const DEFAULT_USER = {
  user: "",
  password: "",
  name: "",
  wallet: 0,
  vip_time: "",
  mail: "",
  sig_state: "",
  head: "",
  uuid:"",
  img:""
};
export type UserInfo = typeof DEFAULT_USER;
export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_USER,
      update(updater) {
        const config = { ...get() };
        updater(config);
        set(() => config);
      },
      updateInfo(
        name: string,
        wallet: number,
        vip_time: string,
        mail: string,
        sig_state: string,
        head: string,
      ) {
        set(() => ({
          name: name,
          wallet: wallet,
          vip_time: vip_time,
          mail: mail,
          sig_state: sig_state,
          head: head,
        }));
      },
      reset() {
        set(() => ({ ...DEFAULT_USER }));
      },
      updateUser(user: string) {
        set(() => ({ user: user }));
      },
      setUuidAndImg(uuid: string,img:string) {
        set(() => ({ uuid: uuid, img:img}));
      },
      async getCode() {
        let res = await fetch(
          "/api/user/code",
          {
            method: "POST",
            headers: {
              ...getHeaders(),
            },
          },
        );
        let response = (await res.json()) as codeRes;
        console.log(response);
        this.setUuidAndImg(response.uuid,response.img)
        return response.img
      },
      async updateName(name: string) {
        let res = await fetch(
          "/api/user/set?name="+name,
          {
            method: "POST",
            headers: {
              ...getHeaders(),
            },
          },
        );
        let response = (await res.json()) as eladminRes;
        console.log(response);
        showToast(response.msg);
        if (response.flag) {
          await this.getUserInfo();
        }else{
          if(response.msg=="未登录！"){
            getLogin()
          }
        }
      },
      updatePassword(password: string) {
        set(() => ({ password: password }));
      },
      updateWallet(wallet: number) {
        set(() => ({ wallet: get().wallet - wallet }));
      },
      async login(user, password,code) {
        let enPassword=encrypt(password);
        console.log(enPassword)
        let body={
          "username": user,
          "password": enPassword,
          "code": code,
          "uuid": get().uuid
        }
        let res = await fetch(
          "/api/user/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body:JSON.stringify(body)
          },
        );
        let response = (await res.json()) as eladminRes;
        console.log(response);
        if (response.flag) {
          useUserStore.getState().updateUser(user);
          useAccessStore.getState().updateAuth(response.data.token);
          showToast("登录成功！");
          setTimeout(() => {
            window.location.href = "/#/chat";
          }, 1000);
          await this.getUserInfo();
        } else {
          showToast("登录失败！");
        }
      },
      async register(user, password, name, mail, code) {
          let res = await fetch(
            "/api/user/register?user=" +
              user +
              "&password=" +
              password +
              "&name=" +
              name+"&mail="+mail+"&code="+code,
            {
              method: "POST",
            },
          );
          let response = (await res.json()) as eladminRes;
          console.log(response);
          if (response.flag) {
            showToast("注册成功");
            setTimeout(() => {
              window.location.href = "/#/login";
            }, 1000);
          } else {
            showToast(response.msg);
          }
      },
      async getMailCode(mail: string) {
        let res = await fetch("/api/user/mail?mail=" + mail, {
          method: "POST",
        });
        let response = (await res.json()) as eladminRes;
        console.log(response);
        showToast(response.msg);
      },
      async userSig() {
        let res = await fetch(
          "/api/user/sig",
          {
            method: "POST",
            headers: {
              ...getHeaders(),
            },
          },
        );
        let response = (await res.json()) as eladminRes;
        console.log(response);
        showToast(response.msg);
        if (response.flag) {
          await this.getUserInfo();
        }else{
          if(response.msg=="未登录！"){
            getLogin()
          }
        }
      },
      async getUserInfo() {
        let resdata = await fetch(
          "/api/user/info",
          {
            method: "POST",
            headers: {
              ...getHeaders(),
            },
          },
        );
        let responsedata = (await resdata.json()) as eladminRes;
        if (responsedata.flag) {
          let data = responsedata.data;
          this.updateInfo(
            data.nickName,
            data.wallet,
            data.vipTime,
            data.email,
            data.sigState,
            data.head,
          );
        } else {
          showToast(responsedata.msg);
          if(response.msg=="未登录！"){
            getLogin()
          }
        }
      },
      async findPwd(user) {
        let res = await fetch("/api/user/findpwd?user=" + user, {
          method: "POST",
          headers: {
            ...getHeaders(),
          },
        });
        let response = (await res.json()) as shuixianRes;
        console.log(response);
        if (response.code == 1) {
          showToast("密码已发送至您的邮箱，请注意查收！");
        } else {
          showToast(response.msg);
        }
      },
      async useKami(code) {
        let res = await fetch(
          "/api/user/kami?user=" +
            get().user +
            "&password=" +
            get().password +
            "&code=" +
            code,
          {
            method: "POST",
            headers: {
              ...getHeaders(),
            },
          },
        );
        let response = (await res.json()) as eladminRes;
        console.log(response);
        if (response.flag) {
          showToast(response.msg);
          await this.getUserInfo();
        } else {
          showToast(response.msg);
          if(response.msg=="未登录！"){
            getLogin()
          }
        }
      },
    }),
    {
      name: StoreKey.User,
      version: 1,
    },
  ),
);
