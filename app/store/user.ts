import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StoreKey } from "../constant";
import { showToast } from "../components/ui-lib";
import { useAccessStore } from "./access";
import { getHeaders } from "../requests";

export interface shuixianRes{
  code: number,
  msg: string,
  token: string,
  data:{
    name:string,
    head:string,
    signatrue:string,
    wallet:number,
    vip_state:string,
    vip_time_stmp:string,
    ban:string,
    sig_state:string,
    title:string,
    mail:string
  }
}

export interface UserStore {
    user:string;
    password:string;
    name:string;
    wallet:number;
    vip_state:string;
    vip_time_stmp:string;
    mail:string;
    sig_state:string;
    head:string;
    update: (updater: (user: UserInfo) => void) => void;
    login: (userName:string,password:string) => void;
    register: (user:string,password:string,name:string,mail:string,code:string) => void;
    getMailCode: (user:string,mail:string) => void;
    userSig: () => void;
    reset: () => void;
    updateUser: (user:string) => void;
    updatePassword: (password:string) => void;
    updateInfo: (
      name:string,
      wallet:number,
      vip_state:string,
      vip_time_stmp:string,
      mail:string,
      sig_state:string,
      head:string) => void;
    updateWallet:(wallet:number) => void;
    updateName:(name:string) => void;
    getUserInfo:() => void;
    findPwd:(user:string) => void;
    useKami:(code:string) => void;
}
export const DEFAULT_USER = {
    user:"",
    password:"",
    name:"",
    wallet:0,
    vip_state:"",
    vip_time_stmp:"",
    mail:"",
    sig_state:"",
    head:""
}
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
          name:string,
          wallet:number,
          vip_state:string,
          vip_time_stmp:string,
          mail:string,
          sig_state:string,
          head:string){
            set(()=>({
              name:name,
              wallet:wallet,
              vip_state:vip_state,
              vip_time_stmp:vip_time_stmp,
              mail:mail,
              sig_state:sig_state,
              head:head
            }))
        },
        reset() {
          set(() => ({ ...DEFAULT_USER }));
        },
        updateUser(user:string){
          set(() => ({ user:user }));
        },
        async updateName(name:string){
          let res=await fetch("/api/user/set?user="+get().user+"&project=name&projectName=name&data="+name,{
            method: "POST",
            headers:{
              ...getHeaders()
            }
          });
          let response = await res.json() as shuixianRes
          console.log(response)
          showToast(response.msg)
          if(response.code==1){
            await this.getUserInfo()
          }
        },
        updatePassword(password:string){
          set(() => ({ password:password }));
        },
        updateWallet(wallet:number){
          set(() => ({ wallet:get().wallet-wallet }));
        },
        async login(user, password) {
          let res=await fetch("/api/user/login?user="+user+"&password="+password,{
            method: "POST"
          });
          let response = await res.json() as shuixianRes
          console.log(response)
          if(response.code==1){
            useUserStore.getState().updateUser(user)
            useUserStore.getState().updatePassword(password)
            useAccessStore.getState().updateAuth(response.token)
            showToast(response.msg)
            setTimeout(()=>{
              window.location.href="/#/chat"
            },1000)
            await this.getUserInfo()
          }else{
            showToast(response.msg)
          }
        },
        async register(user, password, name, mail, code) {
          let res=await fetch("http://shuixian.ltd/main/api/user/register.php?admin="+process.env.ADMIN+"&key="+process.env.KEY+"&user="+user+"&password="+password+"&name="+name+"&mail="+mail+"&code="+code,{
            method: "POST"
          });
          let response = await res.json() as shuixianRes
          console.log(response)
          if(response.code==1){
            showToast(response.msg)
            setTimeout(()=>{
              window.location.href="/#/login"
            },1000)
          }else{
            showToast(response.msg)
          }
        },
        async getMailCode(user:string,mail:string) {
          let res=await fetch("/api/user/mail?user="+user+"&mail="+mail,{
            method: "POST"
          });
          let response = await res.json() as shuixianRes
          console.log(response)
          showToast(response.msg)
        },
        async userSig() {
          let res=await fetch("/api/user/sig?user="+get().user+"&password="+get().password,{
            method: "POST",
            headers:{
              ...getHeaders()
            }
          });
          let response = await res.json() as shuixianRes
          console.log(response)
          showToast(response.msg)
          if(response.code==1){
            await this.getUserInfo()
          }
        },
        async getUserInfo() {
          let resdata=await fetch("/api/user/info?user="+get().user+"&password="+get().password,{
            method: "POST",
            headers:{
              ...getHeaders()
            }
          });
          let responsedata=await resdata.json() as shuixianRes
          if(responsedata.code==1){
            let data=responsedata.data
          this.updateInfo(data.name,data.wallet,data.vip_state,data.vip_time_stmp,data.mail,data.sig_state,data.head)
          }else{
            showToast(responsedata.msg)
          }
        },
        async findPwd(user) {
          let res=await fetch("/api/user/findpwd?user="+user,{
            method: "POST",
            headers:{
              ...getHeaders()
            }
          });
          let response = await res.json() as shuixianRes
          console.log(response)
          if(response.code==1){
            showToast("密码已发送至您的邮箱，请注意查收！")
          }else{
            showToast(response.msg)
          }
        },
        async useKami(code) {
          let res=await fetch("/api/user/kami?user="+get().user+"&password="+get().password+"&code="+code,{
            method: "POST",
            headers:{
              ...getHeaders()
            }
          });
          let response = await res.json() as shuixianRes
          console.log(response)
          if(response.code==1){
            showToast(response.msg)
            await this.getUserInfo()
          }else{
            showToast(response.msg)
          }
        },
    }),
    {
      name: StoreKey.User,
      version: 1,
    },
  ),
);
